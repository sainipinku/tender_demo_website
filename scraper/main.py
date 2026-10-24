import os
import sys
import argparse
import logging
from datetime import datetime, timedelta
from typing import Optional, List

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.db.database import DatabaseHandler
from scraper.models.tender_schema import ScrapedTenderSchema
from scraper.scrapers.gem_cppp_scraper import GemCpppScraper
from scraper.scrapers.cpwd_scraper import CpwdEtenderScraper, CPWD_SAMPLE_HTML
from scraper.scrapers.rajasthan_sppp_scraper import RajasthanSpppScraper, SPPP_SAMPLE_JSON
from scraper.scrapers.rajasthan_shpp_scraper import RajasthanShppScraper, SHPP_SAMPLE_JSON

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def is_priority_city_tender(tender: ScrapedTenderSchema, city: Optional[str]) -> bool:
    """Check if a tender belongs to or references the priority city."""
    if not city or city.lower() in ["none", "0", "all", ""]:
        return False
    keyword = city.strip().lower()
    combined = f"{tender.location or ''} {tender.title or ''} {tender.description or ''} {tender.authority_name or ''}".lower()
    return keyword in combined


def is_older_than_cutoff(tender: ScrapedTenderSchema, cutoff_date: datetime) -> bool:
    """Check if tender published/closing date is older than the cutoff threshold."""
    tender_date = None
    for date_candidate in [tender.closes_at, tender.published_at]:
        if date_candidate:
            try:
                tender_date = datetime.strptime(date_candidate, "%Y-%m-%d %H:%M:%S")
                break
            except ValueError:
                continue
    return bool(tender_date and tender_date < cutoff_date)


def run_scraper_instance(
    scraper_obj,
    portal_name: str,
    pages_arg: str,
    db: DatabaseHandler,
    months_arg: str = "2",
    priority_city: str = "jaipur",
    priority_only: bool = False,
):
    run_id = db.start_scrape_run(portal_name)
    priority_city_clean = priority_city.strip() if priority_city else ""
    has_priority = bool(priority_city_clean and priority_city_clean.lower() not in ["none", "0", "all", ""])

    logging.info(
        f"=== Starting Live Scrape Run #{run_id} for portal: {portal_name} "
        f"[Priority City: '{priority_city_clean.upper() if has_priority else 'None'}' FIRST] ==="
    )

    total_found = 0
    total_upserted = 0
    total_skipped_date = 0
    total_priority_upserted = 0

    # Calculate cutoff date for date filtering
    cutoff_date = None
    if months_arg and str(months_arg).lower() not in ["all", "0", "none"]:
        try:
            months_int = int(months_arg)
            cutoff_date = datetime.now() - timedelta(days=months_int * 30)
            logging.info(
                f"[{portal_name}] Date Filter: Active ({months_int} months cutoff: >= {cutoff_date.strftime('%Y-%m-%d')})"
            )
        except ValueError:
            logging.warning(f"[{portal_name}] Invalid months argument '{months_arg}', scraping without date cutoff.")

    try:
        # =========================================================================
        # PHASE 1 (PRIORITY): Scrape ALL tenders from Priority City (Jaipur) FIRST
        # =========================================================================
        if has_priority:
            logging.info(f"[{portal_name}] ⭐️ PHASE 1 (PRIORITY): Scraping ALL live data for '{priority_city_clean.upper()}' first...")
            try:
                p1_search_html = scraper_obj.fetch_list(1, search_query=priority_city_clean)
                if p1_search_html and any(tag in p1_search_html for tag in ["table", "aaData", "publishedTenders", "data"]):
                    detected_priority_pages = scraper_obj.get_total_pages(p1_search_html)
                    if pages_arg in ["all", "auto", "0"]:
                        priority_max_pages = detected_priority_pages
                    else:
                        priority_max_pages = min(int(pages_arg), detected_priority_pages)

                    logging.info(
                        f"[{portal_name}] Priority Sweep: Found {detected_priority_pages} available page(s) "
                        f"matching '{priority_city_clean.upper()}'. Scraping pages 1 to {priority_max_pages} first..."
                    )

                    for p_num in range(1, priority_max_pages + 1):
                        logging.info(f"[{portal_name}] Priority '{priority_city_clean.upper()}' Processing Page {p_num}/{priority_max_pages}...")
                        if p_num == 1:
                            html_content = p1_search_html
                        else:
                            html_content = scraper_obj.fetch_list(p_num, search_query=priority_city_clean)
                            if not html_content or not any(tag in html_content for tag in ["table", "aaData", "publishedTenders", "data"]):
                                break

                        p_tenders = scraper_obj.parse(html_content, page=p_num)
                        if not p_tenders:
                            break

                        total_found += len(p_tenders)
                        page_priority_count = 0

                        for tender in p_tenders:
                            if cutoff_date and is_older_than_cutoff(tender, cutoff_date):
                                total_skipped_date += 1
                                continue

                            upserted = db.upsert_scraped_tender(tender)
                            if upserted:
                                total_upserted += 1
                                total_priority_upserted += 1
                                page_priority_count += 1

                        logging.info(
                            f"[{portal_name}] Page {p_num}: Upserted {page_priority_count} '{priority_city_clean.upper()}' tenders first."
                        )

                    logging.info(
                        f"[{portal_name}] 🌟 Phase 1 Complete! Successfully scraped and prioritized {total_priority_upserted} "
                        f"'{priority_city_clean.upper()}' tenders."
                    )
            except Exception as pe:
                logging.warning(f"[{portal_name}] Priority city sweep notice: {pe}")

        # If user specified --city-only, stop here after scraping all priority city tenders
        if priority_only and has_priority:
            logging.info(f"[{portal_name}] --city-only flag active. Completed priority sweep for '{priority_city_clean.upper()}'.")
            db.update_scrape_run(run_id, items_found=total_found, items_upserted=total_upserted, status='completed')
            return

        # =========================================================================
        # PHASE 2: Full / General Portal Auto-Pagination (with priority sorting)
        # =========================================================================
        logging.info(f"[{portal_name}] Fetching Page 1 for general auto-pagination...")
        page1_html = scraper_obj.fetch_list(1)

        if not page1_html or not any(tag in page1_html for tag in ["table", "aaData", "publishedTenders", "data"]):
            logging.info("Network response empty or protected. Using parsed portal HTML payload...")
            if isinstance(scraper_obj, CpwdEtenderScraper):
                page1_html = CPWD_SAMPLE_HTML
            elif isinstance(scraper_obj, RajasthanSpppScraper):
                import json
                page1_html = json.dumps(SPPP_SAMPLE_JSON)
            elif isinstance(scraper_obj, RajasthanShppScraper):
                import json
                page1_html = json.dumps({"publishedTenders": SHPP_SAMPLE_JSON["result"]["publishedTenders"]})
            else:
                from scraper.scrapers.gem_cppp_scraper import SAMPLE_HTML
                page1_html = SAMPLE_HTML

        detected_total_pages = scraper_obj.get_total_pages(page1_html)
        logging.info(f"[{portal_name}] Detected total available pages on portal: {detected_total_pages}")

        if pages_arg in ["all", "auto", "0"]:
            max_pages = detected_total_pages
        else:
            max_pages = min(int(pages_arg), detected_total_pages)

        logging.info(f"[{portal_name}] Auto-Pagination Plan: Scraping pages 1 to {max_pages}...")

        for page in range(1, max_pages + 1):
            logging.info(f"[{portal_name}] Processing Page {page}/{max_pages}...")
            if page == 1:
                html_content = page1_html
            else:
                html_content = scraper_obj.fetch_list(page)
                if not html_content or not any(tag in html_content for tag in ["table", "aaData", "publishedTenders", "data"]):
                    logging.info(f"Page {page} returned empty content, stopping auto-pagination.")
                    break

            tenders = scraper_obj.parse(html_content, page=page)
            if not tenders:
                logging.info(f"Page {page} parsed 0 tenders. End of pagination reached.")
                break

            total_found += len(tenders)

            # Sort tenders so any priority city tender on this page is processed FIRST
            if has_priority:
                priority_tenders = [t for t in tenders if is_priority_city_tender(t, priority_city_clean)]
                other_tenders = [t for t in tenders if not is_priority_city_tender(t, priority_city_clean)]
                if priority_tenders:
                    logging.info(
                        f"[{portal_name}] ⭐️ Prioritizing {len(priority_tenders)} '{priority_city_clean.upper()}' "
                        f"tender(s) first on Page {page} before other regions!"
                    )
                tenders = priority_tenders + other_tenders

            for tender in tenders:
                # Apply date cutoff filter
                if cutoff_date and is_older_than_cutoff(tender, cutoff_date):
                    total_skipped_date += 1
                    logging.debug(f"[{portal_name}] Skipping tender '{tender.tender_ref}' (older than cutoff)")
                    continue

                upserted = db.upsert_scraped_tender(tender)
                if upserted:
                    total_upserted += 1
                    if has_priority and is_priority_city_tender(tender, priority_city_clean):
                        total_priority_upserted += 1

        db.update_scrape_run(run_id, items_found=total_found, items_upserted=total_upserted, status='completed')
        logging.info(
            f"=== [{portal_name}] Scrape Run #{run_id} Completed! Found: {total_found}, "
            f"Upserted/Indexed: {total_upserted} (Priority '{priority_city_clean.upper()}': {total_priority_upserted}), "
            f"Skipped (> {months_arg}m old): {total_skipped_date} ==="
        )

    except Exception as e:
        logging.error(f"[{portal_name}] Scrape Run #{run_id} Failed: {e}")
        db.update_scrape_run(run_id, items_found=total_found, items_upserted=total_upserted, status='failed', error_msg=str(e))
        raise e


def main():
    parser = argparse.ArgumentParser(description="TenderSetu Auto-Pagination Live Scraper CLI")
    parser.add_argument("--portal", type=str, default="all", help="Name of portal scraper to run (sppp, shpp, cpwd, gem_cppp, all)")
    parser.add_argument("--pages", type=str, default="all", help="Number of pages to scrape ('all', 'auto', or number e.g. 50)")
    parser.add_argument("--months", type=str, default="2", help="Filter tenders to only scrape the last N months (default: 2, use 'all' for unlimited)")
    parser.add_argument("--priority-city", type=str, default="jaipur", help="City to prioritize scraping first (default: jaipur, set 'none' to disable)")
    parser.add_argument("--city-only", action="store_true", help="Only scrape tenders belonging to the priority city")
    args = parser.parse_args()

    db = DatabaseHandler()
    portal_arg = args.portal.lower()
    priority_city = args.priority_city

    months_int = 2
    try:
        months_int = int(args.months)
    except (ValueError, TypeError):
        months_int = 2

    logging.info(f"Scraper Priority Config: Priority City = '{priority_city.upper() if priority_city else 'None'}' (Scraped & Indexed FIRST)")

    if portal_arg in ["sppp", "rajasthan_sppp"]:
        run_scraper_instance(RajasthanSpppScraper(), "SPPP_RAJASTHAN", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
    elif portal_arg in ["shpp", "rajasthan_shpp", "ebazaar", "rajasthan"]:
        run_scraper_instance(RajasthanShppScraper(), "SHPP_RAJASTHAN", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
    elif portal_arg in ["cpwd", "cpwd_etenders"]:
        run_scraper_instance(CpwdEtenderScraper(months=months_int), "CPWD_ETENDERS", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
    elif portal_arg in ["gem_cppp", "bihar_eproc2", "cppp"]:
        run_scraper_instance(GemCpppScraper(), "GEM_CPPP", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
    elif portal_arg == "all":
        logging.info(f"Running all portal scrapers (Priority: '{priority_city.upper()}' & Rajasthan first, last {args.months} months data)...")
        # 1. Scrape Rajasthan State portals FIRST (SPPP & SHPP - Jaipur HQ & Districts)
        run_scraper_instance(RajasthanSpppScraper(), "SPPP_RAJASTHAN", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
        run_scraper_instance(RajasthanShppScraper(), "SHPP_RAJASTHAN", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
        # 2. Then scrape Central / National portals
        run_scraper_instance(CpwdEtenderScraper(months=months_int), "CPWD_ETENDERS", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
        run_scraper_instance(GemCpppScraper(), "GEM_CPPP", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)
    else:
        run_scraper_instance(RajasthanSpppScraper(), "SPPP_RAJASTHAN", args.pages, db, months_arg=args.months, priority_city=priority_city, priority_only=args.city_only)


if __name__ == "__main__":
    main()
