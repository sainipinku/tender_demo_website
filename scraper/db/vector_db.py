import os
import logging
from typing import List, Dict, Any, Optional

try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False
    logging.warning("[VectorDB] chromadb is not installed. Vector search will be disabled.")

logger = logging.getLogger("TenderVectorDB")

class TenderVectorDB:
    """
    Vector Database Manager for TenderSetu using ChromaDB.
    Handles semantic embeddings, similarity search, vendor matching, and document chunking.
    """
    def __init__(self, persist_dir: Optional[str] = None):
        if not CHROMA_AVAILABLE:
            self.collection = None
            return

        if persist_dir is None:
            # Default to scraper/vector_store directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            persist_dir = os.path.join(base_dir, "vector_store")

        os.makedirs(persist_dir, exist_ok=True)
        self.persist_dir = persist_dir

        self.client = chromadb.PersistentClient(path=self.persist_dir)
        # Using default all-MiniLM-L6-v2 ONNX embedding function built into ChromaDB
        self.collection = self.client.get_or_create_collection(
            name="tenders",
            metadata={"description": "TenderSetu Indian e-Procurement Semantic Vector Index"}
        )
        logger.info(f"[VectorDB] Initialized ChromaDB at: {self.persist_dir} (Indexed count: {self.collection.count()})")

    def is_ready(self) -> bool:
        return self.collection is not None

    def upsert_tender(
        self,
        tender_id: int,
        tender_ref: str,
        title: str,
        description: Optional[str] = None,
        authority_name: Optional[str] = None,
        location: Optional[str] = None,
        state_code: Optional[str] = None,
        sector_slug: Optional[str] = None,
        tender_value: Optional[float] = None,
        closes_at: Optional[str] = None,
        official_url: Optional[str] = None
    ) -> bool:
        """
        Embed and index a tender into ChromaDB.
        Creates a rich semantic document representation.
        """
        if not self.is_ready():
            return False

        try:
            # Construct a rich text representation for semantic embeddings
            parts = [f"Title: {title.strip()}"]
            if tender_ref:
                parts.append(f"Tender Reference: {tender_ref.strip()}")
            if authority_name:
                parts.append(f"Procuring Authority: {authority_name.strip()}")
            if sector_slug:
                parts.append(f"Sector: {sector_slug.replace('-', ' ').title()}")
            if location:
                parts.append(f"Work Location: {location.strip()}")
            if state_code:
                parts.append(f"State: {state_code.strip()}")
            if tender_value:
                parts.append(f"Estimated Cost: INR {tender_value:,.2f}")
            if closes_at:
                parts.append(f"Submission Deadline: {closes_at}")
            if description:
                # Add up to 1000 characters of description
                parts.append(f"Scope & Description: {description.strip()[:1000]}")

            document_text = "\n".join(parts)

            metadata: Dict[str, Any] = {
                "tender_id": int(tender_id),
                "tender_ref": str(tender_ref or "")[:100],
                "title": str(title or "")[:200],
                "state_code": str(state_code or "").upper(),
                "sector_slug": str(sector_slug or "").lower(),
                "tender_value": float(tender_value or 0.0),
                "closes_at": str(closes_at or ""),
                "authority_name": str(authority_name or "")[:150],
            }

            self.collection.upsert(
                ids=[str(tender_id)],
                documents=[document_text],
                metadatas=[metadata]
            )
            logger.info(f"[VectorDB] Successfully indexed tender #{tender_id} ({tender_ref})")
            return True
        except Exception as e:
            logger.error(f"[VectorDB] Failed to upsert tender #{tender_id}: {e}")
            return False

    def search_semantic(
        self,
        query: str,
        n_results: int = 10,
        state_code: Optional[str] = None,
        sector_slug: Optional[str] = None,
        min_value: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity search on tenders using natural language queries.
        Returns matched tenders with similarity scores and metadata.
        """
        if not self.is_ready():
            return []

        try:
            where_clauses = []
            if state_code:
                where_clauses.append({"state_code": state_code.upper()})
            if sector_slug:
                where_clauses.append({"sector_slug": sector_slug.lower()})

            where_filter = None
            if len(where_clauses) == 1:
                where_filter = where_clauses[0]
            elif len(where_clauses) > 1:
                where_filter = {"$and": where_clauses}

            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_filter,
                include=["metadatas", "documents", "distances"]
            )

            matched = []
            if results and results.get("ids") and len(results["ids"]) > 0:
                ids = results["ids"][0]
                distances = results["distances"][0] if "distances" in results else [0] * len(ids)
                metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(ids)

                for tid, dist, meta in zip(ids, distances, metas):
                    # ChromaDB distance by default is L2 or cosine distance.
                    # Convert distance to similarity score percentage (0-100%)
                    similarity_pct = max(0, min(100, round((1.0 - (dist / 2.0)) * 100, 1)))
                    matched.append({
                        "tender_id": int(tid),
                        "similarity_score": similarity_pct,
                        "distance": float(dist),
                        "metadata": meta
                    })

            return matched
        except Exception as e:
            logger.error(f"[VectorDB] Search error for query '{query}': {e}")
            return []

    def match_vendor_profile(self, vendor_profile_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Match a vendor's capability statement or company profile against tenders.
        Useful for proactive tender recommendation alerts.
        """
        return self.search_semantic(query=vendor_profile_text, n_results=n_results)

    def count(self) -> int:
        if not self.is_ready():
            return 0
        return self.collection.count()
