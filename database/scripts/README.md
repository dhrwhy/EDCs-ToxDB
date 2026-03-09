# Python 脚本说明

本目录存放 MouseToxDB 的数据导入和资源扫描脚本。

## 环境准备

```bash
pip install -r requirements.txt
```

依赖包：
- `openpyxl` — 读取 Excel 文件
- `pymysql` — 连接 MySQL
- `python-dotenv` — 加载 .env 环境变量（可选）

## 文件清单

### import_excel.py — Excel 数据导入脚本

将 `260307小鼠双端信息全.xlsx` 中的 986 行样本数据导入 `main_records` 表。

**执行流程：**
1. 读取 Excel（Sheet1，第 3 行表头，第 4 行起数据）
2. 列名映射：Excel 的 43 列 → 数据库字段名（snake_case）
3. 数据清洗：
   - 去除首尾空格和 `\xa0` 等不可见字符
   - 空字符串 → NULL
   - 16 个字段的裸值 `"0"` → NULL（带单位的如 `"0 ppm"` 保留）
   - 5 个字段转整数：`sort_id`、`chemical_id`、`avg_spot_len`、`publication_year`、`publication_month`
4. 生成 `analysis_key = {deseq_id}__{chemical_id}__{gse_id}__{bioproject_id}`
5. 批量插入数据库

**用法：**
```bash
# 使用默认配置（自动查找 .env 和项目根目录的 Excel）
python import_excel.py

# 指定 Excel 路径
python import_excel.py --excel /path/to/file.xlsx

# 指定数据库连接
python import_excel.py --host localhost --port 3306 --user mousetoxdb --password mousetoxdb_pass --database mousetoxdb
```

**预期输出：**
```
[INFO] 已读取 986 行数据
[INFO] 清洗完成, 生成 986 条记录
[INFO] 唯一 analysis_key 数: 81
[INFO] 导入完成: 986 行已插入 main_records
```

### scan_assets.py — 资源文件扫描脚本

扫描资源目录中的 DESEQ 文件夹，识别 PDF/TXT 资源并写入 `record_assets` 表。

**支持的资源类型（11 种）：**

| 文件名关键词 | 资源类别 | 显示名称 |
|------------|---------|---------|
| PCA_plot | pca_plot | PCA 图 |
| Volcano_plot | volcano_plot | 火山图 |
| Heatmap | heatmap | 热图 |
| KEGG_Up_plot | kegg_up_plot | KEGG 上调通路 |
| KEGG_Down_plot | kegg_down_plot | KEGG 下调通路 |
| Reactome_Up_plot | reactome_up_plot | Reactome 上调通路 |
| Reactome_Down_plot | reactome_down_plot | Reactome 下调通路 |
| Hallmark_Up_plot | hallmark_up_plot | Hallmark 上调通路 |
| DO_Up_plot | do_up_plot | DO 上调通路 |
| deg_table.txt | deg_table | DEG 差异基因表 |
| plot_df.txt | plot_df | 绘图数据 |

**文件状态判定：**
- `available` — 文件存在且可读
- `missing` — 文件不存在
- `pending` — 目录为空，资源待补充

**用法：**
```bash
# 使用默认配置（自动查找 .env 和项目根目录的 demo 目录）
python scan_assets.py

# 指定资源目录
python scan_assets.py --assets-dir /path/to/demo
```

**预期输出：**
```
[INFO] 找到 35 个 DESEQ 目录
[INFO] 扫描完成: 355 条资源记录
[INFO]   available: 353
[INFO]   pending: 2
```

### requirements.txt — Python 依赖

两个脚本共用的依赖清单，`pip install -r requirements.txt` 安装。
