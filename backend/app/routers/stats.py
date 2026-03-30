from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy import func, distinct, case
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


@router.get("/publication-years")
def get_publication_years(db: Session = Depends(get_db)):
    """获取按年份分组的发表数量（analysis_key 级别去重）"""
    rows = (
        db.query(
            MainRecord.publication_year.label("year"),
            func.count(distinct(MainRecord.analysis_key)).label("count"),
        )
        .filter(MainRecord.publication_year.isnot(None))
        .group_by(MainRecord.publication_year)
        .order_by(MainRecord.publication_year.asc())
        .all()
    )

    data = [{"year": r.year, "count": r.count} for r in rows]
    return success_response(data)


@router.get("/organ-distribution")
def get_organ_distribution(db: Session = Depends(get_db)):
    """获取器官/组织分布数据"""
    rows = (
        db.query(
            MainRecord.tissue_category,
            MainRecord.tissue_subcategory,
            func.count(distinct(MainRecord.analysis_key)).label("count"),
        )
        .filter(MainRecord.tissue_category.isnot(None))
        .group_by(MainRecord.tissue_category, MainRecord.tissue_subcategory)
        .order_by(MainRecord.tissue_category, MainRecord.tissue_subcategory)
        .all()
    )

    data = []
    for r in rows:
        data.append({
            "tissue_category": r.tissue_category,
            "tissue_subcategory": r.tissue_subcategory,
            "count": r.count,
        })

    return success_response(data)


@router.get("/mesh-tree")
def get_mesh_tree(db: Session = Depends(get_db)):
    """获取 MESH 分类树状结构"""
    records = (
        db.query(
            MainRecord.chemical_name,
            MainRecord.deseq_id,
            MainRecord.analysis_key,
            MainRecord.class1_code,
            MainRecord.class2_code,
            MainRecord.class3_name,
            MainRecord.class4_name,
            MainRecord.class5_name,
            MainRecord.class6_name,
            MainRecord.class7_name,
            MainRecord.inferred_class,
        )
        .group_by(
            MainRecord.analysis_key,
            MainRecord.chemical_name,
            MainRecord.deseq_id,
            MainRecord.class1_code,
            MainRecord.class2_code,
            MainRecord.class3_name,
            MainRecord.class4_name,
            MainRecord.class5_name,
            MainRecord.class6_name,
            MainRecord.class7_name,
            MainRecord.inferred_class,
        )
        .all()
    )

    # Build tree using nested dict: key -> {children: {}, chemicals: []}
    def make_node():
        return {"children": {}, "chemicals": []}

    root = make_node()

    for r in records:
        levels = [
            r.class1_code,
            r.class2_code,
            r.class3_name,
            r.class4_name,
            r.class5_name,
            r.class6_name,
            r.class7_name,
            r.inferred_class,
        ]
        # Truncate to last non-None value
        path = []
        for lv in levels:
            if lv is not None:
                path.append(lv)
            else:
                break

        # Navigate/create tree nodes
        current = root
        for level_name in path:
            if level_name not in current["children"]:
                current["children"][level_name] = make_node()
            current = current["children"][level_name]

        # Add chemical as leaf at deepest node
        existing_keys = {c["analysis_key"] for c in current["chemicals"]}
        if r.analysis_key not in existing_keys:
            current["chemicals"].append({
                "chemical_name": r.chemical_name,
                "deseq_id": r.deseq_id,
                "analysis_key": r.analysis_key,
            })

    def build_tree_nodes(node):
        """Recursively convert internal tree to output format"""
        result = []
        for name in sorted(node["children"].keys()):
            child = node["children"][name]
            result.append({
                "name": name,
                "children": build_tree_nodes(child),
                "chemicals": child["chemicals"],
            })
        return result

    tree_data = build_tree_nodes(root)
    return success_response(tree_data)
