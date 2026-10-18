import os
import sys
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper.db.database import DatabaseHandler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def main():
    logging.info("Starting synchronization of all MySQL tenders to ChromaDB Vector Database...")
    db = DatabaseHandler()
    indexed_count = db.sync_all_to_vector_db()
    total_in_vector = db.vector_db.count() if db.vector_db else 0
    logging.info(f"Sync finished! Indexed: {indexed_count} tenders. Total items in Vector DB: {total_in_vector}")

if __name__ == "__main__":
    main()
