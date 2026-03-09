from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.main_record import MainRecord
from app.schemas.common import success_response
from app.config import settings

router = APIRouter(prefix="/api/stats", tags=["统计"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """获取统计摘要"""
    row = db.query(
        func.count().label("record_rows"),
        func.count(distinct(MainRecord.analysis_key)).label("analysis_groups"),
        func.count(distinct(MainRecord.chemical_id)).label("unique_chemicals"),
        func.count(distinct(MainRecord.deseq_id)).label("unique_deseq_id"),
        func.count(distinct(MainRecord.srr_id)).label("unique_srr_id"),
        func.count(distinct(MainRecord.gse_id)).label("unique_gse_id"),
        func.count(distinct(MainRecord.bioproject_id)).label("unique_bioproject_id"),
    ).first()

    # 扫描统计图片目录
    statistics_assets = []
    stats_dir = Path(settings.STATISTICS_DIR)
    if stats_dir.exists():
        for f in sorted(stats_dir.iterdir()):
            if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".svg"):
                statistics_assets.append({
                    "name": f.stem,
                    "title": f.stem.replace("_", " ").title(),
                    "type": "image",
                    "url": f"/static/statistics/{f.name}",
                })

    data = {
        "record_rows": row.record_rows,
        "analysis_groups": row.analysis_groups,
        "unique_chemicals": row.unique_chemicals,
        "unique_deseq_id": row.unique_deseq_id,
        "unique_srr_id": row.unique_srr_id,
        "unique_gse_id": row.unique_gse_id,
        "unique_bioproject_id": row.unique_bioproject_id,
        "statistics_assets": statistics_assets,
    }

    return success_response(data)
