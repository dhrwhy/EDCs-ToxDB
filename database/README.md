# MouseToxDB — 数据库模块

小鼠毒理转录组数据库（MouseToxDB）的数据库层，负责 MySQL 建库建表、数据导入和资源扫描。

## 目录结构

```
database/
├── README.md                    # 本文件
├── sql/                         # SQL 脚本
│   ├── README.md
│   ├── 001_create_tables.sql    # 建表脚本（主表 + 资源表）
│   └── 002_verify_data.sql      # 数据验证脚本
├── scripts/                     # Python 脚本
│   ├── README.md
│   ├── requirements.txt         # Python 依赖
│   ├── import_excel.py          # Excel → MySQL 导入
│   └── scan_assets.py           # 资源文件扫描 → record_assets 表
└── config/                      # 配置文件
    ├── README.md
    ├── .env.example             # 环境变量模板
    └── docker-compose.mysql.yml # MySQL Docker 独立配置
```

## MySQL 服务管理

> **重要**：Homebrew 安装的 `mysql@8.0` 是 keg-only 版本，二进制文件不会自动加入 PATH。
> 每次打开新终端都需要先执行 PATH 导出，或将其写入 shell 配置文件。

### PATH 配置

```bash
# 临时生效（当前终端）
export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"

# 永久生效（写入 ~/.zshrc）
echo 'export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 启动 / 停止 / 重启

```bash
# 启动 MySQL 服务
brew services start mysql@8.0

# 停止 MySQL 服务
brew services stop mysql@8.0

# 重启 MySQL 服务
brew services restart mysql@8.0

# 查看服务状态
brew services list | grep mysql
```

### 验证服务是否正常运行

```bash
# 检查 MySQL 版本（能输出版本号说明服务正常）
mysql -u root -e "SELECT VERSION();"

# 检查 mousetoxdb 数据库是否可连接
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb -e "SELECT 1;"

# 检查数据是否存在
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb -e "SELECT COUNT(*) AS total FROM main_records;"
```

### Docker 环境启停

```bash
cd config/

# 启动
docker compose -f docker-compose.mysql.yml up -d

# 查看状态
docker compose -f docker-compose.mysql.yml ps

# 停止（保留数据）
docker compose -f docker-compose.mysql.yml down

# 停止并删除数据（需重新导入）
docker compose -f docker-compose.mysql.yml down -v

# 连接数据库
docker compose -f docker-compose.mysql.yml exec mysql \
  mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb
```

---

## 快速开始（首次初始化）

以下步骤仅首次搭建时执行。后续日常使用只需启动 MySQL 服务即可。

### 步骤 1：安装 MySQL

```bash
brew install mysql@8.0
brew services start mysql@8.0
export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"
```

### 步骤 2：创建数据库和用户

```bash
mysql -u root -e "
  CREATE DATABASE IF NOT EXISTS mousetoxdb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  CREATE USER IF NOT EXISTS 'mousetoxdb'@'localhost' IDENTIFIED BY 'mousetoxdb_pass';
  GRANT ALL PRIVILEGES ON mousetoxdb.* TO 'mousetoxdb'@'localhost';
  FLUSH PRIVILEGES;
"
```

### 步骤 3：建表

```bash
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < sql/001_create_tables.sql
```

### 步骤 4：安装 Python 依赖

```bash
pip install -r scripts/requirements.txt
```

### 步骤 5：导入 Excel 数据

```bash
python scripts/import_excel.py
# 或指定 Excel 路径
python scripts/import_excel.py --excel /path/to/260307小鼠双端信息全.xlsx
```

### 步骤 6：扫描资源文件

```bash
python scripts/scan_assets.py
# 或指定资源目录
python scripts/scan_assets.py --assets-dir /path/to/demo
```

### 步骤 7：验证数据完整性

```bash
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < sql/002_verify_data.sql
```

所有检查项的 `result` 列应与 `expected` 列一致。

### 重新初始化（清空重来）

如需清空数据重新导入：

```bash
# 重建表结构（会 DROP 原表）
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < sql/001_create_tables.sql

# 重新导入
python scripts/import_excel.py
python scripts/scan_assets.py

# 重新验证
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < sql/002_verify_data.sql
```

## 数据库概览

| 项目 | 值 |
|------|-----|
| 引擎 | MySQL 8.0 |
| 数据库名 | mousetoxdb |
| 字符集 | utf8mb4 / utf8mb4_general_ci |
| 主表 | `main_records`（986 行，47 列） |
| 资源表 | `record_assets`（355 条记录） |

### 关键数据指标

| 指标 | 数量 |
|------|------|
| 样本记录 | 986 |
| 唯一分析条目 (analysis_key) | 81 |
| 唯一化学物 | 36 |
| 唯一 DESEQ_ID | 78 |
| 唯一 SRR_ID | 770 |
| 唯一 GSE_ID | 40 |
| 唯一 BioProject | 40 |

---

## 后端接口约定

> 本节面向后端开发人员，说明数据库向后端暴露的连接方式、表结构要点和典型查询模式。

### 1. 连接方式

后端通过 **SQLAlchemy 2.0 + PyMySQL** 连接 MySQL：

```python
# 连接字符串格式
DATABASE_URL = "mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

# 本地开发
DATABASE_URL = "mysql+pymysql://mousetoxdb:mousetoxdb_pass@localhost:3306/mousetoxdb?charset=utf8mb4"

# Docker 部署（host 改为容器名 mysql）
DATABASE_URL = "mysql+pymysql://mousetoxdb:mousetoxdb_pass@mysql:3306/mousetoxdb?charset=utf8mb4"
```

环境变量参考 `config/.env.example`。

### 2. 表结构概要

#### `main_records` — 主表（986 行）

每行对应 Excel 中的一条 SRR 样本记录。

| 字段 | 类型 | 说明 |
|------|------|------|
| `record_pk` | BIGINT PK | 自增主键 |
| `analysis_key` | VARCHAR(128) | 分析条目标识，格式 `{DESEQ_ID}__{chemical_id}__{GSE_ID}__{BioProject}`，**非 UNIQUE**（同一值对应多行 SRR 样本） |
| `deseq_id` | VARCHAR(50) | DESeq 分析编号，**非唯一**（有 3 个被复用） |
| `srr_id` | VARCHAR(50) | SRA Run 编号，每行唯一 |
| *(其余 40+ 字段)* | — | 详见 `sql/001_create_tables.sql` 中的完整定义和 COMMENT |

**索引：** `analysis_key`、`chemical_id`、`cas_id`、`inchi_key`、`pubchem_cid`、`deseq_id`（均为普通索引）

#### `record_assets` — 资源表（355 行）

每行对应一个 PDF/TXT 资源文件。

| 字段 | 类型 | 说明 |
|------|------|------|
| `asset_id` | BIGINT PK | 自增主键 |
| `deseq_id` | VARCHAR(50) | 关联的 DESEQ_ID |
| `file_name` | VARCHAR(255) | 原始文件名 |
| `file_path` | TEXT | 相对路径，如 `DESEQ1001/DESEQ1001_PCA_plot.pdf` |
| `asset_category` | VARCHAR(50) | 资源类别：`pca_plot`、`volcano_plot`、`heatmap`、`kegg_up_plot`、`kegg_down_plot`、`reactome_up_plot`、`reactome_down_plot`、`hallmark_up_plot`、`do_up_plot`、`deg_table`、`plot_df` |
| `display_name` | VARCHAR(100) | 前端显示名称（中文） |
| `sort_order` | INT | 展示排序（10~110） |
| `parse_mode` | VARCHAR(20) | `none`（直接展示/下载）或 `table_preview`（需解析为表格，仅 deg_table） |
| `status` | VARCHAR(20) | `available`（文件可用）/ `missing`（文件缺失）/ `pending`（待补充） |

### 3. 两表关系

```
main_records.deseq_id  ──(多对多)──  record_assets.deseq_id
```

- **无外键约束**，通过 `deseq_id` 做应用层关联
- 原因：资源可能先于主表数据存在（如 DESEQ0005 仅在 demo 中有资源，Excel 无对应记录）
- 后端查询时通过 JOIN 或分步查询关联两表

### 4. 后端 ORM 映射

后端应创建两个 SQLAlchemy Model，字段名与数据库完全一致（snake_case）：

```python
# app/models/main_record.py
class MainRecord(Base):
    __tablename__ = "main_records"
    record_pk = Column(BigInteger, primary_key=True, autoincrement=True)
    analysis_key = Column(String(128), nullable=False, index=True)
    # ... 其余字段与建表 SQL 一一对应

# app/models/record_asset.py
class RecordAsset(Base):
    __tablename__ = "record_assets"
    asset_id = Column(BigInteger, primary_key=True, autoincrement=True)
    deseq_id = Column(String(50), nullable=False, index=True)
    # ... 其余字段与建表 SQL 一一对应
```

### 5. 典型查询模式

#### 5.1 搜索（按 analysis_key 去重，返回分析条目级结果）

```sql
SELECT
    analysis_key, deseq_id, chemical_id, sort_id, cas_id,
    chemical_name, pubchem_cid, pubchem_name, gse_id,
    bioproject_id, organism, tissue_category, library_method,
    platform, publication_year,
    COUNT(*) AS sample_count
FROM main_records
WHERE cas_id = :keyword           -- 精确匹配
   OR inchi_key = :keyword        -- 精确匹配
   OR pubchem_cid = :keyword      -- 精确匹配
   OR deseq_id = :keyword         -- 精确匹配
   OR chemical_name LIKE :like    -- 模糊匹配 (%keyword%)
   OR alternative_names LIKE :like
   OR pubchem_name LIKE :like
GROUP BY analysis_key
ORDER BY chemical_id ASC, deseq_id ASC
LIMIT :page_size OFFSET :offset;
```

> 所有搜索大小写不敏感（由 `utf8mb4_general_ci` 排序规则保证）。

#### 5.2 详情（某 analysis_key 的汇总 + 样本列表）

```sql
-- 汇总信息（取第一条的非样本字段）
SELECT * FROM main_records WHERE analysis_key = :key LIMIT 1;

-- 该分析条目下的所有样本
SELECT srr_id, avg_spot_len, cell_type, library_layout,
       treatment, experiment_group, chem_name, dose, exposure_time
FROM main_records
WHERE analysis_key = :key;
```

#### 5.3 资源查询（通过 deseq_id 关联）

```sql
SELECT * FROM record_assets
WHERE deseq_id = :deseq_id
ORDER BY sort_order ASC;
```

#### 5.4 统计摘要

```sql
SELECT
    COUNT(*)                        AS record_rows,
    COUNT(DISTINCT analysis_key)    AS analysis_groups,
    COUNT(DISTINCT chemical_id)     AS unique_chemicals,
    COUNT(DISTINCT deseq_id)        AS unique_deseq_id,
    COUNT(DISTINCT srr_id)          AS unique_srr_id,
    COUNT(DISTINCT gse_id)          AS unique_gse_id,
    COUNT(DISTINCT bioproject_id)   AS unique_bioproject_id
FROM main_records;
```

#### 5.5 浏览筛选选项

```sql
SELECT DISTINCT tissue_category FROM main_records WHERE tissue_category IS NOT NULL ORDER BY tissue_category;
SELECT DISTINCT library_method FROM main_records WHERE library_method IS NOT NULL ORDER BY library_method;
SELECT MIN(publication_year) AS min_year, MAX(publication_year) AS max_year FROM main_records WHERE publication_year IS NOT NULL;
```

### 6. 注意事项

1. **`deseq_id` 不是唯一键**：DESEQ0066、DESEQ0078、DESEQ1011 各被 2 个不同的 analysis_key 复用，后端路由应使用 `analysis_key` 而非 `deseq_id`
2. **搜索结果粒度**：返回分析条目级（按 `analysis_key` GROUP BY），不是样本级
3. **资源文件路径**：`record_assets.file_path` 是相对路径，需拼接资源根目录（环境变量 `ASSETS_DIR`）才能访问实际文件
4. **前端展示用 `deseq_id`，URL 路由用 `analysis_key`**：避免复用编号导致详情页混乱
5. **空值显示**：字段值为 NULL 时前端应显示 "—"
