from pathlib import Path
from sqlalchemy.orm import Session
from app.models.record_asset import RecordAsset
from app.config import settings


def get_asset_file_path(db: Session, asset_id: int) -> tuple[dict | None, str | None]:
    """获取资源文件的完整路径，返回 (asset_info, full_path) 或 (None, None)"""
    asset = db.query(RecordAsset).filter(RecordAsset.asset_id == asset_id).first()
    if not asset:
        return None, None

    full_path = str(Path(settings.ASSETS_DIR) / asset.file_path)
    asset_info = {
        "asset_id": asset.asset_id,
        "file_name": asset.file_name,
        "file_path": full_path,
        "file_ext": asset.file_ext,
    }

    return asset_info, full_path
