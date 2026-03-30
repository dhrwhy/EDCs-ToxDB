from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, asc, desc
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

    year_row = db.query(
        func.min(MainRecord.publication_year).label("min"),
        func.max(MainRecord.publication_year).label("max"),
    ).filter(MainRecord.publication_year.isnot(None)).first()

    year_range = {
        "min": year_row.min if year_row else None,
        "max": year_row.max if year_row else None,
    }

    organism_rows = (
        db.query(MainRecord.organism)
        .filter(MainRecord.organism.isnot(None))
        .distinct()
        .order_by(MainRecord.organism)
        .all()
    )
    organisms = [r.organism for r in organism_rows]

    vivo_rows = (
        db.query(MainRecord.in_vivo_vitro)
        .filter(MainRecord.in_vivo_vitro.isnot(None))
        .distinct()
        .order_by(MainRecord.in_vivo_vitro)
        .all()
    )
    in_vivo_vitro_options = [r.in_vivo_vitro for r in vivo_rows]

    strain_rows = (
        db.query(MainRecord.strain)
        .filter(MainRecord.strain.isnot(None))
        .distinct()
        .order_by(MainRecord.strain)
        .all()
    )
    strains = [r.strain for r in strain_rows]

    gender_rows = (
        db.query(MainRecord.gender)
        .filter(MainRecord.gender.isnot(None))
        .distinct()
        .order_by(MainRecord.gender)
        .all()
    )
    genders = [r.gender for r in gender_rows]

    return success_response({
        "tissue_categories": tissue_categories,
        "year_range": year_range,
        "organisms": organisms,
        "in_vivo_vitro_options": in_vivo_vitro_options,
        "strains": strains,
        "genders": genders,
    })


@router.get("")
def browse(
    tissue_category: Optional[str] = Query(None, description="组织分类筛选（多个逗号分隔）"),
    year_min: Optional[int] = Query(None, description="发表年份最小值"),
    year_max: Optional[int] = Query(None, description="发表年份最大值"),
    organism: Optional[str] = Query(None, description="物种筛选（多个逗号分隔）"),
    in_vivo_vitro: Optional[str] = Query(None, description="体内/体外筛选（多个逗号分隔）"),
    strain: Optional[str] = Query(None, description="品系筛选（多个逗号分隔）"),
    gender: Optional[str] = Query(None, description="性别筛选（多个逗号分隔）"),
    sort_by: Optional[str] = Query("deseq_id", description="排序字段: deseq_id, chemical_name, publication_year, gse_id"),
    sort_order: Optional[str] = Query("asc", description="排序方向: asc, desc"),
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
        func.min(MainRecord.alternative_names).label("alternative_names"),
        func.min(MainRecord.gse_id).label("gse_id"),
        func.min(MainRecord.bioproject_id).label("bioproject_id"),
        func.min(MainRecord.organism).label("organism"),
        func.min(MainRecord.tissue_category).label("tissue_category"),
        func.min(MainRecord.tissue_subcategory).label("tissue_subcategory"),
        func.min(MainRecord.platform).label("platform"),
        func.min(MainRecord.publication_year).label("publication_year"),
        func.min(MainRecord.dose).label("dose"),
        func.min(MainRecord.cell_type).label("cell_type"),
        func.min(MainRecord.doi).label("doi"),
    )

    # 筛选条件
    if tissue_category:
        categories = [c.strip() for c in tissue_category.split(",")]
        query = query.filter(MainRecord.tissue_category.in_(categories))

    if year_min is not None:
        query = query.filter(MainRecord.publication_year >= year_min)

    if year_max is not None:
        query = query.filter(MainRecord.publication_year <= year_max)

    if organism:
        organisms = [o.strip() for o in organism.split(",")]
        query = query.filter(MainRecord.organism.in_(organisms))

    if in_vivo_vitro:
        options = [v.strip() for v in in_vivo_vitro.split(",")]
        query = query.filter(MainRecord.in_vivo_vitro.in_(options))

    if strain:
        strains = [s.strip() for s in strain.split(",")]
        query = query.filter(MainRecord.strain.in_(strains))

    if gender:
        genders = [g.strip() for g in gender.split(",")]
        query = query.filter(MainRecord.gender.in_(genders))

    query = query.group_by(MainRecord.analysis_key)

    # 排序
    sort_map = {
        "deseq_id": func.min(MainRecord.deseq_id),
        "chemical_name": func.min(MainRecord.chemical_name),
        "publication_year": func.min(MainRecord.publication_year),
        "gse_id": func.min(MainRecord.gse_id),
    }
    sort_col = sort_map.get(sort_by, func.min(MainRecord.deseq_id))
    if sort_order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

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
            "alternative_names": r.alternative_names,
            "gse_id": r.gse_id,
            "bioproject_id": r.bioproject_id,
            "organism": r.organism,
            "tissue_category": r.tissue_category,
            "tissue_subcategory": r.tissue_subcategory,
            "platform": r.platform,
            "publication_year": r.publication_year,
            "dose": r.dose,
            "cell_type": r.cell_type,
            "doi": r.doi,
            "has_assets": r.deseq_id in assets_set,
        })

    return success_response({
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    })
