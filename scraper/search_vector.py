import os
import sys
import json
import argparse
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.db.vector_db import TenderVectorDB

def main():
    parser = argparse.ArgumentParser(description="TenderSetu Semantic Vector Search CLI")
    parser.add_argument("query", type=str, nargs="?", default="", help="Natural language search query or vendor capability text")
    parser.add_argument("--query", "-q", dest="query_opt", type=str, default="", help="Search query (flag format)")
    parser.add_argument("--state", type=str, default=None, help="State filter (e.g. DL, MH, BR)")
    parser.add_argument("--sector", type=str, default=None, help="Sector filter (e.g. transport, construction)")
    parser.add_argument("--limit", "-n", type=int, default=10, help="Maximum number of results to return")
    parser.add_argument("--profile", action="store_true", help="Match query as vendor capability profile statement")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")

    args = parser.parse_args()
    query_text = args.query_opt or args.query

    if not query_text:
        if args.json:
            print(json.dumps([]))
        else:
            print("Please provide a search query. Example: python scraper/search_vector.py 'solar panel installations in schools'")
        sys.exit(0)

    # Disable logging in JSON mode for clean machine output
    if args.json:
        logging.basicConfig(level=logging.ERROR)
    else:
        logging.basicConfig(level=logging.INFO, format="%(message)s")

    vector_db = TenderVectorDB()
    if not vector_db.is_ready():
        if args.json:
            print(json.dumps({"error": "Vector database not available"}))
        else:
            print("Error: Vector database not initialized.")
        sys.exit(1)

    if args.profile:
        results = vector_db.match_vendor_profile(vendor_profile_text=query_text, n_results=args.limit)
    else:
        results = vector_db.search_semantic(
            query=query_text,
            n_results=args.limit,
            state_code=args.state,
            sector_slug=args.sector
        )

    if args.json:
        print(json.dumps(results, indent=2))
        return

    # Formatted terminal UI output
    print("\n" + "="*80)
    mode_title = "VENDOR PROFILE AI MATCHING" if args.profile else "SEMANTIC VECTOR SEARCH"
    print(f"  🔍 {mode_title}: '{query_text}'")
    print("="*80)

    if not results:
        print("  No matching tenders found in vector database.")
        print("="*80 + "\n")
        return

    for idx, item in enumerate(results, 1):
        meta = item.get("metadata", {})
        score = item.get("similarity_score", 0)
        tid = item.get("tender_id")
        t_ref = meta.get("tender_ref", "N/A")
        title = meta.get("title", "Untitled")
        authority = meta.get("authority_name", "N/A")
        state = meta.get("state_code", "N/A")
        val = meta.get("tender_value", 0)
        closes = meta.get("closes_at", "N/A")

        val_str = f"₹{val:,.2f}" if val > 0 else "Refer Document"

        # Color or indicator based on match score
        badge = "🔥 HIGH MATCH" if score >= 75 else ("✨ GOOD MATCH" if score >= 50 else "📌 RELEVANT")

        print(f"\n[{idx}] {badge} ({score}% Match) — ID #{tid} | Ref: {t_ref}")
        print(f"    Title:     {title}")
        print(f"    Authority: {authority}")
        print(f"    Location:  State: {state} | Estimated: {val_str}")
        print(f"    Closes At: {closes}")
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
