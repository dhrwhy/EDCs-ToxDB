#!/usr/bin/env python3
"""
MouseToxDB — PDF 转 PNG 脚本

将资源目录中所有 PDF 文件转换为透明背景的 PNG 图片。
生成的 PNG 文件与原 PDF 同目录同名，仅扩展名不同。

用法：
  python scripts/convert_pdf_to_png.py                        # 自动查找资源目录
  python scripts/convert_pdf_to_png.py --assets-dir /path/to  # 指定资源目录
  python scripts/convert_pdf_to_png.py --dpi 200              # 指定分辨率（默认 200）
"""

import os
import sys
import argparse
import logging
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# 默认 DPI（200 兼顾清晰度和文件大小）
DEFAULT_DPI = 200


def convert_pdf_to_png(pdf_path: Path, dpi: int = DEFAULT_DPI) -> Path | None:
    """
    将 PDF 第一页转换为透明背景 PNG。
    返回生成的 PNG 路径，失败返回 None。
    """
    png_path = pdf_path.with_suffix(".png")

    try:
        doc = fitz.open(str(pdf_path))
        if len(doc) == 0:
            logger.warning(f"  空 PDF: {pdf_path.name}")
            doc.close()
            return None

        page = doc[0]

        # 计算缩放矩阵（PDF 默认 72 DPI）
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)

        # 渲染为带 Alpha 通道的像素图
        pix = page.get_pixmap(matrix=mat, alpha=True)
        doc.close()

        # 转为 PIL Image 进行白色背景透明化处理
        img = Image.frombytes("RGBA", [pix.width, pix.height], pix.samples)

        # 将白色/近白色像素设为透明
        data = img.getdata()
        new_data = []
        for r, g, b, a in data:
            # 如果像素接近白色（RGB 均 > 245），设为透明
            if r > 245 and g > 245 and b > 245:
                new_data.append((r, g, b, 0))
            else:
                new_data.append((r, g, b, a))
        img.putdata(new_data)

        img.save(str(png_path), "PNG", optimize=True)
        return png_path

    except Exception as e:
        logger.error(f"  转换失败 {pdf_path.name}: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="PDF → PNG 转换")
    parser.add_argument("--assets-dir", help="资源目录路径")
    parser.add_argument("--dpi", type=int, default=DEFAULT_DPI, help=f"输出 DPI（默认 {DEFAULT_DPI}）")
    parser.add_argument("--force", action="store_true", help="强制重新转换已存在的 PNG")
    args = parser.parse_args()

    # 确定资源目录
    if args.assets_dir:
        assets_dir = Path(args.assets_dir)
    else:
        # 自动查找
        project_root = Path(__file__).resolve().parent.parent.parent
        for candidate in [project_root / "demo", project_root / "data" / "deseq_assets"]:
            if candidate.is_dir():
                assets_dir = candidate
                break
        else:
            assets_dir_env = os.environ.get("ASSETS_DIR")
            if assets_dir_env and Path(assets_dir_env).is_dir():
                assets_dir = Path(assets_dir_env)
            else:
                logger.error("未找到资源目录，请使用 --assets-dir 指定")
                sys.exit(1)

    logger.info(f"资源目录: {assets_dir}")
    logger.info(f"输出 DPI: {args.dpi}")

    # 扫描所有 PDF 文件
    pdf_files = sorted(assets_dir.glob("DESEQ*/*.pdf"))
    total = len(pdf_files)
    logger.info(f"找到 {total} 个 PDF 文件")

    converted = 0
    skipped = 0
    failed = 0

    for i, pdf_path in enumerate(pdf_files, 1):
        png_path = pdf_path.with_suffix(".png")

        # 跳过已存在的 PNG（除非 --force）
        if png_path.exists() and not args.force:
            skipped += 1
            continue

        logger.info(f"[{i}/{total}] 转换: {pdf_path.parent.name}/{pdf_path.name}")
        result = convert_pdf_to_png(pdf_path, dpi=args.dpi)
        if result:
            converted += 1
        else:
            failed += 1

    logger.info("=" * 50)
    logger.info(f"转换完成: 成功 {converted}, 跳过 {skipped}, 失败 {failed}")


if __name__ == "__main__":
    main()
