from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.main_record import MainRecord
from app.models.record_asset import RecordAsset
from app.schemas.common import success_response

router = APIRouter(prefix="/api/browse", tags=["浏览"])


@router.get("/filters")
def get_filters(db: Session = Depends(get_db)):
    """获取浏览页筛选选项"""
    tissue_rows = (
        db.query(MainRecord.tissue_category)
        .filter(MainRecord.tissue_category.isnot(None))
        .distinct()
        .order_by(MainRecord.tissue_category)
        .all()
    )
    tissue_categories = [r.tissue_category for r in tissue_rows]

    method_rows = (
        db.query(MainRecord.library_method)
        .filter(MainRecord.library_method.isnot(None))
        .distinct()
        .order_by(MainRecord.library_method)
        .all()
    )
    library_methods = [r.library_method for r in method_rows]

    year_row = db.query(
        func.min(MainRecord.publication_year).label("min"),
        func.max(MainRecord.publication_year).label("max"),
    ).filter(MainRecord.publication_year.isnot(None)).first()

    year_range = {
        "min": year_row.min if year_row else None,
        "max": year_row.max if year_row else None,
    }

    return success_response({
        "tissue_categories": tissue_categories,
        "library_methods": library_methods,
        "year_range": year_range,
    })


@router.get("")
def browse(
    tissue_category: Optional[str] = Query(None, description="组织分类筛选（多个逗号分隔）"),
    library_method: Optional[str] = Query(None, description="建库方法筛选（多个逗号分隔）"),
    year_min: Optional[int] = Query(None, description="发表年份最小值"),
    year_max: Optional[int] = Query(None, description="发表年份最大值"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(30, ge=1, le=100, description="每页条数"),
    db: Session = Depends(get_db),
):
    """浏览所有分析条目（支持筛选）"""
    query = db.query(
        MainRecord.analysis_key,
        func.min(MainRecord.deseq_id).label("deseq_id"),
        func.min(MainRecord.chemical_id).label("chemical_id"),
        func.min(MainRecord.sort_id).label("sort_id"),
        func.min(MainRecord.cas_id).label("cas_id"),
        func.min(MainRecord.chemical_name).label("chemical_name"),
        func.min(MainRecord.pubchem_cid).label("pubchem_cid"),
        func.min(MainRecord.pubchem_name).label("pubchem_name"),
        func.min(MainRecord.gse_id).label("gse_id"),
        func.min(MainRecord.bioproject_id).label("bioproject_id"),
        func.min(MainRecord.organism).label("organism"),
        func.min(MainRecord.tissue_category).label("tissue_category"),
        func.min(MainRecord.library_method).label("library_method"),
        func.min(MainRecord.platform).label("platform"),
        func.min(MainRecord.publication_year).label("publication_year"),
        func.count().label("sample_count"),
    )

    # 筛选条件
    if tissue_category:
        categories = [c.strip() for c in tissue_category.split(",")]
        query = query.filter(MainRecord.tissue_category.in_(categories))

    if library_method:
        methods = [m.strip() for m in library_method.split(",")]
        query = query.filter(MainRecord.library_method.in_(methods))

    if year_min is not None:
        query = query.filter(MainRecord.publication_year >= year_min)

    if year_max is not None:
        query = query.filter(MainRecord.publication_year <= year_max)

    query = query.group_by(MainRecord.analysis_key)
    query = query.order_by(func.min(MainRecord.chemical_id).asc(), func.min(MainRecord.deseq_id).asc())

    # 总数
    total_query = query.subquery()
    total = db.query(func.count()).select_from(total_query).scalar()

    # 分页
    offset = (page - 1) * page_size
    rows = query.offset(offset).limit(page_size).all()

    # 判断 has_assets
    deseq_ids = [r.deseq_id for r in rows]
    assets_set = set()
    if deseq_ids:
        existing = (
            db.query(RecordAsset.deseq_id)
            .filter(RecordAsset.deseq_id.in_(deseq_ids))
            .distinct()
            .all()
        )
        assets_set = {r.deseq_id for r in existing}

    items = []
    for r in rows:
        items.append({
            "analysis_key": r.analysis_key,
            "deseq_id": r.deseq_id,
            "chemical_id": r.chemical_id,
            "sort_id": r.sort_id,
            "cas_id": r.cas_id,
            "chemical_name": r.chemical_name,
            "pubchem_cid": r.pubchem_cid,
            "pubchem_name": r.pubchem_name,
            "gse_id": r.gse_id,
            "bioproject_id": r.bioproject_id,
            "organism": r.organism,
            "tissue_category": r.tissue_category,
            "library_method": r.library_method,
            "platform": r.platform,
            "publication_year": r.publication_year,
            "sample_count": r.sample_count,
            "has_assets": r.deseq_id in assets_set,
        })

    return success_response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    })
