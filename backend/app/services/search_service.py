from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.main_record import MainRecord
from app.models.record_asset import RecordAsset


def build_search_query(db: Session, keyword: str, category: str = "all"):
    """构建搜索查询，按 analysis_key 去重返回分析条目级结果"""
    like_keyword = f"%{keyword}%"

    # 使用 MIN() 包裹非分组列，满足 ONLY_FULL_GROUP_BY 要求
    # 同一 analysis_key 下这些字段值相同，MIN 不影响结果
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

    # 根据 category 构建 WHERE 条件
    if category == "cas":
        query = query.filter(MainRecord.cas_id == keyword)
    elif category == "inchikey":
        query = query.filter(MainRecord.inchi_key == keyword)
    elif category == "chemical_name":
        query = query.filter(
            or_(
                MainRecord.chemical_name.like(like_keyword),
                MainRecord.alternative_names.like(like_keyword),
                MainRecord.pubchem_name.like(like_keyword),
            )
        )
    elif category == "pubchem_cid":
        query = query.filter(MainRecord.pubchem_cid == keyword)
    elif category == "deseq_id":
        query = query.filter(MainRecord.deseq_id == keyword)
    else:
        # category == "all"：4 精确 + 3 模糊
        query = query.filter(
            or_(
                MainRecord.cas_id == keyword,
                MainRecord.inchi_key == keyword,
                MainRecord.pubchem_cid == keyword,
                MainRecord.deseq_id == keyword,
                MainRecord.chemical_name.like(like_keyword),
                MainRecord.alternative_names.like(like_keyword),
                MainRecord.pubchem_name.like(like_keyword),
            )
        )

    query = query.group_by(MainRecord.analysis_key)
    query = query.order_by(func.min(MainRecord.chemical_id).asc(), func.min(MainRecord.deseq_id).asc())

    return query


def search_analyses(db: Session, keyword: str, category: str = "all",
                    page: int = 1, page_size: int = 30) -> dict:
    """搜索分析条目，返回分页结果"""
    query = build_search_query(db, keyword, category)

    # 获取总数：用子查询避免再次触发 GROUP BY 问题
    total_query = query.subquery()
    total = db.query(func.count()).select_from(total_query).scalar()

    # 分页
    offset = (page - 1) * page_size
    rows = query.offset(offset).limit(page_size).all()

    # 获取所有结果中的 deseq_id 列表，查询哪些有资源
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

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }


def search_all_for_export(db: Session, keyword: str, category: str = "all") -> list:
    """搜索全部结果（不分页），用于导出"""
    query = build_search_query(db, keyword, category)
    rows = query.all()

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
        })

    return items
