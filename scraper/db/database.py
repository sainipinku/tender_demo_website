import os
import pymysql
import hashlib
import logging
from datetime import datetime
from dotenv import load_dotenv
from scraper.db.vector_db import TenderVectorDB

load_dotenv()

class DatabaseHandler:
    def __init__(self):
        self.host = os.getenv("DB_HOST", "127.0.0.1")
        self.port = int(os.getenv("DB_PORT", 3306))
        self.db_name = os.getenv("DB_NAME", "tender_db")
        self.user = os.getenv("DB_USER", "root")
        self.password = os.getenv("DB_PASSWORD", "")
        self.vector_db = TenderVectorDB()

    def get_connection(self):
        return pymysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            database=self.db_name,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )

    def start_scrape_run(self, portal_name: str) -> int:
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO scrape_runs (portal_name, status, items_found, items_upserted, started_at, created_at, updated_at)
                    VALUES (%s, 'running', 0, 0, %s, %s, %s)
                """
                now = datetime.now()
                cursor.execute(sql, (portal_name, now, now, now))
                return cursor.lastrowid
        finally:
            conn.close()

    def update_scrape_run(self, run_id: int, items_found: int, items_upserted: int, status: str = 'completed', error_msg: str = None):
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    UPDATE scrape_runs
                    SET items_found = %s, items_upserted = %s, status = %s, error_message = %s, completed_at = %s, updated_at = %s
                    WHERE id = %s
                """
                now = datetime.now()
                cursor.execute(sql, (items_found, items_upserted, status, error_msg, now, now, run_id))
        finally:
            conn.close()

    def get_or_create_portal(self, cursor, code: str, name: str, url: str) -> int:
        cursor.execute("SELECT id FROM portals WHERE code = %s", (code,))
        res = cursor.fetchone()
        if res:
            return res['id']
        
        now = datetime.now()
        cursor.execute(
            "INSERT INTO portals (name, code, url, status, created_at, updated_at) VALUES (%s, %s, %s, 'active', %s, %s)",
            (name, code, url, now, now)
        )
        return cursor.lastrowid

    def get_or_create_authority(self, cursor, portal_id: int, name: str, state_id: int = None) -> int:
        cursor.execute("SELECT id FROM authorities WHERE name = %s", (name,))
        res = cursor.fetchone()
        if res:
            return res['id']
        
        # Verify state_id exists in states before passing to prevent FK violation
        valid_state_id = None
        if state_id:
            try:
                cursor.execute("SELECT id FROM states WHERE id = %s", (state_id,))
                if cursor.fetchone():
                    valid_state_id = state_id
            except Exception:
                valid_state_id = None

        now = datetime.now()
        cursor.execute(
            "INSERT INTO authorities (portal_id, state_id, name, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (portal_id, valid_state_id, name, now, now)
        )
        return cursor.lastrowid

    def get_state_id_by_code(self, cursor, code: str = "RJ"):
        code_clean = (code or "RJ").upper().strip()
        cursor.execute("SELECT id FROM states WHERE code = %s", (code_clean,))
        res = cursor.fetchone()
        if res:
            return res['id']
        
        # Check any state in table
        cursor.execute("SELECT id FROM states LIMIT 1")
        res = cursor.fetchone()
        if res:
            return res['id']
        
        # If states table is empty, auto-create default state so FK constraints succeed
        try:
            now = datetime.now()
            cursor.execute(
                "INSERT INTO states (name, code, latitude, longitude, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)",
                ("Rajasthan", "RJ", 27.0238, 74.2179, now, now)
            )
            return cursor.lastrowid
        except Exception as e:
            logging.warning(f"Could not auto-create default state: {e}")
            return None

    def get_sector_id_by_slug(self, cursor, slug: str = "construction"):
        slug_clean = (slug or "construction").strip().lower()
        cursor.execute("SELECT id FROM sectors WHERE slug = %s", (slug_clean,))
        res = cursor.fetchone()
        if res:
            return res['id']

        # Auto-create the sector so it always exists and foreign keys never fail
        name = slug_clean.replace("-", " ").replace("_", " ").title()
        now = datetime.now()
        try:
            cursor.execute(
                "INSERT INTO sectors (name, slug, description, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
                (name, slug_clean, f"{name} Tenders & Procurement", now, now)
            )
            return cursor.lastrowid
        except Exception as e:
            logging.warning(f"Could not auto-create sector '{slug_clean}': {e}")
            try:
                cursor.execute("SELECT id FROM sectors LIMIT 1")
                fallback = cursor.fetchone()
                return fallback['id'] if fallback else None
            except Exception:
                return None

    def upsert_scraped_tender(self, tender_data) -> bool:
        """
        Idempotent upsert using ON DUPLICATE KEY UPDATE checking raw_hash.
        Returns True if inserted/updated, False if skipped because raw_hash matches.
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                portal_map = {
                    "SHPP_RAJASTHAN": ("Rajasthan Single Holistic Procurement Portal (SHPP)", "https://shpp.rajasthan.gov.in/advance-search"),
                    "SPPP_RAJASTHAN": ("Rajasthan State Public Procurement Portal (SPPP)", "https://sppp.rajasthan.gov.in/bidlist.php"),
                    "CPWD_ETENDERS": ("CPWD Central Government eTenders", "https://etender.cpwd.gov.in/tenderAwardedDetails.html"),
                    "GEM_CPPP": ("Government e-Marketplace CPPP", "https://gem.gov.in/cppp"),
                }
                portal_name, portal_url = portal_map.get(
                    tender_data.portal_code,
                    (tender_data.portal_code, "https://shpp.rajasthan.gov.in/advance-search")
                )
                portal_id = self.get_or_create_portal(
                    cursor,
                    code=tender_data.portal_code,
                    name=portal_name,
                    url=portal_url
                )
                
                state_id = self.get_state_id_by_code(cursor, tender_data.state_code or "RJ")
                authority_id = self.get_or_create_authority(cursor, portal_id, tender_data.authority_name or "Government Department", state_id)
                sector_id = self.get_sector_id_by_slug(cursor, tender_data.sector_slug or "construction")

                # Validate foreign keys exist in parent tables before insert to prevent 1452 IntegrityError
                valid_state_id = None
                if state_id:
                    cursor.execute("SELECT id FROM states WHERE id = %s", (state_id,))
                    if cursor.fetchone():
                        valid_state_id = state_id

                valid_sector_id = None
                if sector_id:
                    cursor.execute("SELECT id FROM sectors WHERE id = %s", (sector_id,))
                    if cursor.fetchone():
                        valid_sector_id = sector_id

                # Check existing hash
                cursor.execute(
                    "SELECT id, raw_hash FROM tenders WHERE portal_id = %s AND tender_ref = %s",
                    (portal_id, tender_data.tender_ref)
                )
                existing = cursor.fetchone()

                if existing and existing['raw_hash'] == tender_data.raw_hash:
                    # Unchanged, skip
                    return False

                now = datetime.now()
                sql = """
                    INSERT INTO tenders (
                        portal_id, authority_id, state_id, sector_id, tender_ref, title, description,
                        location, tender_value, emd_amount, document_fee, status, published_at,
                        submission_start_at, closes_at, opening_at, raw_hash, official_url, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        authority_id = VALUES(authority_id),
                        state_id = VALUES(state_id),
                        sector_id = VALUES(sector_id),
                        title = VALUES(title),
                        description = VALUES(description),
                        tender_value = VALUES(tender_value),
                        emd_amount = VALUES(emd_amount),
                        status = VALUES(status),
                        published_at = VALUES(published_at),
                        closes_at = VALUES(closes_at),
                        opening_at = VALUES(opening_at),
                        raw_hash = VALUES(raw_hash),
                        official_url = VALUES(official_url),
                        updated_at = VALUES(updated_at)
                """

                cursor.execute(sql, (
                    portal_id, authority_id, valid_state_id, valid_sector_id, tender_data.tender_ref, tender_data.title,
                    tender_data.description, tender_data.location, tender_data.tender_value, tender_data.emd_amount,
                    tender_data.document_fee, tender_data.status, tender_data.published_at, tender_data.submission_start_at,
                    tender_data.closes_at, tender_data.opening_at, tender_data.raw_hash, tender_data.official_url,
                    now, now
                ))

                tender_id = cursor.lastrowid or (existing['id'] if existing else None)

                # Attach documents
                if tender_id and tender_data.documents:
                    for doc in tender_data.documents:
                        cursor.execute(
                            "SELECT id FROM tender_documents WHERE tender_id = %s AND file_url = %s",
                            (tender_id, doc.file_url)
                        )
                        if not cursor.fetchone():
                            cursor.execute(
                                "INSERT INTO tender_documents (tender_id, title, file_url, file_type, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)",
                                (tender_id, doc.title, doc.file_url, doc.file_type, now, now)
                            )

                # Index in ChromaDB Vector Database for Semantic AI Search
                if tender_id and self.vector_db and self.vector_db.is_ready():
                    try:
                        self.vector_db.upsert_tender(
                            tender_id=tender_id,
                            tender_ref=tender_data.tender_ref,
                            title=tender_data.title,
                            description=tender_data.description,
                            authority_name=tender_data.authority_name,
                            location=tender_data.location,
                            state_code=tender_data.state_code,
                            sector_slug=tender_data.sector_slug,
                            tender_value=tender_data.tender_value,
                            closes_at=tender_data.closes_at,
                            official_url=tender_data.official_url
                        )
                    except Exception as err:
                        logging.warning(f"[VectorDB] Skipping vector index for tender #{tender_id}: {err}")

                return True
        finally:
            conn.close()

    def sync_all_to_vector_db(self) -> int:
        """
        Indexes all existing tenders in MySQL into ChromaDB Vector Store.
        """
        if not self.vector_db or not self.vector_db.is_ready():
            logging.warning("[VectorDB] Vector DB not ready, skipping sync.")
            return 0

        conn = self.get_connection()
        count = 0
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT t.id, t.tender_ref, t.title, t.description, t.location,
                           t.tender_value, t.closes_at, t.official_url,
                           a.name AS authority_name, s.code AS state_code, sec.slug AS sector_slug
                    FROM tenders t
                    LEFT JOIN authorities a ON t.authority_id = a.id
                    LEFT JOIN states s ON t.state_id = s.id
                    LEFT JOIN sectors sec ON t.sector_id = sec.id
                    ORDER BY t.id ASC
                """)
                rows = cursor.fetchall()
                logging.info(f"[VectorDB] Found {len(rows)} tenders in MySQL to index into ChromaDB...")
                for row in rows:
                    success = self.vector_db.upsert_tender(
                        tender_id=row['id'],
                        tender_ref=row['tender_ref'],
                        title=row['title'],
                        description=row['description'],
                        authority_name=row['authority_name'],
                        location=row['location'],
                        state_code=row['state_code'],
                        sector_slug=row['sector_slug'],
                        tender_value=row['tender_value'],
                        closes_at=str(row['closes_at']) if row['closes_at'] else None,
                        official_url=row['official_url']
                    )
                    if success:
                        count += 1
                logging.info(f"[VectorDB] Sync complete! Successfully indexed {count} tenders.")
                return count
        finally:
            conn.close()
