import time
import logging
import httpx
from abc import ABC, abstractmethod
from typing import List, Optional
from scraper.models.tender_schema import ScrapedTenderSchema

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class BasePortalScraper(ABC):
    def __init__(self, portal_name: str, base_url: str, delay_between_requests: float = 1.0):
        self.portal_name = portal_name
        self.base_url = base_url
        self.delay = delay_between_requests
        self.client = httpx.Client(
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            timeout=15.0,
            follow_redirects=True
        )

    def fetch_with_retry(self, url: str, max_retries: int = 3) -> Optional[str]:
        for attempt in range(1, max_retries + 1):
            try:
                logging.info(f"[{self.portal_name}] Fetching {url} (Attempt {attempt}/{max_retries})")
                time.sleep(self.delay)
                response = self.client.get(url)
                if response.status_code == 200:
                    return response.text
                else:
                    logging.warning(f"[{self.portal_name}] Received status code {response.status_code} for {url}")
            except Exception as e:
                logging.error(f"[{self.portal_name}] Error fetching {url}: {e}")
                time.sleep(attempt * 2)
        return None

    @abstractmethod
    def fetch_list(self, page: int = 1) -> Optional[str]:
        """Fetch list page HTML for a given page number."""
        pass

    @abstractmethod
    def parse(self, html_content: str) -> List[ScrapedTenderSchema]:
        """Parse list HTML content into list of ScrapedTenderSchema."""
        pass

    @abstractmethod
    def fetch_detail(self, tender: ScrapedTenderSchema) -> ScrapedTenderSchema:
        """Enrich tender with detail page information if required."""
        pass
