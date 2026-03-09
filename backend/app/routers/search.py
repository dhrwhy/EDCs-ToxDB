from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.common import success_response
from app.services.search_service import search_analyses, search_all_for_export
from app.services.export_service import generate_export_excel
from urllib.parse import quote

router = APIRouter(prefix="/api/search", tags=["搜索"])


@router.get("")
def search(
    keyword: str = Query(..., description="搜索关键词"),
    category: str = Query("all", description="搜索分类: all/cas/inchikey/chemical_name/pubchem_cid/deseq_id"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(30, ge=1, le=30, description="每页条数"),
    db: Session = Depends(get_db),
):
    """搜索分析条目"""
    result = search_analyses(db, keyword, category, page, page_size)
    return success_response(result)


@router.get("/export")
def export_search_results(
    keyword: str = Query(..., description="搜索关键词"),
    category: str = Query("all", description="搜索分类"),
    db: Session = Depends(get_db),
):
    """导出搜索结果为 Excel"""
    items = search_all_for_export(db, keyword, category)
    buffer, filename = generate_export_excel(items)

    encoded_filename = quote(filename)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
    }

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
