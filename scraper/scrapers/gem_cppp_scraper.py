import re
import hashlib
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from typing import List, Optional
from scraper.scrapers.base_scraper import BasePortalScraper
from scraper.models.tender_schema import ScrapedTenderSchema, DocumentSchema

class GemCpppScraper(BasePortalScraper):
    def __init__(self):
        super().__init__(
            portal_name="gem_cppp",
            base_url="https://gem.gov.in/cppp",
            delay_between_requests=1.0
        )

    def fetch_list(self, page: int = 1) -> Optional[str]:
        if page <= 1:
            url = self.base_url
        else:
            url = f"{self.base_url}/{page}?"
        
        return self.fetch_with_retry(url)

    def get_total_pages(self, html_content: str) -> int:
        """Dynamically parse pagination links & total entries to discover total available pages."""
        if not html_content:
            return 1

        soup = BeautifulSoup(html_content, 'html.parser')
        detected_pages = []

        # 1. Look for 'Last' pagination link e.g. <a href="https://gem.gov.in/cppp/2205?">Last</a>
        for a in soup.find_all('a', href=True):
            href = a['href']
            link_text = a.get_text(strip=True).lower()
            link_title = a.get('title', '').lower()
            
            match = re.search(r'/cppp/(\d+)', href)
            if match:
                page_num = int(match.group(1))
                detected_pages.append(page_num)
                if 'last' in link_text or 'last' in link_title:
                    return page_num

        # 2. Look for "Showing 1 to 10 of 22,050 entries" or "of X entries"
        text = soup.get_text()
        match = re.search(r'of\s*([\d,]+)\s*(?:entries|tenders|records|items)', text, re.IGNORECASE)
        if match:
            try:
                total_entries = int(match.group(1).replace(',', ''))
                calculated_pages = max(1, (total_entries + 9) // 10)
                detected_pages.append(calculated_pages)
            except ValueError:
                pass

        if detected_pages:
            return max(detected_pages)

        return 9999 # Continuous auto-pagination ceiling until empty page encountered

    def _parse_date(self, date_str: str) -> Optional[str]:
        if not date_str or date_str.strip() in ['N/A', '', '-']:
            return None
        
        cleaned = date_str.strip()
        # Format: 08-October-2026 10:30:00 AM
        for fmt in ["%d-%B-%Y %I:%M:%S %p", "%d-%b-%Y %I:%M:%S %p", "%d-%m-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S"]:
            try:
                dt = datetime.strptime(cleaned, fmt)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                continue
        return None

    def _determine_status(self, closes_at_str: Optional[str]) -> str:
        if not closes_at_str:
            return "live"
        try:
            closes_dt = datetime.strptime(closes_at_str, "%Y-%m-%d %H:%M:%S")
            now = datetime.now()
            if closes_dt < now:
                return "closed"
            diff_hours = (closes_dt - now).total_seconds() / 3600.0
            if diff_hours <= 72:
                return "closing_soon"
            return "live"
        except Exception:
            return "live"

    def parse(self, html_content: str, page: int = 1) -> List[ScrapedTenderSchema]:
        soup = BeautifulSoup(html_content, 'html.parser')
        tenders: List[ScrapedTenderSchema] = []

        table = soup.find('table', class_='table')
        if not table:
            logging.warning("[gem_cppp] Table not found in HTML response")
            return tenders

        page_source_url = f"https://gem.gov.in/cppp/{page}?" if page > 1 else "https://gem.gov.in/cppp"

        rows = table.find_all('tr')
        for row in rows:
            tds = row.find_all('td')
            if len(tds) < 5:
                continue

            try:
                closes_raw = tds[0].get_text(strip=True)
                opening_raw = tds[1].get_text(strip=True)
                published_raw = tds[2].get_text(strip=True)

                closes_at = self._parse_date(closes_raw)
                opening_at = self._parse_date(opening_raw)
                published_at = self._parse_date(published_raw)

                # Column 3: Title / Ref / PDF Link
                title_td = tds[3]
                link_tag = title_td.find('a')

                title = ""
                pdf_url = ""
                if link_tag:
                    title = link_tag.get_text(strip=True)
                    pdf_url = link_tag.get('href', '').strip()

                full_cell_text = title_td.get_text(strip=True)
                ref_parts = full_cell_text.replace(title, '').strip().strip('/')
                tender_ref = ref_parts if ref_parts else f"GEM-CPPP-{hashlib.md5(title.encode()).hexdigest()[:8]}"

                if not title:
                    title = full_cell_text or "Government Supply Tender"

                # Column 4: Organisation
                org_name = tds[4].get_text(strip=True) or "Ministry of Railways / Central Govt"

                status = self._determine_status(closes_at)

                # Unique raw_hash for idempotency
                raw_str = f"GEM_{tender_ref}_{title}_{closes_at}"
                raw_hash = hashlib.md5(raw_str.encode('utf-8')).hexdigest()

                # Documents array
                documents = []
                if pdf_url and pdf_url.startswith('http'):
                    documents.append(DocumentSchema(
                        title=f"NIT Notice & Tender Specification ({tender_ref})",
                        file_url=pdf_url,
                        file_type="pdf"
                    ))

                # Source site URL: link directly to PDF or GeM page
                source_site_link = pdf_url if (pdf_url and pdf_url.startswith('http')) else page_source_url

                scraped_tender = ScrapedTenderSchema(
                    portal_code="GEM_CPPP",
                    tender_ref=tender_ref,
                    title=title,
                    description=f"Official procurement notice from {org_name}. Scraped from GeM CPPP Portal ({page_source_url}). Ref ID: {tender_ref}.",
                    location="New Delhi / Pan India",
                    authority_name=org_name,
                    state_code="DL",
                    sector_slug="transport" if "Railways" in org_name else "consultancy",
                    tender_value=None,
                    status=status,
                    published_at=published_at,
                    closes_at=closes_at,
                    opening_at=opening_at,
                    official_url=source_site_link,
                    documents=documents,
                    raw_hash=raw_hash
                )

                tenders.append(scraped_tender)

            except Exception as e:
                logging.error(f"[gem_cppp] Error parsing row: {e}")
                continue

        return tenders

    def fetch_detail(self, tender: ScrapedTenderSchema) -> ScrapedTenderSchema:
        return tender
