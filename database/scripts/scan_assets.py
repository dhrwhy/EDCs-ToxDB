#!/usr/bin/env python3
"""
MouseToxDB — 资源文件扫描脚本

功能：
  1. 扫描资源目录下所有 DESEQ*/ 文件夹
  2. 按文件名关键词识别资源类别 (11 种)
  3. 检查文件状态, 写入 record_assets 表

用法：
  python scripts/scan_assets.py                             # 使用 .env 中的配置
  python scripts/scan_assets.py --assets-dir /path/to/demo  # 指定资源目录
"""

import os
import sys
import argparse
import logging
from pathlib import Path

import pymysql

# ============================================================
# 配置
# ============================================================

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

# ============================================================
# 资源文件命名映射规则
# 按匹配优先级排列 (长关键词优先, 避免短关键词误匹配)
# ============================================================

ASSET_RULES = [
    # (文件名关键词, asset_category, display_name, sort_order, parse_mode)
    ("PCA_plot",          "pca_plot",          "PCA 图",           10, "none"),
    ("Volcano_plot",      "volcano_plot",      "火山图",           20, "none"),
    ("Heatmap",           "heatmap",           "热图",             30, "none"),
    ("KEGG_Up_plot",      "kegg_up_plot",      "KEGG 上调通路",    40, "none"),
    ("KEGG_Down_plot",    "kegg_down_plot",    "KEGG 下调通路",    50, "none"),
    ("Reactome_Up_plot",  "reactome_up_plot",  "Reactome 上调通路", 60, "none"),
    ("Reactome_Down_plot","reactome_down_plot","Reactome 下调通路", 70, "none"),
    ("Hallmark_Up_plot",  "hallmark_up_plot",  "Hallmark 上调通路", 80, "none"),
    ("DO_Up_plot",        "do_up_plot",        "DO 上调通路",       90, "none"),
    ("deg_table.txt",     "deg_table",         "DEG 差异基因表",    100, "table_preview"),
    ("plot_df.txt",       "plot_df",           "绘图数据",         110, "none"),
]


def match_asset_rule(file_name):
    """根据文件名匹配资源规则, 返回 (category, display_name, sort_order, parse_mode) 或 None"""
    for keyword, category, display_name, sort_order, parse_mode in ASSET_RULES:
        if keyword in file_name:
            return category, display_name, sort_order, parse_mode
    return None


def get_file_ext(file_name):
    """获取文件扩展名 (不含点号, 小写)"""
    ext = Path(file_name).suffix.lower()
    return ext.lstrip(".")


# ============================================================
# 扫描逻辑
# ============================================================

def scan_directory(assets_dir):
    """扫描资源目录, 返回资源记录列表"""
    assets_path = Path(assets_dir)

    if not assets_path.exists():
        log.error(f"资源目录不存在: {assets_dir}")
        sys.exit(1)

    log.info(f"正在扫描资源目录: {assets_dir}")

    # 找到所有 DESEQ* 目录
    deseq_dirs = sorted([
        d for d in assets_path.iterdir()
        if d.is_dir() and d.name.startswith("DESEQ")
    ])

    log.info(f"找到 {len(deseq_dirs)} 个 DESEQ 目录")

    records = []
    stats = {"available": 0, "missing": 0, "pending": 0, "unrecognized": 0}

    for deseq_dir in deseq_dirs:
        deseq_id = deseq_dir.name

        # 获取目录中的文件
        files = [
            f for f in deseq_dir.iterdir()
            if f.is_file() and not f.name.startswith(".")
        ]

        if not files:
            # 空目录 → pending
            log.info(f"  {deseq_id}: 空目录, 标记为 pending")
            # 为空目录创建一条 pending 记录
            records.append({
                "deseq_id": deseq_id,
                "file_name": "",
                "file_path": f"{deseq_id}/",
                "file_ext": "",
                "asset_category": "unknown",
                "display_name": "资源待补充",
                "sort_order": 0,
                "parse_mode": "none",
                "status": "pending",
                "remark": "目录为空, 资源待补充",
            })
            stats["pending"] += 1
            continue

        for file_path in sorted(files):
            file_name = file_path.name

            # 跳过 zip 文件
            if file_name.endswith(".zip"):
                continue

            rule = match_asset_rule(file_name)
            if rule is None:
                log.warning(f"  {deseq_id}/{file_name}: 未识别的文件, 跳过")
                stats["unrecognized"] += 1
                continue

            category, display_name, sort_order, parse_mode = rule
            file_ext = get_file_ext(file_name)

            # 检查文件是否真实存在且可读
            if file_path.exists() and file_path.stat().st_size > 0:
                status = "available"
                stats["available"] += 1
            else:
                status = "missing"
                stats["missing"] += 1

            relative_path = f"{deseq_id}/{file_name}"

            records.append({
                "deseq_id": deseq_id,
                "file_name": file_name,
                "file_path": relative_path,
                "file_ext": file_ext,
                "asset_category": category,
                "display_name": display_name,
                "sort_order": sort_order,
                "parse_mode": parse_mode,
                "status": status,
                "remark": None,
            })

    log.info(f"扫描完成: {len(records)} 条资源记录")
    log.info(f"  available: {stats['available']}")
    log.info(f"  missing: {stats['missing']}")
    log.info(f"  pending: {stats['pending']}")
    log.info(f"  unrecognized: {stats['unrecognized']}")

    return records


# ============================================================
# 数据库插入
# ============================================================

INSERT_SQL = """
INSERT INTO record_assets
    (deseq_id, file_name, file_path, file_ext, asset_category,
     display_name, sort_order, parse_mode, status, remark)
VALUES
    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""


def insert_assets(records, db_config):
    """批量插入资源记录到 record_assets 表"""
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

        # 清空已有数据
        cursor.execute("DELETE FROM record_assets")
        cursor.execute("ALTER TABLE record_assets AUTO_INCREMENT = 1")
        log.info("已清空 record_assets 表")

        # 批量插入
        values = [
            (
                r["deseq_id"], r["file_name"], r["file_path"], r["file_ext"],
                r["asset_category"], r["display_name"], r["sort_order"],
                r["parse_mode"], r["status"], r["remark"],
            )
            for r in records
        ]

        cursor.executemany(INSERT_SQL, values)
        conn.commit()

        log.info(f"插入完成: {len(values)} 条资源记录已写入 record_assets")

    except Exception:
        conn.rollback()
        log.exception("插入失败，已回滚事务")
        raise
    finally:
        conn.close()


# ============================================================
# 主流程
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="MouseToxDB 资源文件扫描")
    parser.add_argument("--assets-dir", type=str, default=None, help="资源文件目录路径")
    parser.add_argument("--host", type=str, default=None, help="MySQL 主机")
    parser.add_argument("--port", type=int, default=None, help="MySQL 端口")
    parser.add_argument("--user", type=str, default=None, help="MySQL 用户名")
    parser.add_argument("--password", type=str, default=None, help="MySQL 密码")
    parser.add_argument("--database", type=str, default=None, help="数据库名")
    args = parser.parse_args()

    db_config = {
        "host": args.host or os.getenv("MYSQL_HOST", "localhost"),
        "port": args.port or int(os.getenv("MYSQL_PORT", "3306")),
        "user": args.user or os.getenv("MYSQL_USER", "mousetoxdb"),
        "password": args.password or os.getenv("MYSQL_PASSWORD", "mousetoxdb_pass"),
        "database": args.database or os.getenv("MYSQL_DATABASE", "mousetoxdb"),
    }

    assets_dir = args.assets_dir or os.getenv(
        "ASSETS_DIR",
        str(Path(__file__).resolve().parent.parent.parent / "demo")
    )

    log.info("=" * 50)
    log.info("MouseToxDB 资源文件扫描")
    log.info("=" * 50)
    log.info(f"数据库: {db_config['host']}:{db_config['port']}/{db_config['database']}")
    log.info(f"资源目录: {assets_dir}")

    # 扫描
    records = scan_directory(assets_dir)

    if not records:
        log.warning("未扫描到任何资源记录")
        return

    # 插入
    insert_assets(records, db_config)

    # 按 DESEQ_ID 统计
    from collections import Counter
    deseq_counts = Counter(r["deseq_id"] for r in records)
    log.info(f"涉及 {len(deseq_counts)} 个 DESEQ_ID")
    log.info("=" * 50)


if __name__ == "__main__":
    main()
