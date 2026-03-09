# SQL 脚本说明

本目录存放 MouseToxDB 的数据库建表与验证脚本。

## 文件清单

### 001_create_tables.sql — 建表脚本

创建两张核心表：

**`main_records`（主表）**
- 存储 Excel 中 986 行样本记录
- 系统字段 4 个：`record_pk`（主键）、`analysis_key`、`created_at`、`updated_at`
- Excel 源字段 43 个：从 `sort_id` 到 `inferred_class`
- 索引 6 个：`analysis_key`、`chemical_id`、`cas_id`、`inchi_key`、`pubchem_cid`、`deseq_id`

**`record_assets`（资源表）**
- 存储 PDF/TXT 资源文件的元信息
- 通过 `deseq_id` 字段与主表关联（应用层关联，无外键）
- `status` 字段标记文件状态：`available`（可用）、`missing`（缺失）、`pending`（待补充）

### 002_verify_data.sql — 数据验证脚本

导入数据后执行，包含 12 项检查：
1. 总行数（预期 986）
2. 唯一 analysis_key 数（预期 81）
3. 唯一化学物数（预期 36）
4. 唯一 DESEQ_ID 数（预期 78）
5. 唯一 SRR_ID 数（预期 770）
6. 唯一 GSE_ID 数（预期 40）
7. 唯一 BioProject 数（预期 40）
8. 复用 DESEQ_ID 验证（应返回 3 个：DESEQ0066, DESEQ0078, DESEQ1011）
9. 清洗规则验证（裸值 "0" 不应存在）
10. 资源表总数
11. 资源状态分布
12. 字符集验证（utf8mb4 / utf8mb4_general_ci）

## 执行方式

```bash
# 建表
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < 001_create_tables.sql

# 验证（导入数据后执行）
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < 002_verify_data.sql
```

## 设计要点

- `deseq_id` **不是唯一键**：有 3 个 DESEQ_ID 被复用于不同分析条目
- `analysis_key` 格式：`{DESEQ_ID}__{chemical_id}__{GSE_ID}__{BioProject}`
- `analysis_key` 是普通索引（非 UNIQUE），因为同一 analysis_key 对应多行 SRR 样本
- 两表通过 `deseq_id` 做应用层关联，不使用外键
