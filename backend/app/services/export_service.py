import io
from datetime import datetime
import pandas as pd


def generate_export_excel(items: list) -> tuple[io.BytesIO, str]:
    """将搜索结果列表转换为 Excel 文件流"""
    df = pd.DataFrame(items)

    # 生成文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"MouseToxDB_搜索结果_{timestamp}.xlsx"

    # 生成 Excel
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="搜索结果")
    buffer.seek(0)

    return buffer, filename
