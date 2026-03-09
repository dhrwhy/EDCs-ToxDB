# MouseToxDB — 数据库开发 TODO

> 参考文档：[数据库开发指导](../Project/数据库开发指导.md)
> 开发顺序：从上到下依次完成，每项完成后打勾
> **状态：✅ 全部完成（2026-03-08）**

---

## 第一阶段：环境搭建

- [x] **1.1** 编写 docker-compose.yml 中 mysql 服务部分
  - image: mysql:8.0
  - 环境变量：MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD
  - volume: mysql_data
  - command: --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
  - healthcheck 配置
  - ✅ 文件位于 `database/config/docker-compose.mysql.yml`
- [x] **1.2** 编写 .env.example 文件（数据库相关变量）
  - ✅ 文件位于 `database/config/.env.example`
- [x] **1.3** 启动 MySQL，验证能连接
  - ✅ 本地通过 Homebrew 安装 MySQL 8.0.45，已启动并验证
  - ✅ Docker 配置已同步准备
- [x] **1.4** 验证字符集
  - ✅ character_set_database = utf8mb4
  - ✅ collation_database = utf8mb4_general_ci

---

## 第二阶段：建表

- [x] **2.1** 创建 `main_records` 表
  - ✅ analysis_key 是普通 INDEX（非 UNIQUE）
  - ✅ 6 个索引全部创建
- [x] **2.2** 创建 `record_assets` 表
  - ✅ 3 个索引全部创建
- [x] **2.3** 验证表结构
  - ✅ 表结构和索引全部正确
  - ✅ SQL 文件位于 `database/sql/001_create_tables.sql`

---

## 第三阶段：数据导入

- [x] **3.1** Excel 文件已就位：`260307小鼠双端信息全.xlsx`
- [x] **3.2** 编写 `scripts/import_excel.py`
  - [x] 读取 Sheet1，第 3 行表头，第 4 行起数据
  - [x] 第 17 列（空白表头）映射为 library_layout
  - [x] 实现清洗规则：
    - [x] 去除首尾空格 + \xa0
    - [x] 空字符串 → NULL
    - [x] 16 个字段的裸值 "0" → NULL（注意排除带单位的）
    - [x] 5 个数值字段转整数
  - [x] 生成 analysis_key = f"{deseq_id}__{chemical_id}__{gse_id}__{bioproject_id}"
  - [x] 批量 INSERT（使用 openpyxl + pymysql）
  - [x] 输出日志：读取行数、插入行数、唯一 analysis_key 数
  - ✅ 文件位于 `database/scripts/import_excel.py`
- [x] **3.3** 执行导入
  - ✅ 986 行全部导入成功
- [x] **3.4** 验证导入结果
  - ✅ COUNT(*) = 986
  - ✅ DISTINCT analysis_key = 81
  - ✅ DISTINCT chemical_id = 36
  - ✅ DISTINCT deseq_id = 78
  - ✅ DISTINCT srr_id = 770
  - ✅ DISTINCT gse_id = 40
  - ✅ DISTINCT bioproject_id = 40
- [x] **3.5** 验证清洗规则生效
  - ✅ dose='0' → 0 条（裸值已清除）
  - ✅ tissue_subcategory='0' → 0 条
  - ✅ reproductive_subcategory='0' → 0 条
- [x] **3.6** 验证 3 个复用 DESEQ_ID
  - ✅ DESEQ0066（2 个 analysis_key）
  - ✅ DESEQ0078（2 个 analysis_key）
  - ✅ DESEQ1011（2 个 analysis_key）

---

## 第四阶段：资源扫描

- [x] **4.1** demo 资源文件已就位
  - ✅ 35 个 DESEQ 目录
- [x] **4.2** 编写 `scripts/scan_assets.py`
  - [x] 扫描 demo/ 下所有 DESEQ*/ 目录
  - [x] 对每个目录中的文件，按关键词匹配 asset_category（11 种规则）
  - [x] 设置 status（available / missing / pending）
  - [x] 设置 file_path 为相对路径
  - [x] 批量 INSERT 到 record_assets 表
  - [x] 输出日志：扫描目录数、文件数、各 status 统计
  - ✅ 文件位于 `database/scripts/scan_assets.py`
- [x] **4.3** 执行扫描
  - ✅ 355 条资源记录已写入
- [x] **4.4** 验证扫描结果
  - ✅ 总记录: 355
  - ✅ available: 353, pending: 2（DESEQ0066 和 DESEQ1016 为空目录）
  - ✅ 涉及 35 个 DESEQ_ID

---

## 第五阶段：最终验证

- [x] **5.1** 运行完整验证脚本（12 项检查全部通过）
  - ✅ 验证脚本位于 `database/sql/002_verify_data.sql`
- [x] **5.2** 数据库已就绪，后端可连接查询
  - ✅ 连接信息: `mysql+pymysql://mousetoxdb:mousetoxdb_pass@localhost:3306/mousetoxdb?charset=utf8mb4`
  - ✅ 后端接口约定已写入 `database/README.md`
- [ ] **5.3** 准备静态统计图片，放入 `data/statistics/`（如有）
  - ⏳ 待业务方提供

---

## 完成标志

✅ 全部验证 SQL 返回预期结果，数据库已就绪，可交付给后端开发继续。

### 产出物清单

| 文件 | 说明 |
|------|------|
| `database/sql/001_create_tables.sql` | 建表脚本 |
| `database/sql/002_verify_data.sql` | 验证脚本 |
| `database/scripts/import_excel.py` | Excel 导入脚本 |
| `database/scripts/scan_assets.py` | 资源扫描脚本 |
| `database/scripts/requirements.txt` | Python 依赖 |
| `database/config/.env.example` | 环境变量模板 |
| `database/config/docker-compose.mysql.yml` | MySQL Docker 配置 |
| `database/README.md` | 总说明 + 后端接口约定 |
