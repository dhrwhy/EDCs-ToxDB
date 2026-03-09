# MouseToxDB — 后端开发 TODO

> 参考文档：[后端开发指导](../Project/后端开发指导.md)
> 前置条件：数据库阶段（建表 + 导入）完成后开始
> 开发顺序：从上到下依次完成

---

## 前置条件：数据库状态

> ✅ **数据库已就绪**（2026-03-08 完成）

| 项目 | 状态 |
|------|------|
| MySQL 服务 | ✅ 本地 Homebrew MySQL 8.0.45 运行中 |
| 数据库/用户 | ✅ `mousetoxdb` / `mousetoxdb` / `mousetoxdb_pass` |
| main_records 表 | ✅ 986 行，81 个 analysis_key，6 个索引 |
| record_assets 表 | ✅ 355 条记录（353 available, 2 pending），3 个索引 |
| 字符集 | ✅ utf8mb4 / utf8mb4_general_ci |

**连接字符串：**
```
mysql+pymysql://mousetoxdb:mousetoxdb_pass@localhost:3306/mousetoxdb?charset=utf8mb4
```

**数据库接口文档：** 详见 `database/README.md` 的"后端接口约定"章节（含连接方式、表结构、典型查询、ORM 映射示例）

**启动 MySQL：**
```bash
brew services start mysql@8.0
export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"
```

---

## 第一阶段：项目骨架

- [x] **1.1** 创建 backend/ 目录结构
- [x] **1.2** 编写 requirements.txt
- [x] **1.3** 编写 config.py（pydantic-settings，从环境变量/.env 读取）
- [x] **1.4** 编写 database.py（SQLAlchemy engine + session + get_db 依赖）
- [x] **1.5** 编写 main.py 骨架（FastAPI 实例 + CORS + 路由注册 + 全局异常处理）
- [x] **1.6** 编写 Dockerfile
- [x] **1.7** 验证：启动后端后访问 /docs 看到 Swagger UI ✅

---

## 第二阶段：ORM 模型 + 统一响应

- [x] **2.1** 编写 models/main_record.py（MainRecord 映射 main_records 表 47 个字段）
- [x] **2.2** 编写 models/record_asset.py（RecordAsset 映射 record_assets 表 13 个字段）
- [x] **2.3** 验证 ORM 能查到数据 ✅（986 / 355）
- [x] **2.4** 编写 schemas/common.py（ApiResponse + PaginatedData + success_response/error_response）

---

## 第三阶段：核心 API — 统计 + 搜索

- [x] **3.1** `GET /api/stats/summary`（routers/stats.py）
  - ✅ record_rows=986, analysis_groups=81, unique_chemicals=36
- [x] **3.2** `GET /api/search`（routers/search.py + services/search_service.py）
  - [x] category=all：7 个字段混合匹配（4 精确 + 3 模糊）
  - [x] category=cas：仅 cas_id 精确匹配
  - [x] category=inchikey：仅 inchi_key 精确匹配
  - [x] category=chemical_name：模糊匹配
  - [x] category=pubchem_cid：仅 pubchem_cid 精确匹配
  - [x] category=deseq_id：仅 deseq_id 精确匹配
  - [x] GROUP BY analysis_key 去重（使用 MIN() 聚合解决 ONLY_FULL_GROUP_BY）
  - [x] COUNT(*) AS sample_count
  - [x] 判断 has_assets（子查询 record_assets）
  - [x] ORDER BY chemical_id ASC, deseq_id ASC
  - [x] 分页：子查询计数 + LIMIT OFFSET
  - 验证：
    - [x] keyword=Bisphenol → 返回 5 条匹配结果 ✅
    - [x] keyword=1478-61-1&category=cas → 精确匹配 1 条 ✅
    - [x] keyword=DESEQ1001&category=deseq_id → 精确匹配 ✅
    - [x] keyword=不存在的东西 → items=[], total=0 ✅

---

## 第四阶段：核心 API — 浏览 + 详情

- [x] **4.1** `GET /api/browse/filters`（routers/browse.py）
  - ✅ 7 组织分类, 2 建库方法, 年份 2010-2025
- [x] **4.2** `GET /api/browse`（routers/browse.py）
  - [x] 无筛选条件 → 返回全部 81 条 ✅
  - [x] tissue_category=癌症 → 返回 16 条 ✅
- [x] **4.3** `GET /api/analysis/{analysis_key}`（routers/analysis.py + services/analysis_service.py）
  - [x] summary + sample_records + assets 完整返回 ✅
  - [x] 资源数据包含 preview_url 和 download_url ✅
  - [x] 无效 key → 404 ✅

---

## 第五阶段：核心 API — DEG 表格 + 资源下载

- [x] **5.1** 编写 services/txt_parser.py
  - [x] parse_deg_table() 用 pandas 读取 TSV ✅
  - [x] 文件不存在 → error 字段 ✅
  - [x] NaN 值替换为 None ✅
- [x] **5.2** `GET /api/analysis/{key}/tables/deg-table`
  - ✅ total=378, 10 列, 分页正常
- [x] **5.3** `GET /api/analysis/{key}/assets`
  - ✅ 返回 11 个资源
- [x] **5.4** `GET /api/assets/{asset_id}/download`
  - ✅ PDF 下载成功 (24KB)

---

## 第六阶段：辅助 API — 下载 + 导出

- [x] **6.1** `GET /api/download/database`（routers/download.py）
  - ✅ Excel 下载成功 (187KB)
- [x] **6.2** `GET /api/search/export`（routers/search.py + services/export_service.py）
  - ✅ Excel 导出成功 (5.8KB)，文件名带时间戳

---

## 第七阶段：收尾

- [x] **7.1** 全部 API 的错误处理检查
  - [x] 搜索无结果 → 200 + 空列表 ✅
  - [x] analysis_key 不存在 → 404 ✅
  - [x] asset_id 不存在 → 404 ✅
  - [x] 文件缺失 → 200 + error 字段 ✅
  - [x] 意外异常 → 500 + 统一格式 ✅
- [x] **7.2** 添加全局异常处理器（main.py）✅
- [x] **7.3** 在 Swagger /docs 中逐个测试全部 11 个接口 ✅
- [ ] **7.4** 确认前端能通过 Nginx 代理正常调用所有 API（待前端开发后联调）

---

## 完成标志

✅ **后端开发已完成**（2026-03-08）

Swagger UI 中 11 个接口全部可调用、返回格式正确。

待前端完成后通过 Nginx 代理 `/api/` 路径进行联调验证（7.4）。

### 开发备注

- MySQL 的 `ONLY_FULL_GROUP_BY` 模式要求 GROUP BY 查询中非分组列必须使用聚合函数，已通过 `func.min()` 包裹解决
- 搜索和浏览的分页总数使用子查询方式计算，避免 `.count()` 在 GROUP BY 查询上的兼容性问题
- TXT 解析中 pandas 产生的 NaN 值需替换为 None 以确保 JSON 序列化正常
- 文件下载的中文文件名使用 `filename*=UTF-8''` 编码格式
