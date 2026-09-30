from typing import Optional, List
from pydantic import BaseModel

class DocumentSchema(BaseModel):
    title: str
    file_url: str
    file_size: Optional[str] = None
    file_type: Optional[str] = "pdf"

class ScrapedTenderSchema(BaseModel):
    portal_code: str
    tender_ref: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = "India"
    authority_name: Optional[str] = "Government Organization"
    state_code: Optional[str] = "DL"
    sector_slug: Optional[str] = "transport"
    tender_value: Optional[float] = None
    emd_amount: Optional[float] = None
    document_fee: Optional[float] = None
    status: str = "live"
    published_at: Optional[str] = None
    submission_start_at: Optional[str] = None
    closes_at: Optional[str] = None
    opening_at: Optional[str] = None
    official_url: Optional[str] = None
    documents: List[DocumentSchema] = []
    raw_hash: str
