from pydantic import BaseModel
from typing import Optional


class AnalysisItem(BaseModel):
    analysis_key: str
    deseq_id: str
    chemical_id: int
    sort_id: int
    cas_id: str
    chemical_name: str
    pubchem_cid: str
    pubchem_name: str
    gse_id: str
    bioproject_id: str
    organism: str
    tissue_category: str
    library_method: Optional[str] = None
    platform: str
    publication_year: Optional[int] = None
    sample_count: int
    has_assets: bool

    class Config:
        from_attributes = True
