"""Database upsert logic for Bold.org scholarships."""
import logging
from datetime import datetime, timezone
from typing import Optional

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

logger = logging.getLogger(__name__)


def get_db_connection(database_url: str) -> psycopg.Connection:
    return psycopg.connect(database_url, row_factory=dict_row)


def get_existing_slugs(conn: psycopg.Connection) -> set[str]:
    with conn.cursor() as cur:
        cur.execute("SELECT slug FROM scholarships WHERE slug LIKE 'bold-%'")
        return {row["slug"] for row in cur.fetchall()}


def upsert_scholarship(conn: psycopg.Connection, data: dict) -> str:
    """
    Upsert a scholarship. Returns 'inserted' or 'updated'.
    Raises on DB error — caller should catch and log.
    """
    now = datetime.now(timezone.utc)
    essay_prompts_val = Jsonb(data["essay_prompts"]) if data.get("essay_prompts") else None

    sql = """
        INSERT INTO scholarships (
            name, provider, provider_url, description,
            amount_min, amount_max,
            deadline, opens_date, winners_announced_date,
            application_url,
            eligible_grade_levels,
            requires_essay, essay_prompt, essay_word_limit, essay_prompts,
            category,
            source, source_url, slug,
            is_active, is_verified, last_verified,
            created_at, updated_at
        ) VALUES (
            %(name)s, %(provider)s, %(provider_url)s, %(description)s,
            %(amount_min)s, %(amount_max)s,
            %(deadline)s, %(opens_date)s, %(winners_announced_date)s,
            %(application_url)s,
            %(eligible_grade_levels)s,
            %(requires_essay)s, %(essay_prompt)s, %(essay_word_limit)s, %(essay_prompts)s,
            %(category)s,
            %(source)s, %(source_url)s, %(slug)s,
            %(is_active)s, %(is_verified)s, %(last_verified)s,
            %(now)s, %(now)s
        )
        ON CONFLICT (slug) DO UPDATE SET
            name                   = EXCLUDED.name,
            description            = EXCLUDED.description,
            amount_min             = EXCLUDED.amount_min,
            amount_max             = EXCLUDED.amount_max,
            deadline               = EXCLUDED.deadline,
            opens_date             = EXCLUDED.opens_date,
            winners_announced_date = EXCLUDED.winners_announced_date,
            requires_essay         = EXCLUDED.requires_essay,
            essay_prompt           = EXCLUDED.essay_prompt,
            essay_word_limit       = EXCLUDED.essay_word_limit,
            essay_prompts          = EXCLUDED.essay_prompts,
            category               = EXCLUDED.category,
            last_verified          = EXCLUDED.last_verified,
            updated_at             = EXCLUDED.updated_at
        RETURNING (xmax = 0) AS inserted
    """

    params = {
        **data,
        "essay_prompts": essay_prompts_val,
        "last_verified": now,
        "now": now,
        "opens_date": data.get("opens_date"),
        "winners_announced_date": data.get("winners_announced_date"),
        "essay_word_limit": data.get("essay_word_limit"),
        "category": data.get("category"),
        "provider_url": data.get("provider_url"),
        "description": data.get("description"),
    }

    with conn.cursor() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
        conn.commit()
        return "inserted" if row and row["inserted"] else "updated"


def fetch_inserted_rows(conn: psycopg.Connection, slugs: list[str]) -> list[dict]:
    """Fetch inserted rows for verification display."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, slug, name, provider, amount_min, amount_max,
                   deadline, requires_essay, source
            FROM scholarships
            WHERE slug = ANY(%s)
            ORDER BY created_at DESC
            """,
            (slugs,),
        )
        return cur.fetchall()
