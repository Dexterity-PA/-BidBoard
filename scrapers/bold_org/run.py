"""
Bold.org scholarship scraper — entry point.

Usage:
  python -m scrapers.bold_org.run [--limit N] [--dry-run]

Slug discovery:
  1. Fetch https://bold.org/sitemap.xml once (cached to slugs.txt)
  2. Filter slugs already in DB
  3. Scrape remaining detail pages with 5 concurrent workers
"""
import argparse
import asyncio
import json
import logging
import os
import random
import sys
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

from .db import fetch_inserted_rows, get_db_connection, get_existing_slugs, upsert_scholarship
from .parser import parse_detail_page, slugs_from_sitemap

# ---------------------------------------------------------------------------
# Paths and constants
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent.parent
SLUGS_FILE = SCRIPT_DIR / "slugs.txt"
FAILED_FILE = SCRIPT_DIR / "failed.jsonl"
PROGRESS_FILE = SCRIPT_DIR / ".progress"

SITEMAP_URL = "https://bold.org/sitemap.xml"
DETAIL_URL = "https://bold.org/scholarships/{slug}/"
CONCURRENCY = 5

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Checkpoint helpers
# ---------------------------------------------------------------------------


def write_failure(slug: str, url: str, reason: str) -> None:
    try:
        with open(FAILED_FILE, "a") as f:
            f.write(json.dumps({"slug": slug, "url": url, "reason": reason}) + "\n")
    except OSError:
        pass


def load_offset() -> int:
    if PROGRESS_FILE.exists():
        try:
            return int(PROGRESS_FILE.read_text().strip())
        except (ValueError, OSError):
            pass
    return 0


def save_offset(n: int) -> None:
    try:
        PROGRESS_FILE.write_text(str(n))
    except OSError as e:
        logger.warning("Could not save progress: %s", e)


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


async def fetch(client: httpx.AsyncClient, url: str, max_retries: int = 3) -> Optional[str]:
    for attempt in range(max_retries):
        try:
            resp = await client.get(url, follow_redirects=True)

            if resp.status_code == 200:
                return resp.text

            if resp.status_code == 429:
                wait = 60 * (attempt + 1)
                logger.warning("Rate limited (429) on %s — sleeping %ds", url, wait)
                await asyncio.sleep(wait)
                continue

            if resp.status_code in (403, 503):
                body = resp.text.lower()
                if "cloudflare" in body or "cf-ray" in resp.headers:
                    logger.error("Cloudflare challenge detected on %s — halting", url)
                    sys.exit(1)
                logger.warning("Access denied (%d) for %s", resp.status_code, url)
                return None

            if resp.status_code == 404:
                logger.debug("404 for %s", url)
                return None

            if resp.status_code >= 500:
                wait = (2**attempt) * 5
                logger.warning("Server error %d on %s — retry in %ds", resp.status_code, url, wait)
                await asyncio.sleep(wait)
                continue

            logger.warning("Unexpected status %d for %s", resp.status_code, url)
            return None

        except httpx.TimeoutException:
            wait = (2**attempt) * 3
            logger.warning("Timeout on %s — retry in %ds", url, wait)
            await asyncio.sleep(wait)
        except httpx.HTTPError as e:
            wait = (2**attempt) * 3
            logger.warning("HTTP error on %s: %s — retry in %ds", url, e, wait)
            await asyncio.sleep(wait)

    return None


# ---------------------------------------------------------------------------
# Sitemap slug loading
# ---------------------------------------------------------------------------


async def load_slugs(client: httpx.AsyncClient) -> list[str]:
    """Return all Bold.org scholarship slugs. Reads from slugs.txt cache if present."""
    if SLUGS_FILE.exists():
        slugs = [s.strip() for s in SLUGS_FILE.read_text().splitlines() if s.strip()]
        logger.info("Loaded %d slugs from %s", len(slugs), SLUGS_FILE)
        return slugs

    logger.info("Fetching sitemap from %s …", SITEMAP_URL)
    xml = await fetch(client, SITEMAP_URL)
    if not xml:
        logger.error("Failed to fetch sitemap — cannot proceed")
        sys.exit(1)

    slugs = slugs_from_sitemap(xml)
    logger.info("Sitemap: found %d scholarship slugs", len(slugs))

    SLUGS_FILE.write_text("\n".join(slugs))
    logger.info("Saved slug list to %s", SLUGS_FILE)
    return slugs


# ---------------------------------------------------------------------------
# Per-scholarship worker
# ---------------------------------------------------------------------------


async def scrape_one(
    client: httpx.AsyncClient,
    slug: str,
    sem: asyncio.Semaphore,
    dry_run: bool,
    conn,
) -> Optional[dict]:
    url = DETAIL_URL.format(slug=slug)
    async with sem:
        await asyncio.sleep(random.uniform(1.0, 2.0))
        html = await fetch(client, url)

    if html is None:
        write_failure(slug, url, "fetch_failed")
        return None

    data = parse_detail_page(html, slug)
    if not data or not data.get("name"):
        logger.debug("Parse failed for %s", slug)
        write_failure(slug, url, "parse_failed")
        return None

    if dry_run:
        return data

    try:
        action = upsert_scholarship(conn, data)
        return {**data, "_action": action}
    except Exception as e:
        logger.error("DB error for %s: %s", slug, e)
        write_failure(slug, url, f"db_error:{e}")
        return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


async def run(limit: Optional[int], dry_run: bool) -> None:
    load_dotenv(REPO_ROOT / ".env")
    if not os.environ.get("DATABASE_URL"):
        load_dotenv(REPO_ROOT / ".env.local")

    database_url = os.environ.get("DATABASE_URL")
    if not database_url and not dry_run:
        logger.error("DATABASE_URL not found in .env or .env.local")
        sys.exit(1)

    conn = None
    existing_slugs: set[str] = set()

    if not dry_run:
        conn = get_db_connection(database_url)
        conn.autocommit = True
        existing_slugs = get_existing_slugs(conn)
        logger.info("Found %d existing bold.org scholarships in DB", len(existing_slugs))

    sem = asyncio.Semaphore(CONCURRENCY)
    counters = {"processed": 0, "inserted": 0, "updated": 0, "skipped": 0, "failed": 0}
    inserted_slugs: list[str] = []

    async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
        all_slugs = await load_slugs(client)

        # Filter already-scraped
        new_slugs = [s for s in all_slugs if f"bold-{s}" not in existing_slugs]
        counters["skipped"] = len(all_slugs) - len(new_slugs)
        logger.info(
            "Total: %d slugs | %d already in DB | %d to scrape",
            len(all_slugs), counters["skipped"], len(new_slugs),
        )

        # Resume from offset checkpoint
        offset = load_offset()
        if offset > 0:
            logger.info("Resuming from offset %d", offset)
            new_slugs = new_slugs[offset:]

        # Apply --limit
        if limit is not None:
            new_slugs = new_slugs[:limit]

        tasks = [scrape_one(client, slug, sem, dry_run, conn) for slug in new_slugs]

        for i, coro in enumerate(asyncio.as_completed(tasks)):
            result = await coro
            processed_offset = offset + i + 1

            if result is None:
                counters["failed"] += 1
            elif dry_run:
                counters["processed"] += 1
                logger.info(
                    "[DRY RUN] %-45s | %-35s | $%-8s | %s",
                    result.get("slug", ""),
                    (result.get("name") or "")[:35],
                    result.get("amount_max") or "?",
                    result.get("deadline") or "—",
                )
            else:
                action = result.pop("_action", "unknown")
                counters["processed"] += 1
                if action == "inserted":
                    counters["inserted"] += 1
                    inserted_slugs.append(result["slug"])
                    existing_slugs.add(result["slug"])
                elif action == "updated":
                    counters["updated"] += 1

            save_offset(processed_offset)

            total_done = counters["processed"] + counters["failed"]
            if total_done > 0 and total_done % 50 == 0:
                logger.info(
                    "Progress: %d processed | %d inserted | %d updated | %d failed",
                    counters["processed"], counters["inserted"],
                    counters["updated"], counters["failed"],
                )

    if conn:
        conn.close()

    logger.info(
        "Done: %d processed | %d inserted | %d updated | %d skipped | %d failed",
        counters["processed"], counters["inserted"],
        counters["updated"], counters["skipped"], counters["failed"],
    )

    # Verification: show sample of inserted rows
    if not dry_run and inserted_slugs:
        sample = inserted_slugs[-min(10, len(inserted_slugs)):]
        verify_conn = get_db_connection(os.environ["DATABASE_URL"])
        rows = fetch_inserted_rows(verify_conn, sample)
        verify_conn.close()
        if rows:
            logger.info("\n--- Inserted rows sample (%d) ---", len(rows))
            for r in rows:
                logger.info(
                    "id=%-5d %-40s %-35s $%-8s %s",
                    r["id"], r["slug"], (r["name"] or "")[:35],
                    r["amount_max"] or "?", r["deadline"] or "?",
                )


def main() -> None:
    ap = argparse.ArgumentParser(description="Scrape Bold.org scholarships into BidBoard DB")
    ap.add_argument("--limit", type=int, default=None, help="Max scholarships to scrape")
    ap.add_argument("--dry-run", action="store_true", help="Parse and print without writing to DB")
    args = ap.parse_args()
    asyncio.run(run(args.limit, args.dry_run))


if __name__ == "__main__":
    main()
