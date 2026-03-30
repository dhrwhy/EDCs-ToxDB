from sqlalchemy import Column, BigInteger, Integer, String, Text, DateTime, func
from app.database import Base


class RecordAsset(Base):
    __tablename__ = "record_assets"

    asset_id = Column(BigInteger, primary_key=True, autoincrement=True)
    deseq_id = Column(String(50), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_ext = Column(String(10), nullable=False)
    asset_category = Column(String(50), nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    parse_mode = Column(String(20), nullable=False, default="none")
    status = Column(String(20), nullable=False, default="available", index=True)
    remark = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
