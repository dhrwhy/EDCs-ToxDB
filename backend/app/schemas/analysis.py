from pydantic import BaseModel
from typing import Optional, List


class AnalysisSummary(BaseModel):
    sort_id: int
    chemical_id: int
    cas_id: str
    inchi_key: str
    chemical_name: str
    alternative_names: Optional[str] = None
    pubchem_cid: str
    pubchem_name: str
    from_group: str
    evidence: str
    gse_id: str
    bioproject_id: str
    organism: str
    platform: str
    tissue_category: str
    tissue_subcategory: Optional[str] = None
    reproductive_subcategory: Optional[str] = None
    tissue_or_cell_line: str
    exposure_toxicant: Optional[str] = None
    library_method: Optional[str] = None
    library_method_detail: Optional[str] = None
    publication_year: Optional[int] = None
    publication_month: Optional[int] = None
    reference_title: Optional[str] = None
    doi: Optional[str] = None
    class1_code: str
    class2_code: str
    class3_name: Optional[str] = None
    class4_name: Optional[str] = None
    class5_name: Optional[str] = None
    class6_name: Optional[str] = None
    class7_name: Optional[str] = None
    inferred_class: Optional[str] = None

    class Config:
        from_attributes = True


class SampleRecord(BaseModel):
    srr_id: str
    avg_spot_len: int
    cell_type: Optional[str] = None
    library_layout: str
    treatment: Optional[str] = None
    experiment_group: str
    chem_name: Optional[str] = None
    dose: Optional[str] = None
    exposure_time: Optional[str] = None

    class Config:
        from_attributes = True


class AssetInfo(BaseModel):
    asset_id: int
    deseq_id: str
    display_name: str
    asset_category: str
    file_ext: str
    preview_url: str
    download_url: str
    status: str

    class Config:
        from_attributes = True


class AnalysisDetail(BaseModel):
    analysis_key: str
    deseq_id: str
    summary: AnalysisSummary
    sample_records: List[SampleRecord]
    assets: List[AssetInfo]
