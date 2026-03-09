from pathlib import Path
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.main_record import MainRecord
from app.schemas.common import success_response, error_response
from app.services.analysis_service import get_analysis_detail, get_assets_by_analysis_key
from app.services.txt_parser import parse_deg_table
from app.config import settings

router = APIRouter(prefix="/api/analysis", tags=["详情"])


@router.get("/{analysis_key}")
def get_analysis(analysis_key: str, db: Session = Depends(get_db)):
    """获取分析条目详情"""
    detail = get_analysis_detail(db, analysis_key)
    if detail is None:
        return JSONResponse(
            status_code=404,
            content=error_response(404, "分析条目未找到"),
        )
    return success_response(detail)


@router.get("/{analysis_key}/tables/deg-table")
def get_deg_table(
    analysis_key: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """获取 DEG 差异基因表（分页）"""
    # 通过 analysis_key 查到 deseq_id
    record = (
        db.query(MainRecord.deseq_id)
        .filter(MainRecord.analysis_key == analysis_key)
        .first()
    )

    if not record:
        return JSONResponse(
            status_code=404,
            content=error_response(404, "分析条目未找到"),
        )

    deseq_id = record.deseq_id
    file_path = str(
        Path(settings.ASSETS_DIR) / deseq_id / f"{deseq_id}_deg_table.txt"
    )

    result = parse_deg_table(file_path, page, page_size)
    return success_response(result)


@router.get("/{analysis_key}/assets")
def get_analysis_assets(analysis_key: str, db: Session = Depends(get_db)):
    """获取分析条目的资源列表"""
    assets = get_assets_by_analysis_key(db, analysis_key)
    if assets is None:
        return JSONResponse(
            status_code=404,
            content=error_response(404, "分析条目未找到"),
        )
    return success_response(assets)
