"""Bold.org detail page HTML parser using selectolax CSS selectors + text anchoring.

No __NEXT_DATA__ (site uses Next.js RSC). No API calls. Pure rendered HTML.
Every field extraction is wrapped so a single field failure never crashes the scholarship.
"""
import hashlib
import logging
import re
from datetime import date
from typing import Optional

from dateutil import parser as dateparser
from selectolax.parser import HTMLParser

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Grade level normalization
# ---------------------------------------------------------------------------

_GRADE_LEVEL_MAP = [
    ("high school", "high_school"),
    ("highschool", "high_school"),
    ("undergraduate", "undergraduate"),
    ("college", "undergraduate"),
    ("bachelor", "undergraduate"),
    ("graduate", "graduate"),
    ("master", "graduate"),
    ("phd", "graduate"),
    ("doctoral", "graduate"),
    ("post", "graduate"),
    ("any", "any"),
    ("all", "any"),
    ("open", "any"),
]


def normalize_grade_level(raw: str) -> Optional[str]:
    s = raw.strip().lower()
    for key, val in _GRADE_LEVEL_MAP:
        if key in s:
            return val
    return None


# ---------------------------------------------------------------------------
# Sitemap slug extraction
# ---------------------------------------------------------------------------

def slugs_from_sitemap(xml: str) -> list[str]:
    """Return all scholarship slugs from the Bold.org sitemap XML."""
    urls = re.findall(r"<loc>(https://bold\.org/scholarships/([^/]+)/)</loc>", xml)
    _skip_prefixes = ("by-state", "by-major", "by-year", "by-demographics", "by-type", "by-ethnicity")
    seen: set[str] = set()
    result: list[str] = []
    for _, slug in urls:
        if not slug:
            continue
        if slug.isdigit():  # pagination pages like /scholarships/109/
            continue
        if any(slug.startswith(p) for p in _skip_prefixes):
            continue
        if slug not in seen:
            result.append(slug)
            seen.add(slug)
    return result


# ---------------------------------------------------------------------------
# Detail page parser — public entry point
# ---------------------------------------------------------------------------

def parse_detail_page(html: str, slug: str) -> Optional[dict]:
    """
    Parse a Bold.org scholarship detail page from rendered HTML.
    Returns a dict ready for upsert, or None if h1 is missing (page error/redirect).
    Every sub-field is isolated so a single failure returns None for that field only.
    """
    try:
        tree = HTMLParser(html)
        if not tree.body:
            return None
        body_text = _normalize_ws(tree.body.text())

        h1 = tree.css_first("h1")
        if not h1:
            return None
        name = _normalize_ws(h1.text())
        if not name:
            return None

        provider, provider_url = _safe(lambda: _parse_provider(tree), ("Bold.org", None))
        amount_min, amount_max = _safe(lambda: _parse_amounts(tree, body_text), (None, None))
        deadline = _safe(lambda: _parse_label_date(body_text, [
            "Application Deadline", "Next Application Deadline", "Next Deadline",
        ]), None)
        winners_announced_date = _safe(lambda: _parse_label_date(body_text, [
            "Winners announced on:", "Winners Announced", "Next Winners Announced",
        ]), None)
        eligible_grade_levels = _safe(lambda: _parse_education_levels(body_text), [])
        description = _safe(lambda: _parse_description(tree), None)
        essay_prompt, essay_word_limit, essay_prompts_list = _safe(lambda: _parse_essay(body_text), (None, None, []))
        requires_essay = bool(essay_prompts_list)
        category = _safe(lambda: _parse_category(tree), None)

        final_slug = f"bold-{slug}"
        if len(final_slug) > 100:
            final_slug = final_slug[:90] + "-" + hashlib.md5(final_slug.encode()).hexdigest()[:9]

        return {
            "name": name,
            "provider": provider or "Bold.org",
            "provider_url": provider_url,
            "description": description,
            "amount_min": amount_min,
            "amount_max": amount_max,
            "deadline": deadline,
            "opens_date": None,
            "winners_announced_date": winners_announced_date,
            "application_url": f"https://bold.org/scholarships/{slug}/",
            "eligible_grade_levels": eligible_grade_levels if eligible_grade_levels else None,
            "requires_essay": requires_essay,
            "essay_prompt": essay_prompt,
            "essay_word_limit": essay_word_limit,
            "essay_prompts": essay_prompts_list if essay_prompts_list else None,
            "category": category,
            "source": "bold.org",
            "source_url": f"https://bold.org/scholarships/{slug}/",
            "slug": final_slug,
            "is_active": True,
            "is_verified": False,
        }
    except Exception as e:
        logger.warning("Unexpected parse error for %s: %s", slug, e)
        return None


# ---------------------------------------------------------------------------
# Sub-parsers
# ---------------------------------------------------------------------------

def _parse_provider(tree: HTMLParser) -> tuple[str, Optional[str]]:
    """Find provider name from the /donor/ link that is NOT the 'Funded by' label."""
    for a in tree.css("a[href*='/donor/']"):
        text = _normalize_ws(a.text())
        if text and text.lower() not in ("funded by", ""):
            href = a.attributes.get("href", "")
            url = f"https://bold.org{href}" if href.startswith("/") else (href or None)
            return text, url
    return "Bold.org", None


def _parse_amounts(tree: HTMLParser, body_text: str) -> tuple[Optional[int], Optional[int]]:
    """
    Derive per-winner amount.
    Bold.org shows the headline scholarship amount in a large text-[40px] div.
    Winner count is searched only in the sidebar card (near 'Funded by'), NOT in the
    past-winners section ('Winners and Finalists'), to avoid dividing by past recipient counts.
    """
    # Headline amount: the big display div
    headline: Optional[int] = None
    el = tree.css_first('div[class*="text-[40px]"]')
    if el:
        m = re.search(r"\$([0-9,]+)", el.text(strip=True))
        if m:
            headline = _clean_amt(m.group(1))

    if not headline:  # None or 0 are both invalid
        return None, None

    # Limit winner-count search to sidebar region (between 'Funded by' and 'Apply Now' / 'About')
    card_region = body_text
    for start_label in ("Funded by", "Application deadline", "Application Deadline"):
        s = body_text.find(start_label)
        if s >= 0:
            card_region = body_text[s:]
            break
    for end_label in ("About ", "Apply Now", "Scholarship Timeline"):
        e = card_region.find(end_label)
        if e > 0:
            card_region = card_region[:e]
            break
    card_region = card_region[:400]  # safety cap

    # Strip dollar amounts from card region so "$5001 winner" (=$500 + "1 winner" concatenated)
    # doesn't make the winner count look like 5001.
    clean_region = re.sub(r"\$[0-9,]+", "", card_region)

    # "N winners, $X each" → use per-winner directly
    m = re.search(r"(\d+)\s+winners?,\s*\$([0-9,]+)\s+each", card_region, re.IGNORECASE)
    if m:
        per = _clean_amt(m.group(2))
        cents = per * 100 if per is not None else None
        return cents, cents

    # Winner count in card region → derive per-winner
    wm = re.search(r"(\d+)\s+winner", clean_region, re.IGNORECASE)
    if wm:
        n = max(int(wm.group(1)), 1)
        per = headline // n
        return per * 100, per * 100

    return headline * 100, headline * 100


def _parse_label_date(body_text: str, labels: list[str]) -> Optional[date]:
    """Extract date that immediately follows a label string in body text (case-insensitive)."""
    body_lower = body_text.lower()
    for label in labels:
        idx = body_lower.find(label.lower())
        if idx < 0:
            continue
        after = body_text[idx + len(label) : idx + len(label) + 80]
        # Match common date formats: "Jun 18, 2025", "2025-06-18", "June 2025"
        m = re.match(
            r"\s*([A-Za-z]+ \d{1,2},?\s*\d{4}|[A-Za-z]+ \d{4}|\d{4}-\d{2}-\d{2})",
            after,
        )
        if m:
            try:
                return dateparser.parse(m.group(1).strip(), fuzzy=True).date()
            except Exception:
                pass
    return None


def _parse_education_levels(body_text: str) -> list[str]:
    """Parse education levels from 'Education LevelX, Y, Z' text (case-insensitive)."""
    idx = body_text.lower().find("education level")
    if idx < 0:
        return []
    after = body_text[idx + len("Education Level") :]
    # Stop at known section boundaries
    stop = len(after)
    for boundary in ("Share", "Eligibility Requirements", "Application Deadline", "Funded by"):
        s = after.find(boundary)
        if 0 < s < stop:
            stop = s
    raw = after[:stop].strip()
    if not raw or len(raw) > 200:
        return []
    levels: list[str] = []
    seen: set[str] = set()
    for part in re.split(r"[,;/]", raw):
        n = normalize_grade_level(part)
        if n and n not in seen:
            levels.append(n)
            seen.add(n)
    return levels


def _parse_description(tree: HTMLParser) -> Optional[str]:
    """
    Grab description paragraphs from the main content.
    Uses the <p> elements in main that are long enough and not boilerplate.
    """
    main = tree.css_first("main")
    if not main:
        return None
    _boilerplate = {
        "bold.org is 100% free for all users.",
        "bold.org is 100% free for students and donors",
    }
    paragraphs: list[str] = []
    for p in main.css("p"):
        text = _normalize_ws(p.text())
        low = text.lower()
        if len(text) > 40 and not any(b in low for b in _boilerplate):
            paragraphs.append(text)
        if len(paragraphs) >= 4:
            break
    return "\n\n".join(paragraphs) if paragraphs else None


def _parse_essay(body_text: str) -> tuple[Optional[str], Optional[int], list[dict]]:
    """
    Extract essay prompt and word limit from 'Essay Topic...' section.
    Returns (prompt_text, word_limit, [{"prompt":..., "word_limit":...}]).
    """
    idx = body_text.find("Essay Topic")
    if idx < 0:
        return None, None, []
    after = body_text[idx + len("Essay Topic") :]

    # Stop at next section
    stop = len(after)
    for boundary in ("Winners and Finalists", "About ", "Eligibility Requirements",
                      "Scholarship Timeline", "Previous Winners", "FAQ"):
        s = after.find(boundary)
        if 0 < s < stop:
            stop = s
    raw = after[:min(stop, 800)].strip()
    if not raw:
        return None, None, []

    # Extract word limit (e.g. "400–600 words" or "500 words max")
    word_limit: Optional[int] = None
    prompt_text = raw

    m = re.search(r"(\d+)\s*[–\-]+\s*(\d+)\s*words?", raw)
    if m:
        word_limit = int(m.group(2))  # store max
        prompt_text = raw[: m.start()].strip()
    else:
        m2 = re.search(r"(\d+)\s*words?\s*(?:max|maximum|limit|or fewer|or less)", raw, re.IGNORECASE)
        if m2:
            word_limit = int(m2.group(1))
            prompt_text = raw[: m2.start()].strip()

    if not prompt_text:
        return None, None, []

    entry: dict = {"prompt": prompt_text}
    if word_limit:
        entry["word_limit"] = word_limit

    return prompt_text, word_limit, [entry]


def _parse_category(tree: HTMLParser) -> Optional[str]:
    """First button-styled category link below the scholarship content."""
    for a in tree.css("a[class*='button-primary'][href*='/scholarships/']"):
        text = _normalize_ws(a.text())
        if text and "view all" not in text.lower():
            return text
    # Fallback: any scholarship group link in the content
    for a in tree.css("main a[href*='/scholarships/by-']"):
        text = _normalize_ws(a.text())
        if text and len(text) < 60:
            return text
    return None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_ws(text: str) -> str:
    """Collapse whitespace and strip."""
    return re.sub(r"\s+", " ", text or "").strip()


def _clean_amt(s: str) -> Optional[int]:
    cleaned = re.sub(r"[^\d]", "", s)
    try:
        return int(cleaned) if cleaned else None
    except ValueError:
        return None


def _safe(fn, default):
    """Call fn(), return default on any exception."""
    try:
        return fn()
    except Exception as e:
        logger.debug("Field parse error: %s", e)
        return default
