import unittest
from unittest.mock import MagicMock, patch
from scraper.db.database import DatabaseHandler
from scraper.models.tender_schema import ScrapedTenderSchema

class TestDatabaseHandler(unittest.TestCase):
    def setUp(self):
        with patch("scraper.db.database.TenderVectorDB"):
            self.db = DatabaseHandler()

    def test_get_sector_id_by_slug_existing(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = {"id": 5}
        result = self.db.get_sector_id_by_slug(cursor, "construction")
        self.assertEqual(result, 5)

    def test_get_sector_id_by_slug_autocreate_when_not_found(self):
        cursor = MagicMock()
        # First query returns None (not found)
        cursor.fetchone.side_effect = [None, None]
        cursor.lastrowid = 12

        result = self.db.get_sector_id_by_slug(cursor, "civil-aviation")
        self.assertEqual(result, 12)
        # Verify an INSERT INTO sectors was executed
        cursor.execute.assert_any_call(
            "INSERT INTO sectors (name, slug, description, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            unittest.mock.ANY
        )

    def test_get_sector_id_by_slug_returns_none_when_empty_and_insert_fails(self):
        cursor = MagicMock()
        # First select returns None
        cursor.fetchone.side_effect = [None, None]
        # Insert raises exception
        cursor.execute.side_effect = [None, Exception("Table locked"), None]

        result = self.db.get_sector_id_by_slug(cursor, "unknown")
        # Must return None or valid id, NEVER an arbitrary unverified integer like 1
        self.assertIsNone(result)

    def test_get_state_id_by_code_existing(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = {"id": 3}
        result = self.db.get_state_id_by_code(cursor, "RJ")
        self.assertEqual(result, 3)

    def test_get_state_id_by_code_autocreate_if_empty(self):
        cursor = MagicMock()
        # First select returns None, second (limit 1) returns None
        cursor.fetchone.side_effect = [None, None]
        cursor.lastrowid = 1

        result = self.db.get_state_id_by_code(cursor, "RJ")
        self.assertEqual(result, 1)

    def test_get_or_create_authority_validates_state_id(self):
        cursor = MagicMock()
        # Authority doesn't exist
        # state check: state_id 999 does NOT exist
        cursor.fetchone.side_effect = [None, None]
        cursor.lastrowid = 42

        result = self.db.get_or_create_authority(cursor, portal_id=1, name="Public Works Dept", state_id=999)
        self.assertEqual(result, 42)
        # Ensure state_id was passed as None because 999 is invalid
        cursor.execute.assert_called_with(
            "INSERT INTO authorities (portal_id, state_id, name, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)",
            (1, None, "Public Works Dept", unittest.mock.ANY, unittest.mock.ANY)
        )

    def test_upsert_scraped_tender_foreign_key_safety(self):
        cursor = MagicMock()
        mock_conn = MagicMock()
        mock_conn.cursor.return_value.__enter__.return_value = cursor

        with patch.object(self.db, "get_connection", return_value=mock_conn):
            with patch.object(self.db, "get_sector_id_by_slug", return_value=None):
                with patch.object(self.db, "get_state_id_by_code", return_value=2):
                    with patch.object(self.db, "get_or_create_authority", return_value=10):
                        with patch.object(self.db, "get_or_create_portal", return_value=1):
                            cursor.fetchone.side_effect = [
                                {"id": 2},   # SELECT id FROM states WHERE id = 2 -> found
                                None,        # SELECT id, raw_hash FROM tenders ... -> not found (new tender)
                            ]
                            cursor.lastrowid = 100

                            tender = ScrapedTenderSchema(
                                portal_code="SPPP_RAJASTHAN",
                                tender_ref="NIB2627001",
                                title="Road Construction Jaipur",
                                state_code="RJ",
                                sector_slug="construction",
                                raw_hash="hash123",
                            )

                            result = self.db.upsert_scraped_tender(tender)
                            self.assertTrue(result)

                            # Check that cursor.execute was called for the INSERT with valid_sector_id as None
                            insert_call_args = [
                                call for call in cursor.execute.call_args_list
                                if "INSERT INTO tenders" in str(call)
                            ]
                            self.assertTrue(len(insert_call_args) > 0)
                            params = insert_call_args[0][0][1]
                            self.assertEqual(params[0], 1)    # portal_id
                            self.assertEqual(params[1], 10)   # authority_id
                            self.assertEqual(params[2], 2)    # valid_state_id (verified in DB)
                            self.assertIsNone(params[3])       # valid_sector_id is None (safe from FK 1452 violation)


if __name__ == "__main__":
    unittest.main()

