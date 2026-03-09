# MouseToxDB — 后端模块

小鼠毒理转录组数据库（MouseToxDB）的后端服务，基于 FastAPI 构建，提供 RESTful API 供前端调用。

## 目录结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI 应用入口、CORS、全局异常处理、路由注册
│   ├── config.py              # 配置项（pydantic-settings，从环境变量/.env 读取）
│   ├── database.py            # SQLAlchemy engine & session & get_db 依赖
│   ├── models/
│   │   ├── __init__.py
│   │   ├── main_record.py     # MainRecord ORM 模型（映射 main_records 表，47 字段）
│   │   └── record_asset.py    # RecordAsset ORM 模型（映射 record_assets 表，13 字段）
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py          # 统一响应格式 ApiResponse + PaginatedData
│   │   ├── search.py          # 搜索结果数据结构
│   │   ├── analysis.py        # 详情页数据结构
│   │   └── stats.py           # 统计摘要数据结构
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── stats.py           # GET /api/stats/summary
│   │   ├── search.py          # GET /api/search + GET /api/search/export
│   │   ├── browse.py          # GET /api/browse + GET /api/browse/filters
│   │   ├── analysis.py        # GET /api/analysis/{key} + DEG 表格 + 资源列表
│   │   ├── assets.py          # GET /api/assets/{id}/download
│   │   └── download.py        # GET /api/download/database
│   └── services/
│       ├── __init__.py
│       ├── search_service.py   # 搜索与筛选业务逻辑
│       ├── analysis_service.py # 详情查询
│       ├── asset_service.py    # 资源文件路径管理
│       ├── txt_parser.py       # deg_table.txt TSV 解析（pandas）
│       └── export_service.py   # 搜索结果 Excel 导出
├── scripts/
│   ├── import_excel.py         # Excel → MySQL 导入脚本
│   └── scan_assets.py          # 资源文件扫描 → record_assets 表
├── requirements.txt
├── Dockerfile
├── .env                        # 本地开发环境变量（不提交到 git）
└── .env.example                # 环境变量模板
```

---

## 快速开始

### 前置条件

- Python 3.11+
- MySQL 8.0（本地 Homebrew 或 Docker）
- 数据库 `mousetoxdb` 已建表并导入数据（详见 `database/README.md`）

### 步骤 1：启动 MySQL

```bash
brew services start mysql@8.0
export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"
```

### 步骤 2：安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

### 步骤 3：配置环境变量

```bash
cp .env.example .env
# 编辑 .env，根据本地环境修改数据库连接和文件路径
```

### 步骤 4：启动后端服务

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

启动成功后：
- API 服务：http://localhost:8000
- Swagger 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/api/health

---

## 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `MYSQL_HOST` | `localhost` | MySQL 主机（Docker 部署时为 `mysql`） |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `MYSQL_DATABASE` | `mousetoxdb` | 数据库名 |
| `MYSQL_USER` | `mousetoxdb` | 数据库用户 |
| `MYSQL_PASSWORD` | `mousetoxdb_pass` | 数据库密码 |
| `ASSETS_DIR` | `/data/deseq_assets` | DESEQ 资源文件根目录 |
| `EXCEL_PATH` | `/data/source_excel/260307小鼠双端信息全.xlsx` | 原始 Excel 文件路径 |
| `STATISTICS_DIR` | `/data/statistics` | 统计图片目录 |

**本地开发连接字符串：**
```
mysql+pymysql://mousetoxdb:mousetoxdb_pass@localhost:3306/mousetoxdb?charset=utf8mb4
```

---

## 数据库连接

后端通过 **SQLAlchemy 2.0 + PyMySQL** 连接 MySQL。

- ORM 模型与数据库表结构一一对应（snake_case 字段名）
- 两张表：`main_records`（986 行，47 字段）、`record_assets`（355 行，13 字段）
- 通过 `deseq_id` 做应用层关联（无外键约束）
- 详细表结构见 `database/README.md` 的"后端接口约定"章节

---

## Docker 部署

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

在 `docker-compose.yml` 中作为 `backend` 服务运行，依赖 `mysql` 服务健康检查通过后启动。

---

## 前端接口文档

> 所有 API 返回统一 JSON 格式：`{ "code": 200, "message": "success", "data": {...} }`
> 所有接口均为 GET 方法（只读系统）

### 接口总览

| # | 接口 | 用途 | 对应前端页面 |
|---|------|------|------------|
| 1 | `GET /api/stats/summary` | 统计摘要（卡片数据 + 统计图列表） | 首页 |
| 2 | `GET /api/search` | 全局搜索（分类 + 分页） | 首页搜索 / 搜索结果页 |
| 3 | `GET /api/search/export` | 导出搜索结果为 Excel | 搜索结果页 |
| 4 | `GET /api/browse` | 浏览分析条目（筛选 + 分页） | 浏览页 |
| 5 | `GET /api/browse/filters` | 获取浏览页筛选选项 | 浏览页 |
| 6 | `GET /api/analysis/{analysis_key}` | 分析条目详情（summary + samples + assets） | 详情页 |
| 7 | `GET /api/analysis/{analysis_key}/tables/deg-table` | DEG 差异基因表（TSV 解析 + 分页） | 详情页 DEG Tab |
| 8 | `GET /api/analysis/{analysis_key}/assets` | 分析条目资源列表 | 详情页资源 Tab |
| 9 | `GET /api/assets/{asset_id}/download` | 下载单个资源文件（PDF/TXT） | 详情页 |
| 10 | `GET /api/download/database` | 下载整库 Excel | 下载页 |
| 11 | `GET /api/health` | 健康检查 | — |

### 1. 统计摘要

`GET /api/stats/summary`

**返回 `data`：**
```json
{
  "record_rows": 986,
  "analysis_groups": 81,
  "unique_chemicals": 36,
  "unique_deseq_id": 78,
  "unique_srr_id": 770,
  "unique_gse_id": 40,
  "unique_bioproject_id": 40,
  "statistics_assets": [
    { "name": "overall_summary", "title": "Overall Summary", "type": "image", "url": "/static/statistics/overall_summary.png" }
  ]
}
```

### 2. 全局搜索

`GET /api/search`

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| keyword | string | 是 | — | 搜索关键词 |
| category | string | 否 | all | 搜索分类：`all` / `cas` / `inchikey` / `chemical_name` / `pubchem_cid` / `deseq_id` |
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 30 | 每页条数（最大 30） |

**搜索逻辑：**

| category | 搜索字段 | 匹配方式 |
|----------|---------|---------|
| all | cas_id, inchi_key, pubchem_cid, deseq_id | 精确匹配 |
| all | chemical_name, alternative_names, pubchem_name | 模糊匹配（LIKE %keyword%） |
| cas | cas_id | 精确匹配 |
| inchikey | inchi_key | 精确匹配 |
| chemical_name | chemical_name, alternative_names, pubchem_name | 模糊匹配 |
| pubchem_cid | pubchem_cid | 精确匹配 |
| deseq_id | deseq_id | 精确匹配 |

**返回 `data`：**
```json
{
  "total": 5,
  "page": 1,
  "page_size": 30,
  "items": [
    {
      "analysis_key": "DESEQ1001__90__GSE223464__PRJNA926360",
      "deseq_id": "DESEQ1001",
      "chemical_id": 90,
      "sort_id": 559,
      "cas_id": "1478-61-1",
      "chemical_name": "Bisphenol AF",
      "pubchem_cid": "7175",
      "pubchem_name": "Bisphenol AF",
      "gse_id": "GSE223464",
      "bioproject_id": "PRJNA926360",
      "organism": "Mus musculus",
      "tissue_category": "癌症",
      "library_method": "bulk_RNAseq",
      "platform": "ILLUMINA",
      "publication_year": 2017,
      "sample_count": 6,
      "has_assets": true
    }
  ]
}
```

### 3. 搜索结果导出

`GET /api/search/export`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| category | string | 否 | 搜索分类（默认 all） |

返回 Excel 文件流。文件名：`MouseToxDB_搜索结果_YYYYMMDD_HHMMSS.xlsx`

### 4. 浏览分析条目

`GET /api/browse`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tissue_category | string | 否 | 组织分类筛选（多个用逗号分隔） |
| library_method | string | 否 | 建库方法筛选（多个用逗号分隔） |
| year_min | int | 否 | 发表年份最小值 |
| year_max | int | 否 | 发表年份最大值 |
| page | int | 否 | 页码（默认 1） |
| page_size | int | 否 | 每页条数（默认 30） |

返回格式与搜索接口 items 结构相同。

### 5. 浏览筛选选项

`GET /api/browse/filters`

**返回 `data`：**
```json
{
  "tissue_categories": ["免疫", "心脏", "生殖", "癌症", "肝脏", "肺", "胚胎"],
  "library_methods": ["bulk_RNAseq", "microarrays"],
  "year_range": { "min": 2010, "max": 2025 }
}
```

### 6. 分析条目详情

`GET /api/analysis/{analysis_key}`

**返回 `data`：**
```json
{
  "analysis_key": "DESEQ1001__90__GSE223464__PRJNA926360",
  "deseq_id": "DESEQ1001",
  "summary": {
    "sort_id": 559,
    "chemical_id": 90,
    "cas_id": "1478-61-1",
    "inchi_key": "ZFVMWEVVKGLCIJ-UHFFFAOYSA-N",
    "chemical_name": "Bisphenol AF",
    "alternative_names": "Bisphenol AF",
    "pubchem_cid": "7175",
    "pubchem_name": "Bisphenol AF",
    "from_group": "EU_EDCs,DEDuCT,TEDX",
    "evidence": "(1)人类和小鼠证据",
    "gse_id": "GSE223464",
    "bioproject_id": "PRJNA926360",
    "organism": "Mus musculus",
    "platform": "ILLUMINA",
    "tissue_category": "癌症",
    "tissue_subcategory": "生殖系统癌症",
    "reproductive_subcategory": null,
    "tissue_or_cell_line": "人乳腺癌细胞（MCF7 细胞系）",
    "exposure_toxicant": "BPAF",
    "library_method": "bulk_RNAseq",
    "library_method_detail": "RNA-seq",
    "publication_year": 2017,
    "publication_month": 8,
    "reference_title": "Editor's Highlight: ...",
    "doi": "10.1093/toxsci/kfx101",
    "class1_code": "D02",
    "class2_code": "D02",
    "class3_name": "碳氢化合物",
    "class4_name": "碳氢化合物，环状",
    "class5_name": "芳烃",
    "class6_name": "苯衍生物",
    "class7_name": "酚类",
    "inferred_class": "双酚类（旧）"
  },
  "sample_records": [
    {
      "srr_id": "SRR23190066",
      "avg_spot_len": 300,
      "cell_type": "uterus",
      "library_layout": "PAIRED",
      "treatment": "BPAF",
      "experiment_group": "treat",
      "chem_name": "BPAF",
      "dose": "300 μg/kg",
      "exposure_time": "28d"
    }
  ],
  "assets": [
    {
      "asset_id": 167,
      "deseq_id": "DESEQ1001",
      "display_name": "PCA 图",
      "asset_category": "pca_plot",
      "file_ext": "pdf",
      "preview_url": "/static/assets/DESEQ1001/DESEQ1001_PCA_plot.pdf",
      "download_url": "/api/assets/167/download",
      "status": "available"
    }
  ]
}
```

**错误响应（analysis_key 不存在）：**
```json
{ "code": 404, "message": "分析条目未找到", "data": null }
```

### 7. DEG 差异基因表

`GET /api/analysis/{analysis_key}/tables/deg-table`

| 参数 | 类型 | 默认 |
|------|------|------|
| page | int | 1 |
| page_size | int | 30 |

**返回 `data`：**
```json
{
  "name": "deg_table",
  "columns": ["geneID", "baseMean", "log2FoldChange", "lfcSE", "stat", "pvalue", "padj", "-log10(P.Value)", "trend", "ENTREZID"],
  "total": 378,
  "page": 1,
  "page_size": 30,
  "items": [
    { "geneID": "Krt6b", "baseMean": 775.48, "log2FoldChange": -9.81, "..." : "..." }
  ]
}
```

文件不存在时返回 `data` 中包含 `"error": "文件不存在"` 字段。

### 8. 资源列表

`GET /api/analysis/{analysis_key}/assets`

返回 `data` 为资源数组（结构同详情接口中的 `assets`）。

### 9. 单个资源下载

`GET /api/assets/{asset_id}/download`

返回文件流（`Content-Disposition: attachment`）。文件不存在返回 404。

### 10. 整库下载

`GET /api/download/database`

返回原始 Excel 文件流。

### 11. 健康检查

`GET /api/health`

```json
{ "code": 200, "message": "ok", "data": null }
```

---

## 静态资源 URL（Nginx 直接服务）

以下 URL 由 Nginx 直接服务，不经过后端：

| URL 模式 | 对应文件系统路径 | 用途 |
|---------|---------------|------|
| `/static/assets/{DESEQ_ID}/{filename}` | `{ASSETS_DIR}/{DESEQ_ID}/{filename}` | PDF/TXT 预览 |
| `/static/statistics/{filename}` | `{STATISTICS_DIR}/{filename}` | 统计图片 |

后端返回的 `preview_url` 使用上述格式，前端直接用此 URL 加载资源。

---

## 错误处理

| 场景 | HTTP 状态码 | code 字段 | 说明 |
|------|-----------|----------|------|
| 搜索无结果 | 200 | 200 | `data.items` 为空列表 |
| analysis_key 不存在 | 404 | 404 | `"分析条目未找到"` |
| asset_id 不存在 | 404 | 404 | `"资源不存在"` |
| 资源文件缺失 | 200 | 200 | `assets` 中 `status=missing` |
| TXT 解析失败 | 200 | 200 | `data` 中包含 `error` 字段 |
| 服务器内部错误 | 500 | 500 | `"服务器内部错误"` |

---

## 验收结果（2026-03-08）

| # | 接口 | 验证结果 |
|---|------|---------|
| 1 | GET /api/stats/summary | ✅ record_rows=986, analysis_groups=81, unique_chemicals=36 |
| 2 | GET /api/search?keyword=Bisphenol | ✅ total=5 |
| 3 | GET /api/search?keyword=1478-61-1&category=cas | ✅ 精确匹配 1 条 |
| 4 | GET /api/search?keyword=不存在 | ✅ total=0, items=[] |
| 5 | GET /api/browse | ✅ total=81 |
| 6 | GET /api/browse/filters | ✅ 7 组织分类, 2 建库方法, 2010-2025 |
| 7 | GET /api/analysis/{key} | ✅ summary + 6 samples + 11 assets |
| 8 | GET /api/analysis/INVALID | ✅ 404 正确返回 |
| 9 | DEG 表格 | ✅ total=378, 10 列 |
| 10 | 资源下载 | ✅ PDF 下载成功 |
| 11 | 整库下载 | ✅ Excel 下载成功 |
| 12 | 搜索导出 | ✅ Excel 导出成功 |
