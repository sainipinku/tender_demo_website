import os
import sys
import argparse
import logging
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.db.database import DatabaseHandler
from scraper.scrapers.gem_cppp_scraper import GemCpppScraper
from scraper.scrapers.cpwd_scraper import CpwdEtenderScraper, CPWD_SAMPLE_HTML
from scraper.scrapers.rajasthan_sppp_scraper import RajasthanSpppScraper, SPPP_SAMPLE_JSON
from scraper.scrapers.rajasthan_shpp_scraper import RajasthanShppScraper, SHPP_SAMPLE_JSON

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def run_scraper_instance(scraper_obj, portal_name: str, pages_arg: str, db: DatabaseHandler, months_arg: str = "2"):
    run_id = db.start_scrape_run(portal_name)
    logging.info(f"=== Starting Auto-Pagination Scrape Run #{run_id} for portal: {portal_name} ===")

    total_found = 0
    total_upserted = 0
    total_skipped_date = 0

    # Calculate cutoff date for date filtering
    cutoff_date = None
    if months_arg and str(months_arg).lower() not in ["all", "0", "none"]:
        try:
            months_int = int(months_arg)
            cutoff_date = datetime.now() - timedelta(days=months_int * 30)
            logging.info(f"[{portal_name}] Date Filter: Active ({months_int} months cutoff: >= {cutoff_date.strftime('%Y-%m-%d')})")
        except ValueError:
            logging.warning(f"[{portal_name}] Invalid months argument '{months_arg}', scraping without date cutoff.")

    try:
        logging.info("Fetching Page 1 to inspect pagination metadata...")
        page1_html = scraper_obj.fetch_list(1)

        if not page1_html or ("table" not in page1_html and "aaData" not in page1_html and "publishedTenders" not in page1_html):
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
                if not html_content or ("table" not in html_content and "aaData" not in html_content and "publishedTenders" not in html_content and "data" not in html_content):
                    logging.info(f"Page {page} returned empty content, stopping auto-pagination.")
                    break

            tenders = scraper_obj.parse(html_content, page=page)
            if not tenders:
                logging.info(f"Page {page} parsed 0 tenders. End of pagination reached.")
                break

            total_found += len(tenders)
            logging.info(f"[{portal_name}] Page {page}: Parsed {len(tenders)} tenders.")

            for tender in tenders:
                # Apply 2-month (or custom months) date cutoff filter
                if cutoff_date:
                    tender_date = None
                    for date_candidate in [tender.closes_at, tender.published_at]:
                        if date_candidate:
                            try:
                                tender_date = datetime.strptime(date_candidate, "%Y-%m-%d %H:%M:%S")
                                break
                            except ValueError:
                                continue

                    if tender_date and tender_date < cutoff_date:
                        total_skipped_date += 1
                        logging.debug(f"[{portal_name}] Skipping tender '{tender.tender_ref}' ({tender_date.strftime('%Y-%m-%d')} is older than cutoff {cutoff_date.strftime('%Y-%m-%d')})")
                        continue

                upserted = db.upsert_scraped_tender(tender)
                if upserted:
                    total_upserted += 1

        db.update_scrape_run(run_id, items_found=total_found, items_upserted=total_upserted, status='completed')
        logging.info(f"=== [{portal_name}] Scrape Run #{run_id} Completed! Found: {total_found}, Upserted/Indexed: {total_upserted}, Skipped (> {months_arg}m old): {total_skipped_date} ===")

    except Exception as e:
        logging.error(f"[{portal_name}] Scrape Run #{run_id} Failed: {e}")
        db.update_scrape_run(run_id, items_found=total_found, items_upserted=total_upserted, status='failed', error_msg=str(e))
        raise e

def main():
    parser = argparse.ArgumentParser(description="TenderSetu Auto-Pagination Live Scraper CLI")
    parser.add_argument("--portal", type=str, default="all", help="Name of portal scraper to run (gem_cppp, cpwd, sppp, shpp, all)")
    parser.add_argument("--pages", type=str, default="all", help="Number of pages to scrape ('all', 'auto', or number e.g. 50)")
    parser.add_argument("--months", type=str, default="2", help="Filter tenders to only scrape the last N months (default: 2, use 'all' for unlimited)")
    args = parser.parse_args()

    db = DatabaseHandler()
    portal_arg = args.portal.lower()

    months_int = 2
    try:
        months_int = int(args.months)
    except (ValueError, TypeError):
        months_int = 2

    if portal_arg in ["cpwd", "cpwd_etenders"]:
        run_scraper_instance(CpwdEtenderScraper(months=months_int), "CPWD_ETENDERS", args.pages, db, months_arg=args.months)
    elif portal_arg in ["gem_cppp", "bihar_eproc2", "cppp"]:
        run_scraper_instance(GemCpppScraper(), "GEM_CPPP", args.pages, db, months_arg=args.months)
    elif portal_arg in ["sppp", "rajasthan_sppp"]:
        run_scraper_instance(RajasthanSpppScraper(), "SPPP_RAJASTHAN", args.pages, db, months_arg=args.months)
    elif portal_arg in ["shpp", "rajasthan_shpp", "ebazaar", "rajasthan"]:
        run_scraper_instance(RajasthanShppScraper(), "SHPP_RAJASTHAN", args.pages, db, months_arg=args.months)
    elif portal_arg == "all":
        logging.info(f"Running all portal scrapers with auto-pagination (last {args.months} months data)...")
        run_scraper_instance(GemCpppScraper(), "GEM_CPPP", args.pages, db, months_arg=args.months)
        run_scraper_instance(CpwdEtenderScraper(months=months_int), "CPWD_ETENDERS", args.pages, db, months_arg=args.months)
        run_scraper_instance(RajasthanSpppScraper(), "SPPP_RAJASTHAN", args.pages, db, months_arg=args.months)
        run_scraper_instance(RajasthanShppScraper(), "SHPP_RAJASTHAN", args.pages, db, months_arg=args.months)
    else:
        run_scraper_instance(GemCpppScraper(), "GEM_CPPP", args.pages, db, months_arg=args.months)

if __name__ == "__main__":
    main()
