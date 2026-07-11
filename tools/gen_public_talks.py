#!/usr/bin/env python3
"""Regenerate a locale's public_talks.json from the S-34 corpus (SSOT).

The official outline titles live in the jwlinker corpus database (built from
the current S-34); the app's bundled per-locale lists drift (translated by
hand, or frozen at an older S-34 revision). This keeps them honest:

    python3 tools/gen_public_talks.py                # ht-HT from MEPS 51
    python3 tools/gen_public_talks.py --dry-run      # report only
    python3 tools/gen_public_talks.py --locale fr --language 3

Keys the corpus does not know (discontinued outline numbers) are left
untouched. Run after every corpus refresh, rebuild, commit the diff.
"""

import argparse
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_DB = "/library/jwlinker/jw_library.db"


def fold(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s.lower().strip())
        if unicodedata.category(c) != "Mn"
    )


def corpus_titles(db_path: str, lang_id: str) -> dict[int, str]:
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "SELECT DISTINCT t.name FROM Topics t "
        "JOIN Categories c ON t.category_id=c.id "
        "JOIN Publications p ON c.publication_id=p.id "
        "WHERE p.code='s34' AND p.language=?", (lang_id,)
    ).fetchall()
    conn.close()
    titles: dict[int, str] = {}
    for (name,) in rows:
        m = re.match(r"(?:No\s+)?(\d+)[.\s]\s*(.*)", name)
        if m:
            titles[int(m.group(1))] = m.group(2).strip()
    return titles


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--db", default=DEFAULT_DB, help="jwlinker corpus DB")
    ap.add_argument("--language", default="51",
                    help="MEPS language id in the corpus (51 = Haitian Creole)")
    ap.add_argument("--locale", default="ht-HT", help="app locale directory")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    titles = corpus_titles(args.db, args.language)
    if not titles:
        print(f"No s34 titles for language {args.language} in {args.db}",
              file=sys.stderr)
        return 1

    path = REPO / "src" / "locales" / args.locale / "public_talks.json"
    locale = json.loads(path.read_text(encoding="utf-8"))

    updated = same = unknown = 0
    for key, value in locale.items():
        m = re.match(r"tr_talk_(\d+)$", key)
        if not m:
            continue
        n = int(m.group(1))
        if n not in titles:
            unknown += 1
            continue
        if fold(titles[n]) == fold(value):
            same += 1
            continue
        if not args.dry_run:
            locale[key] = titles[n]
        updated += 1

    print(f"{args.locale}: {updated} updated, {same} already official, "
          f"{unknown} without a corpus entry (kept as-is)"
          f"{' [dry-run]' if args.dry_run else ''}")

    if updated and not args.dry_run:
        path.write_text(
            json.dumps(locale, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
