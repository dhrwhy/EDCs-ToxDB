import pandas as pd
import math
from pathlib import Path


def parse_deg_table(file_path: str, page: int = 1, page_size: int = 30) -> dict:
    """解析 deg_table.txt 并返回分页结果"""
    p = Path(file_path)
    if not p.exists():
        return {
            "name": "deg_table",
            "error": "文件不存在",
            "columns": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "items": [],
        }

    try:
        df = pd.read_csv(p, sep="\t")
    except Exception:
        return {
            "name": "deg_table",
            "error": "文件解析失败",
            "columns": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "items": [],
        }

    total = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    # 将 NaN 替换为 None 以便 JSON 序列化
    items = []
    for record in page_df.to_dict(orient="records"):
        cleaned = {}
        for k, v in record.items():
            if isinstance(v, float) and math.isnan(v):
                cleaned[k] = None
            else:
                cleaned[k] = v
        items.append(cleaned)

    return {
        "name": "deg_table",
        "columns": list(df.columns),
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }
