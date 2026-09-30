import os
import pymysql
import hashlib
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class DatabaseHandler:
    def __init__(self):
        self.host = os.getenv("DB_HOST", "127.0.0.1")
        self.port = int(os.getenv("DB_PORT", 3306))
        self.db_name = os.getenv("DB_NAME", "tender_db")
        self.user = os.getenv("DB_USER", "root")
        self.password = os.getenv("DB_PASSWORD", "")

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
        
        now = datetime.now()
        cursor.execute(
            "INSERT INTO authorities (portal_id, state_id, name, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (portal_id, state_id, name, now, now)
        )
        return cursor.lastrowid

    def get_state_id_by_code(self, cursor, code: str) -> int:
        cursor.execute("SELECT id FROM states WHERE code = %s", (code,))
        res = cursor.fetchone()
        if res:
            return res['id']
        # Default to Delhi (DL) or 1
        cursor.execute("SELECT id FROM states LIMIT 1")
        res = cursor.fetchone()
        return res['id'] if res else 1

    def get_sector_id_by_slug(self, cursor, slug: str) -> int:
        cursor.execute("SELECT id FROM sectors WHERE slug = %s", (slug,))
        res = cursor.fetchone()
        if res:
            return res['id']
        cursor.execute("SELECT id FROM sectors LIMIT 1")
        res = cursor.fetchone()
        return res['id'] if res else 1

    def upsert_scraped_tender(self, tender_data) -> bool:
        """
        Idempotent upsert using ON DUPLICATE KEY UPDATE checking raw_hash.
        Returns True if inserted/updated, False if skipped because raw_hash matches.
        """
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                portal_id = self.get_or_create_portal(
                    cursor,
                    code=tender_data.portal_code,
                    name="Government e-Marketplace CPPP",
                    url="https://gem.gov.in/cppp"
                )
                
                state_id = self.get_state_id_by_code(cursor, tender_data.state_code or "DL")
                authority_id = self.get_or_create_authority(cursor, portal_id, tender_data.authority_name or "Ministry of Railways", state_id)
                sector_id = self.get_sector_id_by_slug(cursor, tender_data.sector_slug or "transport")

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
                    portal_id, authority_id, state_id, sector_id, tender_data.tender_ref, tender_data.title,
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

                return True
        finally:
            conn.close()
