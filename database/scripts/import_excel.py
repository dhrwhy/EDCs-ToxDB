#!/usr/bin/env python3
"""
MouseToxDB — Excel 数据导入脚本

功能：
  1. 读取 Excel 文件 (Sheet1, 第3行表头, 第4行起数据)
  2. 按清洗规则处理每行数据
  3. 生成 analysis_key
  4. 批量插入 main_records 表

用法：
  python scripts/import_excel.py                          # 使用 .env 中的配置
  python scripts/import_excel.py --excel /path/to/file.xlsx  # 指定 Excel 路径
"""

import os
import sys
import argparse
import logging
from pathlib import Path

import openpyxl
import pymysql

# ============================================================
# 配置
# ============================================================

# 尝试加载 .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / "config" / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        env_example = Path(__file__).resolve().parent.parent / "config" / ".env.example"
        if env_example.exists():
            load_dotenv(env_example)
except ImportError:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

# Excel 列名 → 数据库字段名 映射 (按 Excel 列顺序, 共43列)
COLUMN_MAPPING = [
    ("Sort_ID",              "sort_id"),
    ("ID",                   "chemical_id"),
    ("CAS_ID",               "cas_id"),
    ("InChIKey",             "inchi_key"),
    ("Chemical_Name",        "chemical_name"),
    ("Alternative_Names",    "alternative_names"),
    ("PubChem_CID",          "pubchem_cid"),
    ("PubChem_Name",         "pubchem_name"),
    ("DESEQ_ID",             "deseq_id"),
    ("FromGroup",            "from_group"),
    ("Evidence",             "evidence"),
    ("GSE_ID",               "gse_id"),
    ("SRR_ID",               "srr_id"),
    ("BioProject",           "bioproject_id"),
    ("AvgSpotLen",           "avg_spot_len"),
    ("cell_type",            "cell_type"),
    ("_col17_blank",         "library_layout"),       # 第17列表头为空白
    ("Organism",             "organism"),
    ("Platform",             "platform"),
    ("treatment",            "treatment"),
    ("Group",                "experiment_group"),
    ("Chem_Name",            "chem_name"),
    ("剂量",                 "dose"),
    ("时间",                 "exposure_time"),
    ("组织分类",              "tissue_category"),
    ("组织细分",              "tissue_subcategory"),
    ("生殖细分",              "reproductive_subcategory"),
    ("组织/细胞系",           "tissue_or_cell_line"),
    ("暴露毒物",              "exposure_toxicant"),
    ("建库方法",              "library_method"),
    ("详细建库方法",           "library_method_detail"),
    ("发表年（1900-2030）",   "publication_year"),
    ("发表月（1-12）",        "publication_month"),
    ("参考文献",              "reference_title"),
    ("DOI",                  "doi"),
    ("Class1",               "class1_code"),
    ("Class2",               "class2_code"),
    ("Class3",               "class3_name"),
    ("Class4",               "class4_name"),
    ("Class5",               "class5_name"),
    ("Class6",               "class6_name"),
    ("Class7",               "class7_name"),
    ("infer_Class",          "inferred_class"),
]

# 裸值 "0" 应视为 NULL 的字段
ZERO_AS_NULL_FIELDS = {
    "dose", "tissue_subcategory", "reproductive_subcategory",
    "exposure_toxicant", "library_method", "library_method_detail",
    "publication_year", "publication_month", "reference_title", "doi",
    "class3_name", "class4_name", "class5_name",
    "class6_name", "class7_name", "inferred_class",
}

# 需要转为整数的字段
INT_FIELDS = {"sort_id", "chemical_id", "avg_spot_len", "publication_year", "publication_month"}


# ============================================================
# 数据清洗
# ============================================================

def clean_value(value):
    """去除首尾空格和不可见字符, 空字符串转 None, 解码 HTML 实体"""
    if value is None:
        return None
    if isinstance(value, str):
        # 去除常规空格 + \xa0 等不可见空白
        value = value.strip().strip("\xa0").strip()
        if value == "":
            return None
        # 解码 HTML 实体 (如 &#039; → ')
        import html
        value = html.unescape(value)
    return value


def clean_row(row_dict):
    """对一行数据应用所有清洗规则"""
    cleaned = {}
    for db_field, value in row_dict.items():
        value = clean_value(value)

        # 规则3: 裸值 "0" → NULL (排除带单位的, 如 "0 ppm")
        if db_field in ZERO_AS_NULL_FIELDS and value is not None:
            if str(value).strip() == "0":
                value = None

        # 规则4: 数值字段转整数
        if db_field in INT_FIELDS and value is not None:
            try:
                value = int(float(value))
            except (ValueError, TypeError):
                log.warning(f"字段 {db_field} 值 '{value}' 无法转为整数, 设为 NULL")
                value = None

        cleaned[db_field] = value

    return cleaned


def generate_analysis_key(row):
    """生成 analysis_key: {deseq_id}__{chemical_id}__{gse_id}__{bioproject_id}"""
    return f"{row['deseq_id']}__{row['chemical_id']}__{row['gse_id']}__{row['bioproject_id']}"


# ============================================================
# Excel 读取
# ============================================================

def read_excel(excel_path):
    """读取 Excel, 返回清洗后的记录列表"""
    log.info(f"正在读取 Excel: {excel_path}")

    wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
    ws = wb["Sheet1"]

    # 第3行是表头, 第4行开始是数据
    rows = list(ws.iter_rows(min_row=4, values_only=True))
    log.info(f"已读取 {len(rows)} 行数据")

    records = []
    for row_idx, row_values in enumerate(rows, start=4):
        if len(row_values) < 43:
            log.warning(f"第 {row_idx} 行列数不足 43 ({len(row_values)}), 跳过")
            continue

        # 按列顺序映射
        row_dict = {}
        for col_idx, (_, db_field) in enumerate(COLUMN_MAPPING):
            row_dict[db_field] = row_values[col_idx]

        # 清洗
        row_dict = clean_row(row_dict)

        # 生成 analysis_key
        row_dict["analysis_key"] = generate_analysis_key(row_dict)

        records.append(row_dict)

    wb.close()

    log.info(f"清洗完成, 生成 {len(records)} 条记录")
    unique_keys = len(set(r["analysis_key"] for r in records))
    log.info(f"唯一 analysis_key 数: {unique_keys}")

    return records


# ============================================================
# 数据库插入
# ============================================================

# main_records 表的所有字段 (不含 record_pk, created_at, updated_at)
INSERT_FIELDS = ["analysis_key"] + [db_field for _, db_field in COLUMN_MAPPING]

INSERT_SQL = f"""
INSERT INTO main_records ({', '.join(INSERT_FIELDS)})
VALUES ({', '.join(['%s'] * len(INSERT_FIELDS))})
"""


def insert_records(records, db_config):
    """批量插入记录到 main_records 表"""
    conn = pymysql.connect(
        host=db_config["host"],
        port=db_config["port"],
        user=db_config["user"],
        password=db_config["password"],
        database=db_config["database"],
        charset="utf8mb4",
    )

    try:
        cursor = conn.cursor()

        # 清空已有数据 (重新导入)
        cursor.execute("DELETE FROM main_records")
        log.info("已清空 main_records 表")

        # 重置自增 ID
        cursor.execute("ALTER TABLE main_records AUTO_INCREMENT = 1")

        # 批量插入
        batch_size = 200
        total_inserted = 0

        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            values = []
            for rec in batch:
                row_values = tuple(rec.get(f) for f in INSERT_FIELDS)
                values.append(row_values)

            cursor.executemany(INSERT_SQL, values)
            total_inserted += len(batch)

        conn.commit()
        log.info(f"导入完成: {total_inserted} 行已插入 main_records")

    finally:
        conn.close()


# ============================================================
# 主流程
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="MouseToxDB Excel 数据导入")
    parser.add_argument("--excel", type=str, default=None, help="Excel 文件路径")
    parser.add_argument("--host", type=str, default=None, help="MySQL 主机")
    parser.add_argument("--port", type=int, default=None, help="MySQL 端口")
    parser.add_argument("--user", type=str, default=None, help="MySQL 用户名")
    parser.add_argument("--password", type=str, default=None, help="MySQL 密码")
    parser.add_argument("--database", type=str, default=None, help="数据库名")
    args = parser.parse_args()

    # 数据库配置: 命令行 > 环境变量 > 默认值
    db_config = {
        "host": args.host or os.getenv("MYSQL_HOST", "localhost"),
        "port": args.port or int(os.getenv("MYSQL_PORT", "3306")),
        "user": args.user or os.getenv("MYSQL_USER", "mousetoxdb"),
        "password": args.password or os.getenv("MYSQL_PASSWORD", "mousetoxdb_pass"),
        "database": args.database or os.getenv("MYSQL_DATABASE", "mousetoxdb"),
    }

    excel_path = args.excel or os.getenv(
        "EXCEL_PATH",
        str(Path(__file__).resolve().parent.parent / "data" / "260307小鼠双端信息全.xlsx")
    )

    if not Path(excel_path).exists():
        log.error(f"Excel 文件不存在: {excel_path}")
        sys.exit(1)

    log.info("=" * 50)
    log.info("MouseToxDB Excel 数据导入")
    log.info("=" * 50)
    log.info(f"数据库: {db_config['host']}:{db_config['port']}/{db_config['database']}")
    log.info(f"Excel: {excel_path}")

    # 读取 & 清洗
    records = read_excel(excel_path)

    if not records:
        log.error("未读取到有效数据")
        sys.exit(1)

    # 插入
    insert_records(records, db_config)

    # 统计
    log.info("=" * 50)
    log.info("导入统计:")
    log.info(f"  总记录数: {len(records)}")
    log.info(f"  唯一 analysis_key: {len(set(r['analysis_key'] for r in records))}")
    log.info(f"  唯一 chemical_id: {len(set(r['chemical_id'] for r in records))}")
    log.info(f"  唯一 deseq_id: {len(set(r['deseq_id'] for r in records))}")
    log.info(f"  唯一 srr_id: {len(set(r['srr_id'] for r in records))}")
    log.info("=" * 50)


if __name__ == "__main__":
    main()
