from pathlib import Path
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.common import error_response
from app.services.asset_service import get_asset_file_path
from urllib.parse import quote

router = APIRouter(prefix="/api/assets", tags=["资源"])


@router.get("/{asset_id}/download")
def download_asset(asset_id: int, db: Session = Depends(get_db)):
    """下载单个资源文件"""
    asset_info, full_path = get_asset_file_path(db, asset_id)

    if asset_info is None:
        return JSONResponse(
            status_code=404,
            content=error_response(404, "资源不存在"),
        )

    if not Path(full_path).exists():
        return JSONResponse(
            status_code=404,
            content=error_response(404, "资源文件未找到"),
        )

    encoded_filename = quote(asset_info["file_name"])
    return FileResponse(
        path=full_path,
        filename=asset_info["file_name"],
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
        },
    )
