from sqlalchemy.orm import Session
from app.models.main_record import MainRecord
from app.models.record_asset import RecordAsset
from app.config import settings


def get_analysis_detail(db: Session, analysis_key: str) -> dict | None:
    """获取分析条目详情：summary + sample_records + assets"""

    # 查询该 analysis_key 的所有记录
    records = (
        db.query(MainRecord)
        .filter(MainRecord.analysis_key == analysis_key)
        .all()
    )

    if not records:
        return None

    # summary：取第一条记录的非样本字段
    first = records[0]
    summary = {
        "sort_id": first.sort_id,
        "chemical_id": first.chemical_id,
        "cas_id": first.cas_id,
        "inchi_key": first.inchi_key,
        "chemical_name": first.chemical_name,
        "alternative_names": first.alternative_names,
        "pubchem_cid": first.pubchem_cid,
        "pubchem_name": first.pubchem_name,
        "from_group": first.from_group,
        "evidence": first.evidence,
        "gse_id": first.gse_id,
        "bioproject_id": first.bioproject_id,
        "organism": first.organism,
        "platform": first.platform,
        "tissue_category": first.tissue_category,
        "tissue_subcategory": first.tissue_subcategory,
        "reproductive_subcategory": first.reproductive_subcategory,
        "tissue_or_cell_line": first.tissue_or_cell_line,
        "exposure_toxicant": first.exposure_toxicant,
        "library_method": first.library_method,
        "library_method_detail": first.library_method_detail,
        "publication_year": first.publication_year,
        "publication_month": first.publication_month,
        "reference_title": first.reference_title,
        "doi": first.doi,
        "summary_text": first.summary_text,
        "strain": first.strain,
        "in_vivo_vitro": first.in_vivo_vitro,
        "gender": first.gender,
        "class1_code": first.class1_code,
        "class2_code": first.class2_code,
        "class3_name": first.class3_name,
        "class4_name": first.class4_name,
        "class5_name": first.class5_name,
        "class6_name": first.class6_name,
        "class7_name": first.class7_name,
        "inferred_class": first.inferred_class,
    }

    # sample_records：取所有记录的样本字段
    sample_records = []
    for r in records:
        sample_records.append({
            "srr_id": r.srr_id,
            "avg_spot_len": r.avg_spot_len,
            "cell_type": r.cell_type,
            "library_layout": r.library_layout,
            "treatment": r.treatment,
            "experiment_group": r.experiment_group,
            "chem_name": r.chem_name,
            "dose": r.dose,
            "exposure_time": r.exposure_time,
        })

    # assets：通过 deseq_id 查 record_assets
    deseq_id = first.deseq_id
    asset_rows = (
        db.query(RecordAsset)
        .filter(RecordAsset.deseq_id == deseq_id)
        .filter(RecordAsset.status != "no_result")
        .order_by(RecordAsset.sort_order.asc())
        .all()
    )

    prefix = settings.URL_PREFIX

    assets = []
    for a in asset_rows:
        # PDF 资源优先使用 PNG 预览图
        if a.file_ext == "pdf":
            png_path = a.file_path.rsplit(".", 1)[0] + ".png"
            preview_url = f"{prefix}/static/assets/{png_path}"
        else:
            preview_url = f"{prefix}/static/assets/{a.file_path}"

        assets.append({
            "asset_id": a.asset_id,
            "deseq_id": a.deseq_id,
            "display_name": a.display_name,
            "asset_category": a.asset_category,
            "file_ext": a.file_ext,
            "preview_url": preview_url,
            "download_url": f"{prefix}/api/assets/{a.asset_id}/download",
            "status": a.status,
        })

    return {
        "analysis_key": analysis_key,
        "deseq_id": deseq_id,
        "summary": summary,
        "sample_records": sample_records,
        "assets": assets,
    }


def get_assets_by_analysis_key(db: Session, analysis_key: str) -> list | None:
    """获取分析条目的资源列表"""
    record = (
        db.query(MainRecord.deseq_id)
        .filter(MainRecord.analysis_key == analysis_key)
        .first()
    )

    if not record:
        return None

    deseq_id = record.deseq_id
    prefix = settings.URL_PREFIX
    asset_rows = (
        db.query(RecordAsset)
        .filter(RecordAsset.deseq_id == deseq_id)
        .filter(RecordAsset.status != "no_result")
        .order_by(RecordAsset.sort_order.asc())
        .all()
    )

    assets = []
    for a in asset_rows:
        if a.file_ext == "pdf":
            png_path = a.file_path.rsplit(".", 1)[0] + ".png"
            preview_url = f"{prefix}/static/assets/{png_path}"
        else:
            preview_url = f"{prefix}/static/assets/{a.file_path}"

        assets.append({
            "asset_id": a.asset_id,
            "deseq_id": a.deseq_id,
            "display_name": a.display_name,
            "asset_category": a.asset_category,
            "file_ext": a.file_ext,
            "preview_url": preview_url,
            "download_url": f"{prefix}/api/assets/{a.asset_id}/download",
            "status": a.status,
        })

    return assets
