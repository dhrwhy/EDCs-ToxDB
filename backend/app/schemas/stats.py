from pydantic import BaseModel
from typing import List, Optional


class StatisticsAsset(BaseModel):
    name: str
    title: str
    type: str
    url: str


class StatsSummary(BaseModel):
    record_rows: int
    analysis_groups: int
    unique_chemicals: int
    unique_deseq_id: int
    unique_srr_id: int
    unique_gse_id: int
    unique_bioproject_id: int
    statistics_assets: List[StatisticsAsset] = []
