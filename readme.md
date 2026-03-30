# EDC-ToxDB — Endocrine Disrupting Chemicals Toxicogenomics Database

EDC-ToxDB 是一个公开访问、只读型的科研数据库检索与展示网站。系统整合了小鼠（*Mus musculus*）及人类（*Homo sapiens*）暴露于多种内分泌干扰化学物（EDCs）后的转录组 DESeq2 差异分析数据，面向公开用户提供检索、浏览和下载服务。

---

## 1. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | React 19, TS 5.9 |
| 构建工具 | Vite | 7.3 |
| UI 组件库 | Ant Design | 6.3 |
| 路由 | React Router | v7 |
| HTTP 客户端 | Axios | 1.13 |
| 图表 | ECharts + echarts-for-react | ECharts 6, echarts-for-react 3 |
| 国际化 | i18next + react-i18next | — |
| 后端框架 | FastAPI | latest |
| ORM | SQLAlchemy | >= 2.0 |
| 数据校验 | Pydantic | >= 2.0 |
| 数据库 | MySQL | 8.0 |
| 运行时 | Python | 3.11+ |
| 部署 | Docker Compose | Nginx + Backend + MySQL |

---

## 2. 项目文件结构

```
SDNU/
├── frontend/                          # 前端 React 应用
│   ├── src/
│   │   ├── api/                       # API 请求模块
│   │   │   ├── index.ts               #   Axios 实例（baseURL: /api, timeout: 10s）
│   │   │   ├── search.ts              #   搜索 API
│   │   │   ├── browse.ts              #   浏览 & 筛选 API
│   │   │   ├── analysis.ts            #   分析详情 & DEG 表格 API
│   │   │   ├── stats.ts               #   统计摘要 API（含发表年份、器官分布、MESH 树）
│   │   │   └── download.ts            #   下载/导出（浏览器直接下载）
│   │   ├── components/                # 可复用 UI 组件
│   │   │   ├── Layout/index.tsx       #   全局布局（双层导航栏 + 页脚 + 移动端汉堡菜单）
│   │   │   ├── SearchBox/index.tsx    #   搜索框（支持分类下拉 + 紧凑模式）
│   │   │   ├── AnalysisTable/index.tsx#   分析条目分页表格
│   │   │   ├── DegTable/index.tsx     #   DEG 差异基因分页表格
│   │   │   ├── PdfCard/index.tsx      #   PDF 预览卡片（PDF→PNG 渲染 + 下载）
│   │   │   ├── BodyMap/               #   Body Map 组件
│   │   │   │   ├── index.ts           #     统一导出
│   │   │   │   ├── MouseBodyMap.tsx   #     小鼠器官可点击 Body Map
│   │   │   │   └── HumanBodyMap.tsx   #     人体器官可点击 Body Map
│   │   │   └── ExternalLink/index.tsx #   外部链接包装组件
│   │   ├── i18n/                      # 国际化配置
│   │   │   ├── index.ts              #   i18next 初始化（localStorage 持久化）
│   │   │   ├── zh.json               #   中文翻译（130+ 条目）
│   │   │   └── en.json               #   英文翻译
│   │   ├── pages/                     # 页面组件（路由对应）
│   │   │   ├── Home/index.tsx         #   首页：Hero 横幅 + 搜索框 + 搜索示例 + 统计卡片 + 滚动轮播亮点 + 统计总览（旭日图+嵌套饼图+年份条形图+Body Map）+ 流程图 + 外部链接
│   │   │   ├── Search/index.tsx       #   搜索结果页（卡片展示）
│   │   │   ├── Browse/index.tsx       #   浏览页：侧边栏筛选（组织/物种/体内体外/品系/性别/年份）+ 右侧卡片列表 + 排序
│   │   │   ├── Analysis/index.tsx     #   详情页：面包屑 + sticky header + 侧边导航 + 5 个面板（Intersection Observer）
│   │   │   ├── Download/index.tsx     #   下载页
│   │   │   ├── Statistics/index.tsx   #   统计页：统计总览 + Body Map + MESH 树状图
│   │   │   └── Help/index.tsx         #   帮助页
│   │   ├── assets/                    # 静态资源
│   │   │   ├── banner.svg            #   首页 Hero 区背景图
│   │   │   └── banner.jpg            #   首页 Hero 区备用背景
│   │   ├── types/index.ts             # TypeScript 类型定义
│   │   ├── utils/
│   │   │   ├── formatters.ts          #   显示工具（空值显示 "—"）
│   │   │   └── externalLinks.ts       #   外部链接 URL 构造器
│   │   ├── App.tsx                    # 路由配置 + Ant Design 主题（学术风格 #2b579a）
│   │   ├── main.tsx                   # 应用入口（加载 i18n）
│   │   └── index.css                  # 全局样式
│   ├── vite.config.ts                 # Vite 配置（代理 + 代码分割）
│   ├── package.json                   # 依赖管理
│   ├── Dockerfile                     # 多阶段构建：Node 构建 → Nginx 服务
│   └── tsconfig*.json                 # TypeScript 配置
│
├── backend/                           # 后端 FastAPI 应用
│   ├── app/
│   │   ├── main.py                    # FastAPI 入口（CORS + 路由注册 + 静态文件）
│   │   ├── config.py                  # 配置项（pydantic-settings，从 .env 读取）
│   │   ├── database.py                # SQLAlchemy engine & session
│   │   ├── models/                    # ORM 模型
│   │   │   ├── main_record.py         #   MainRecord：主表（51 列，含 4 系统字段 + 47 Excel 源字段）
│   │   │   └── record_asset.py        #   RecordAsset：资源表（12 列）
│   │   ├── schemas/                   # Pydantic 数据模型
│   │   │   ├── common.py              #   统一响应格式 + 分页结构
│   │   │   ├── search.py              #   搜索相关 schema
│   │   │   ├── analysis.py            #   详情页 schema
│   │   │   └── stats.py               #   统计摘要 schema
│   │   ├── routers/                   # API 路由
│   │   │   ├── search.py              #   /api/search, /api/search/export
│   │   │   ├── browse.py              #   /api/browse, /api/browse/filters
│   │   │   ├── analysis.py            #   /api/analysis/{key}, .../tables/deg-table
│   │   │   ├── assets.py              #   /api/assets/{id}/download
│   │   │   ├── download.py            #   /api/download/database
│   │   │   └── stats.py               #   /api/stats/summary, /api/stats/publication-years, /api/stats/organ-distribution, /api/stats/mesh-tree
│   │   └── services/                  # 业务逻辑层
│   │       ├── search_service.py      #   搜索与筛选逻辑
│   │       ├── analysis_service.py    #   详情查询
│   │       ├── asset_service.py       #   资源文件管理
│   │       ├── export_service.py      #   Excel 导出
│   │       └── txt_parser.py          #   deg_table.txt / plot_df.txt 解析
│   ├── scripts/
│   │   ├── import_excel.py            # Excel 数据导入脚本
│   │   └── scan_assets.py             # 资源文件扫描脚本
│   ├── requirements.txt               # Python 依赖
│   ├── Dockerfile                     # 后端容器构建
│   └── .env.example                   # 环境变量模板
│
├── database/                          # 数据库初始化模块
│   ├── data/
│   │   └── 260320小鼠双端信息新版本.xlsx  # 源数据 Excel（989 行，导入后 986 条记录）
│   ├── sql/
│   │   ├── 001_create_tables.sql      # 建表 SQL（main_records + record_assets）
│   │   └── 002_verify_data.sql        # 数据验证 SQL（12 项完整性检查）
│   ├── scripts/
│   │   ├── import_excel.py            # Excel 导入脚本（独立版本）
│   │   ├── scan_assets.py             # 资源扫描脚本（独立版本）
│   │   └── requirements.txt           # 脚本依赖
│   └── config/
│       ├── .env.example               # 环境变量模板
│       └── docker-compose.mysql.yml   # 独立 MySQL Docker 配置
│
├── demo/                              # 资源文件目录（35 个 DESEQ 文件夹）
│   ├── DESEQ0005/                     #   每个文件夹包含：
│   │   ├── DESEQ0005_PCA_plot.pdf     #     PCA 图
│   │   ├── DESEQ0005_Volcano_plot.pdf #     火山图
│   │   ├── DESEQ0005_Heatmap.pdf      #     热图
│   │   ├── DESEQ0005_KEGG_Up_plot.pdf #     KEGG 上调通路
│   │   ├── DESEQ0005_KEGG_Down_plot.pdf#    KEGG 下调通路
│   │   ├── DESEQ0005_Reactome_Up_plot.pdf#  Reactome 上调通路
│   │   ├── DESEQ0005_Reactome_Down_plot.pdf# Reactome 下调通路
│   │   ├── DESEQ0005_Hallmark_Up_plot.pdf#  Hallmark 上调通路
│   │   ├── DESEQ0005_DO_Up_plot.pdf   #     DO 上调通路
│   │   ├── DESEQ0005_deg_table.txt    #     DEG 差异基因表（TSV）
│   │   └── DESEQ0005_plot_df.txt      #     绘图数据（TSV）
│   ├── DESEQ1001/
│   └── ...
│
├── .gitignore                         # Git 忽略规则
└── readme.md                          # 本文件
```

---

## 3. 数据库设计

### 3.1 数据规模

| 指标 | 数量 |
|------|------|
| 样本记录 | 986 |
| 分析条目（唯一 analysis_key） | 81 |
| 化学物种类 | 36 |
| 唯一 DESEQ_ID | 78 |
| 唯一 SRR_ID | 770 |
| 唯一 GSE_ID | 40 |
| 资源文件记录 | 642 |

### 3.2 表结构

**`main_records`** -- 主表，保存 Excel 中的所有样本记录

- 系统字段 4 个：`record_pk`（主键）、`analysis_key`（分析键）、`created_at`、`updated_at`
- Excel 源字段 47 个：化学物信息、实验信息、样本信息、分类信息等（含新增字段 `summary_text`、`strain`、`in_vivo_vitro`、`gender`）
- 索引：`analysis_key`、`chemical_id`、`cas_id`、`inchi_key`、`pubchem_cid`、`deseq_id`

**`record_assets`** -- 资源表，保存 PDF/TXT 文件元信息

- 通过 `deseq_id` 关联主表（应用层关联，无外键约束）
- 状态字段：`available`（可访问）、`missing`（缺失）、`pending`（待补充）

### 3.3 关键设计决策

- **`analysis_key`** 作为系统内部唯一分析键，格式：`{DESEQ_ID}__{chemical_id}__{GSE_ID}__{BioProject}`
- **`DESEQ_ID` 不是唯一键**：DESEQ0066、DESEQ0078、DESEQ1011 各对应 2 个不同的分析条目
- 前端展示 `DESEQ_ID`，URL 路由使用 `analysis_key`
- 资源文件按 `DESEQ_ID` 文件夹组织，共享同一份资源不影响正确性

---

## 4. API 接口

所有 API 返回统一 JSON 格式：`{ "code": 200, "message": "success", "data": { ... } }`

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/stats/summary` | GET | 统计摘要（首页卡片数据） |
| `/api/stats/publication-years` | GET | 按发表年份统计文献数量（年份条形图） |
| `/api/stats/organ-distribution` | GET | 器官/组织分布统计（旭日图 + Body Map） |
| `/api/stats/mesh-tree` | GET | MESH 分类树状结构（统计页树状图） |
| `/api/search?keyword=&category=&page=&page_size=` | GET | 全局搜索（支持 all/cas/inchikey/chemical_name/pubchem_cid/deseq_id） |
| `/api/search/export?keyword=&category=` | GET | 导出搜索结果为 Excel |
| `/api/browse?tissue_category=&organism=&in_vivo_vitro=&strain=&gender=&year_min=&year_max=&sort_by=&sort_order=&page=` | GET | 浏览 + 筛选 + 排序 |
| `/api/browse/filters` | GET | 获取筛选选项（组织分类、物种、体内/体外、品系、性别、年份范围） |
| `/api/analysis/{analysis_key}` | GET | 分析条目详情（基本信息 + 样本记录 + 资源列表） |
| `/api/analysis/{analysis_key}/tables/deg-table?page=&page_size=` | GET | DEG 差异基因表分页数据 |
| `/api/analysis/{analysis_key}/assets` | GET | 资源列表 |
| `/api/assets/{asset_id}/download` | GET | 下载单个资源文件 |
| `/api/download/database` | GET | 下载完整数据库 Excel |

搜索逻辑：
- **精确匹配**：`cas_id`、`inchi_key`、`pubchem_cid`、`deseq_id`
- **模糊匹配**：`chemical_name`、`alternative_names`、`pubchem_name`（`LIKE %keyword%`）
- 搜索结果按 `analysis_key` 去重，返回分析条目级结果

---

## 5. 前端页面

### 5.1 页面路由

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | Hero 横幅 + 搜索框 + 搜索示例 + 统计卡片 + 滚动轮播亮点 + 统计总览（旭日图+嵌套饼图+年份条形图+Body Map）+ 分析流程图 + 外部链接 |
| `/search?keyword=&category=` | 搜索结果页 | 搜索框 + 卡片展示结果（分页 30 条）+ 导出按钮 |
| `/browse` | 浏览页 | 左侧筛选面板（组织分类/物种/体内体外/品系/性别/发表年份）+ 右侧卡片列表 + 排序功能 |
| `/analysis/:analysisKey` | 详情页 | 面包屑导航 + sticky header + 侧边导航 + 5 个面板（Intersection Observer 驱动滚动高亮） |
| `/download` | 下载页 | 整库 Excel 下载 |
| `/statistics` | 统计页 | 统计总览 + Body Map + MESH 树状图 |
| `/help` | 帮助页 | 使用说明、字段说明、外链说明、联系方式 |

### 5.2 详情页（Analysis）

详情页采用 5 个面板布局，左侧设有固定侧边导航栏，支持快速定位各区块（通过 Intersection Observer 自动高亮当前可见面板）。顶部显示面包屑导航（Home / Browse / DESEQ_ID）及 sticky header。

5 个面板：

1. **毒物信息**：
   - 毒物基本信息：Chemical_Name、Alternative_Names、PubChem_CID（外链）、PubChem_Name、CAS_ID、InChIKey、数据来源
   - MESH 分类信息：链式展示（如 `双酚类（旧） → 酚类 → 苯衍生物 → 芳烃 → 碳氢化合物，环状 → 碳氢化合物 → D02 → D02`）
2. **实验设计**：实验分组表格（Group/Chem_Name/剂量/时间）+ 文献名称、发表年月、DOI（外链）+ Summary + PCA 图
3. **差异分析**：火山图 + DEG 差异基因表（分页展示）
4. **富集分析**：热图 + KEGG/Reactome/Hallmark/DO 富集通路分析图
5. **基因表达**：预留区域，待后续补充基因表达图像

### 5.3 国际化（i18n）

- 支持中文（zh）和英文（en）切换
- 语言偏好存储在 `localStorage`，刷新后保持
- 导航栏右上角提供语言切换按钮
- Ant Design 组件库同步切换 locale（分页器、空状态等）

### 5.4 首页模块

首页自上而下包含以下区块：

1. **Hero 横幅**：深蓝渐变背景 + 标题（EDC-ToxDB）+ 副标题 + 描述文字 + 居中大搜索框 + 搜索示例
2. **统计卡片**：4 张悬浮卡片（样本记录 / 分析条目 / 化学物种类 / DESEQ 分析数），负 margin 覆盖在 Banner 底部
3. **亮点（滚动轮播）**：数据库亮点以条形滚动方式展示，支持自动轮播
4. **统计总览**：旭日图（内环 4 大类，外环具体指标）+ 嵌套饼图 + 年份条形图（按发表年份统计文献数量）+ Body Map（小鼠/人体器官可点击，点击跳转浏览页筛选）
5. **分析流程 + 外部资源**（并排两列）：5 步流程图（FASTQ → QC → DESeq2 → 富集分析 → 数据库）+ 外部学术资源链接

### 5.5 移动端适配

全站支持移动端响应式布局（断点 `768px`）：

- **导航栏**：汉堡菜单 + Drawer 侧边抽屉（含搜索框 + 导航项），路由切换自动关闭
- **首页**：Hero 区缩小字号和间距，统计卡片 2×2 排列，流程图竖向排列
- **浏览页**：筛选面板折叠为 `Collapse` 手风琴，显示已选筛选项计数徽标
- **详情页**：标题自动缩小，长文本自动换行
- **帮助页**：字段说明表格横向可滚动
- **全局 CSS**：`@media (max-width: 767px)` 减小各区块内边距

### 5.6 UI 风格

- 学术风格主题色：`#2b579a`（深蓝）
- 双层导航栏：上层（Logo + 搜索框 + 语言切换），下层（标签页式菜单，选中项显示 `#e8a735` 金色顶部边框）
- 全局字体大小 14px，字体 Arial
- 表格：`#e6edf5` 表头背景，紧凑行高
- 化学物名称列：固定宽度 + 省略号 + Tooltip 显示完整内容

---

## 6. 本地开发启动

### 6.1 前置要求

- Node.js >= 18
- Python >= 3.11
- MySQL 8.0

### 6.2 启动 MySQL

```bash
# macOS Homebrew
brew install mysql@8.0
brew services start mysql@8.0

# 创建数据库和用户
mysql -u root <<'SQL'
CREATE DATABASE IF NOT EXISTS mousetoxdb
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER IF NOT EXISTS 'mousetoxdb'@'localhost' IDENTIFIED BY 'mousetoxdb_pass';
GRANT ALL PRIVILEGES ON mousetoxdb.* TO 'mousetoxdb'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 6.3 初始化数据库表

```bash
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < database/sql/001_create_tables.sql
```

### 6.4 导入数据

```bash
# 安装脚本依赖
pip install openpyxl pymysql python-dotenv

# 导入 Excel 数据（989 行 Excel → 986 条记录导入）
cd database
python scripts/import_excel.py --excel data/260320小鼠双端信息新版本.xlsx

# 扫描资源文件（生成 642 条资源记录）
python scripts/scan_assets.py --assets-dir ../demo

# 验证数据完整性
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb < sql/002_verify_data.sql
```

### 6.5 启动后端

```bash
cd backend

# 配置环境变量
cp .env.example .env
# 编辑 .env，确保以下配置：
#   MYSQL_HOST=localhost
#   ASSETS_DIR=/absolute/path/to/SDNU/demo
#   EXCEL_PATH=/absolute/path/to/SDNU/database/data/260320小鼠双端信息新版本.xlsx

# 安装依赖
pip install -r requirements.txt

# 启动
uvicorn app.main:app --host 0.0.0.0 --port 8000
# API 文档：http://localhost:8000/docs
```

### 6.6 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式启动（自动代理 /api → localhost:8000）
npm run dev
# 访问：http://localhost:3000
```

---

## 7. Docker 部署

### 7.1 目录准备

将源数据和资源文件放入 `data/` 目录：

```
SDNU/
├── data/
│   ├── source_excel/
│   │   └── 260320小鼠双端信息新版本.xlsx
│   ├── deseq_assets/        # 即 demo/ 目录的内容
│   │   ├── DESEQ0005/
│   │   ├── DESEQ1001/
│   │   └── ...
│   └── statistics/           # 统计图片（可选）
├── nginx/
│   └── default.conf
├── docker-compose.yml
└── .env
```

### 7.2 Nginx 配置

`nginx/default.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;

    # 前端静态文件（SPA 路由回退）
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Swagger 文档
    location /docs { proxy_pass http://backend:8000/docs; }
    location /openapi.json { proxy_pass http://backend:8000/openapi.json; }

    # 静态资源文件（PDF/TXT）
    location /static/assets/ {
        alias /data/deseq_assets/;
        autoindex off;
    }

    # 统计图片
    location /static/statistics/ {
        alias /data/statistics/;
        autoindex off;
    }
}
```

### 7.3 Docker Compose

`docker-compose.yml`：

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    restart: always
    environment:
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      ASSETS_DIR: /data/deseq_assets
      EXCEL_PATH: /data/source_excel/260320小鼠双端信息新版本.xlsx
      STATISTICS_DIR: /data/statistics
    volumes:
      - ./data:/data:ro
    depends_on:
      mysql:
        condition: service_healthy

  nginx:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./data/deseq_assets:/data/deseq_assets:ro
      - ./data/statistics:/data/statistics:ro
    depends_on:
      - backend
      - mysql

volumes:
  mysql_data:
```

### 7.4 一键启动

```bash
# 1. 配置环境变量
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=root_pass
MYSQL_DATABASE=mousetoxdb
MYSQL_USER=mousetoxdb
MYSQL_PASSWORD=mousetoxdb_pass
EOF

# 2. 启动所有服务
docker compose up --build -d

# 3. 导入数据（首次启动后执行）
docker compose exec backend python scripts/import_excel.py
docker compose exec backend python scripts/scan_assets.py
```

启动后访问：

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost |
| API 文档 | http://localhost/docs |
| 数据库 | localhost:3306 |

---

## 8. 实现细节

### 8.1 数据导入流程

`import_excel.py` 执行以下步骤：

1. 读取 Excel（Sheet1，第 3 行表头，第 4 行起数据）
2. 47 个 Excel 列名映射为数据库 snake_case 字段名（含新增字段 `summary_text`、`strain`、`in_vivo_vitro`、`gender`）
3. 数据清洗：
   - 去除首尾空格及 `\xa0` 等不可见字符
   - 空字符串转 NULL
   - 解码 HTML 实体（`&#039;` → `'`）
   - 16 个字段中裸值 `"0"` 转 NULL（排除 `"0 ppm"` 等带单位值）
   - 5 个数值字段转整数（sort_id, chemical_id, avg_spot_len, publication_year, publication_month）
4. 生成 `analysis_key = {deseq_id}__{chemical_id}__{gse_id}__{bioproject_id}`
5. 批量插入（每批 200 行）

> **注意**：更新 Excel 后需手动重新运行 `import_excel.py` 导入数据，数据库不会自动同步。

### 8.2 资源扫描流程

`scan_assets.py` 执行以下步骤：

1. 扫描资源目录下所有 `DESEQ*/` 文件夹
2. 按文件名关键词匹配 11 种资源类别：

| 关键词 | 分类 | 显示名称 | 排序 |
|--------|------|---------|------|
| PCA_plot | pca_plot | PCA 图 | 10 |
| Volcano_plot | volcano_plot | 火山图 | 20 |
| Heatmap | heatmap | 热图 | 30 |
| KEGG_Up_plot | kegg_up_plot | KEGG 上调通路 | 40 |
| KEGG_Down_plot | kegg_down_plot | KEGG 下调通路 | 50 |
| Reactome_Up_plot | reactome_up_plot | Reactome 上调通路 | 60 |
| Reactome_Down_plot | reactome_down_plot | Reactome 下调通路 | 70 |
| Hallmark_Up_plot | hallmark_up_plot | Hallmark 上调通路 | 80 |
| DO_Up_plot | do_up_plot | DO 上调通路 | 90 |
| deg_table.txt | deg_table | DEG 差异基因表 | 100 |
| plot_df.txt | plot_df | 绘图数据 | 110 |

3. 判定状态：文件存在且 > 0 字节为 `available`，否则为 `missing`，空文件夹为 `pending`

### 8.3 搜索机制

- 搜索结果按 `analysis_key` 分组，使用 `GROUP BY` + `MIN()` 聚合
- 通过子查询检查 `record_assets` 表判断 `has_assets` 标志
- 排序：先按 `chemical_id` 升序，再按 `deseq_id` 升序
- 搜索结果页每页 30 条，以卡片形式展示

### 8.4 DEG 表格解析

- 后端读取 `deg_table.txt`（TSV 格式），使用 pandas 解析
- 返回分页数据 + 列名列表 + 总行数
- 前端 DegTable 组件自动格式化数值（< 0.001 显示科学计数法，其余保留 4 位小数）

### 8.5 外部链接规则

| 字段 | 跳转地址 |
|------|---------|
| PubChem CID | `https://pubchem.ncbi.nlm.nih.gov/compound/{cid}` |
| GSE_ID | `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={gse_id}` |
| SRR_ID | `https://www.ncbi.nlm.nih.gov/sra/?term={srr_id}` |
| BioProject | `https://www.ncbi.nlm.nih.gov/bioproject/{id}` |
| DOI | `https://doi.org/{doi}`（自动去除 `doi:` 前缀） |

所有外链在新标签页打开。字段值为空时不显示链接。

### 8.6 前端代理配置

开发模式下 Vite 代理：
- `/api` → `http://localhost:8000`（后端 API）
- `/static` → `http://localhost:8000`（静态资源）

后端 `main.py` 在开发环境下同时挂载 `StaticFiles`，为 PDF/TXT 资源提供服务。
生产环境由 Nginx 直接提供静态文件服务。

### 8.7 统一响应格式

```json
{ "code": 200, "message": "success", "data": { ... } }         // 成功
{ "code": 404, "message": "分析条目未找到", "data": null }       // 404
{ "code": 200, "data": { "total": 81, "page": 1, "page_size": 30, "items": [...] } }  // 分页
```

---

## 9. 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MYSQL_HOST` | localhost | MySQL 主机（Docker 中为 `mysql`） |
| `MYSQL_PORT` | 3306 | MySQL 端口 |
| `MYSQL_DATABASE` | mousetoxdb | 数据库名 |
| `MYSQL_USER` | mousetoxdb | 数据库用户名 |
| `MYSQL_PASSWORD` | mousetoxdb_pass | 数据库密码 |
| `ASSETS_DIR` | /data/deseq_assets | 资源文件目录 |
| `EXCEL_PATH` | /data/source_excel/260320小鼠双端信息新版本.xlsx | 源数据 Excel 路径 |
| `STATISTICS_DIR` | /data/statistics | 统计图片目录 |
| `URL_PREFIX` | （空） | 子路径部署前缀（如 `/SDNU`），用于生成资源 URL |

> **⚠️ 重要**：`URL_PREFIX` 字段必须在 `backend/app/config.py` 的 `Settings` 类中定义（即使本地开发时为空）。服务器 `.env` 中设置了 `URL_PREFIX=/SDNU`，如果 config.py 中缺少该字段，pydantic-settings 会因为严格模式报错导致后端无法启动。后端所有资源 URL 拼接（如 `preview_url`、`download_url`）都应使用 `settings.URL_PREFIX` 前缀。

---

## 10. 服务器部署注意事项

### 10.0 代码覆盖检查清单

每次将本地代码同步到服务器前，务必检查以下事项：

1. **本地先 `npm run build`** — 确保 TypeScript 编译无错误（`npm run dev` 不做严格检查，`build` 会）
2. **检查 `config.py` 是否包含所有服务器 `.env` 中的字段** — 特别是 `URL_PREFIX`，缺少会导致后端启动崩溃
3. **检查 ORM model 是否新增了数据库列** — 对比 `models/main_record.py` 与服务器表结构（`DESCRIBE main_records`），新增列需手动 `ALTER TABLE`，并重新导入数据
4. **检查资源 URL 是否使用 `settings.URL_PREFIX`** — 硬编码 `/static/assets/...` 在服务器上会 404
5. **同步后重新打子路径补丁** — rsync 覆盖 src 后需重新应用 `/SDNU` 适配（详见 `server.md` 4.2 节）

---

## 11. 服务器部署（子路径方式）

项目已部署在 Vultr VPS 上，通过 `2584256188.work/SDNU` 访问，与同服务器的 WordPress 博客共存。

### 11.1 部署架构

```
Nginx (80/443)
├── /              → WordPress (PHP-FPM)
├── ^~ /SDNU/      → /var/www/SDNU/ (symlink → dist/)  # 前端 SPA
├── ^~ /SDNU/api/  → proxy_pass http://127.0.0.1:8001  # 后端 API
└── ^~ /SDNU/static/ → proxy_pass http://127.0.0.1:8001 # 静态资源
```

### 11.2 子路径适配要点

| 配置项 | 修改内容 |
|--------|---------|
| `vite.config.ts` | `base: '/SDNU/'` |
| `App.tsx` | `<BrowserRouter basename="/SDNU">` |
| `api/index.ts` | `baseURL: '/SDNU/api'` |
| `api/download.ts` | 下载 URL 添加 `/SDNU` 前缀 |
| 后端 `.env` | `URL_PREFIX=/SDNU` |
| 后端 `analysis_service.py` | 资源 URL 使用 `settings.URL_PREFIX` 前缀 |

### 11.3 后端服务

后端以 systemd 服务运行：

```ini
# /etc/systemd/system/mousetoxdb.service
[Service]
WorkingDirectory=/root/Web/SDNU/backend
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### 11.4 Nginx 注意事项

- 使用 `^~` 前缀匹配（优先于 WordPress 的 regex location）
- 前端使用 `root /var/www` + symlink `/var/www/SDNU → dist/`（`alias` + `try_files` 在 Nginx 中不兼容）
- 需确保 Nginx worker（`www-data`）对项目目录有遍历权限
