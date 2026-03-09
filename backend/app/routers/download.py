from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse
from app.schemas.common import error_response
from app.config import settings
from urllib.parse import quote

router = APIRouter(prefix="/api/download", tags=["下载"])


@router.get("/database")
def download_database():
    """下载整库 Excel 文件"""
    excel_path = Path(settings.EXCEL_PATH)

    if not excel_path.exists():
        return JSONResponse(
            status_code=404,
            content=error_response(404, "数据库文件未找到"),
        )

    filename = excel_path.name
    encoded_filename = quote(filename)
    return FileResponse(
        path=str(excel_path),
        filename=filename,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
        },
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
