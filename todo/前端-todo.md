# MouseToxDB — 前端开发 TODO

> 参考文档：[前端开发指导](../Project/前端开发指导.md)
> 前置条件：后端核心 API（搜索 + 详情 + 统计）就绪后开始对接；骨架可提前开发
> 开发顺序：从上到下依次完成

---

## 第一阶段：项目骨架

- [x] **1.1** 使用 Vite 创建 React + TypeScript 项目
  ```bash
  npm create vite@latest frontend -- --template react-ts
  ```
- [x] **1.2** 安装依赖
  ```bash
  npm install antd @ant-design/icons axios react-router-dom
  npm install react-pdf  # 或 pdfjs-dist
  ```
- [x] **1.3** 创建目录结构
  ```
  src/
  ├── api/          # Axios 实例 + 各模块 API
  ├── pages/        # 各页面
  ├── components/   # 共用组件
  ├── types/        # TypeScript 类型
  └── utils/        # 工具函数
  ```
- [x] **1.4** 编写 Axios 实例（`api/index.ts`）
  ```typescript
  baseURL: "/api"
  timeout: 10000
  ```
- [x] **1.5** 编写 TypeScript 类型定义（`types/index.ts`）
  - 复制前端开发指导 §9 的全部接口类型
- [x] **1.6** 编写 Dockerfile（多阶段构建：Node build → Nginx）
- [ ] **1.7** 验证：`docker compose up` 后 localhost 显示 React 默认页面

---

## 第二阶段：全局布局 + 路由

- [x] **2.1** 编写全局 Layout 组件（`components/Layout/`）
  - 顶部导航栏：Logo + 名称 + 导航项 + 右上角搜索框
  - 导航项：首页、浏览、下载、统计、帮助
  - 使用 Ant Design `Menu` 组件
- [x] **2.2** 配置 React Router（`App.tsx`）
  ```
  /              → Home
  /search        → Search
  /browse        → Browse
  /analysis/:key → Analysis
  /download      → Download
  /statistics    → Statistics
  /help          → Help
  ```
- [x] **2.3** 每个页面先创建占位组件（显示页面名称即可）
- [ ] **2.4** 验证：点击导航栏各项能正确切换页面

---

## 第三阶段：首页

- [x] **3.1** Hero 区域
  - 项目名称：MouseToxDB
  - 副标题：小鼠毒理转录组数据库
  - 简介文字
- [x] **3.2** 搜索区
  - [x] 分类下拉（Select 组件）：全部 / CAS号 / InChIKey / 化学物名称 / PubChem CID / DESEQ_ID
  - [x] 搜索框（Input.Search）
  - [x] placeholder：输入化学物名称、CAS号、InChIKey、PubChem CID 或 DESEQ_ID
  - [x] 搜索后跳转 `/search?keyword=xxx&category=yyy`
- [x] **3.3** 数据摘要卡片区
  - [x] 调用 `GET /api/stats/summary`
  - [x] 4 张卡片：样本记录 / 分析条目 / 化学物种类 / DESEQ 分析数
  - [x] 使用 Ant Design `Statistic` + `Card` + `Row`/`Col`
- [x] **3.4** 统计图区（静态图片）
  - [x] 从 summary API 的 statistics_assets 获取图片列表
  - [x] `<img src={url}>` 展示
- [x] **3.5** 分析流程图区（静态图片）
- [x] **3.6** 外部链接区（GEO、PubChem、BioProject 图标链接）
- [ ] **3.7** 验证：首页完整展示，搜索能正确跳转

---

## 第四阶段：搜索结果页（核心流程）

> 这是最关键的页面，用户的主要入口

- [x] **4.1** 编写搜索 API 调用（`api/search.ts`）
- [x] **4.2** 编写共用表格组件 `AnalysisTable`
  - [x] 列定义：DESEQ_ID(可点击) / 化学物名称 / CAS号 / GSE_ID(外链) / 物种 / 组织分类 / 建库方法 / 样本数
  - [x] DESEQ_ID 点击 → 跳转 `/analysis/{analysis_key}`
  - [x] GSE_ID 点击 → 新标签页打开 GEO 外链
  - [x] 分页组件（每页 30 条）
- [x] **4.3** 页面结构
  - [x] 顶部搜索框（带分类下拉，支持重新搜索）
  - [x] 结果提示："找到 N 条分析条目"
  - [x] "导出结果"按钮
  - [x] AnalysisTable 组件
- [x] **4.4** URL 参数联动
  - [x] 从 URL 读取 keyword / category / page
  - [x] 参数变化时重新请求 API
- [x] **4.5** 空结果处理
  - [x] 0 条 → 显示"未找到相关数据，请尝试其他关键词"
- [ ] **4.6** 验证：搜索 "Bisphenol" → 看到结果列表 → 分页正常

---

## 第五阶段：详情页（核心流程）

> 从搜索结果点进来的页面，承载最多信息

- [x] **5.1** 编写详情 API 调用（`api/analysis.ts`）
- [x] **5.2** 页面骨架
  - [x] "← 返回" 按钮
  - [x] 标题：`{deseq_id} — {chemical_name}`
  - [x] Ant Design `Tabs` 组件（5 个 Tab）
  - [x] 页面加载时调用 `GET /api/analysis/{key}`
  - [x] analysis_key 不存在 → 显示"分析条目未找到"
- [x] **5.3** Tab 1：基本信息
  - [x] Ant Design `Descriptions`（带边框）
  - [x] 字段：化学物名称、CAS号、InChIKey、PubChem CID(外链)、PubChem名称、DESEQ_ID、数据来源、证据等级、MESH分类
  - [x] 空值显示 "—"
- [x] **5.4** Tab 2：实验信息
  - [x] Ant Design `Descriptions`
  - [x] 字段：GSE_ID(外链)、BioProject(外链)、物种、平台、组织分类/细分、细胞系、毒物、建库方法、发表年月、参考文献、DOI(外链)
  - [x] 空值显示 "—"
- [x] **5.5** Tab 3：样本记录
  - [x] Ant Design `Table`
  - [x] 列：SRR_ID(外链→SRA) / 处理条件 / 实验分组 / 化学简称 / 剂量 / 暴露时间 / AvgSpotLen / 细胞类型 / 测序布局
  - [x] 数据来自 sample_records 数组
- [x] **5.6** Tab 4：图表资源
  - [x] 卡片网格布局（Row + Col + Card）
  - [x] 每张 PDF 卡片：名称 + PDF 预览 + 下载按钮
  - [x] PDF 预览：使用 react-pdf 或 iframe 加载 preview_url
  - [x] 状态处理：
    - [x] available → 正常预览
    - [x] missing → 灰色占位 + "当前文件未找到"
    - [x] pending → 灰色占位 + "资源待补充"
  - [x] assets 为空 → "暂无资源"
  - [x] plot_df.txt 在底部提供下载链接
- [x] **5.7** Tab 5：DEG 差异基因表
  - [x] 调用 `GET /api/analysis/{key}/tables/deg-table?page=1&page_size=30`
  - [x] Ant Design `Table`
  - [x] 列：geneID / baseMean / log2FoldChange / lfcSE / stat / pvalue / padj / -log10(P.Value) / trend / ENTREZID
  - [x] 分页（切换页码重新调用 API）
  - [x] error → 显示"文件解析失败"，保留下载按钮
  - [x] total=0 → 显示"暂无 DEG 数据"
- [ ] **5.8** 验证：从搜索结果点 DESEQ_ID → 5 个 Tab 全部正常展示

---

## 第六阶段：浏览页

- [x] **6.1** 编写浏览 API 调用（`api/browse.ts`）
- [x] **6.2** 左侧筛选面板
  - [x] 调用 `GET /api/browse/filters` 获取选项
  - [x] 组织分类：Checkbox.Group 或 多选 Select
  - [x] 建库方法：Checkbox.Group 或 多选 Select
  - [x] 发表年份：Slider 范围选择 或 两个 InputNumber
  - [x] 筛选变化时重新请求浏览 API
- [x] **6.3** 右侧数据表格
  - [x] 复用 AnalysisTable 组件
  - [x] 默认展示全部 81 条分析条目
- [ ] **6.4** 验证：筛选操作后表格正确更新

---

## 第七阶段：辅助页面

- [x] **7.1** 下载页（`/download`）
  - [x] 一个下载卡片："下载完整数据"按钮
  - [x] 点击触发 `GET /api/download/database`
- [x] **7.2** 搜索结果页"导出结果"按钮
  - [x] 点击触发 `GET /api/search/export?keyword=xxx&category=yyy`
  - [x] 浏览器自动下载
- [x] **7.3** 统计页（`/statistics`）
  - [x] 从 summary API 获取 statistics_assets
  - [x] 展示每张图：标题 + img + 说明
- [x] **7.4** 帮助页（`/help`）
  - [x] 网站使用说明
  - [x] 字段说明简表
  - [x] 外部链接说明
  - [x] 联系方式
  - [x] 论文引用说明
- [ ] **7.5** 验证：所有辅助页面正常工作

---

## 第八阶段：工具函数 + UI 细节

- [x] **8.1** 外部链接工具函数（`utils/externalLinks.ts`）
  - PubChem / GEO / SRA / BioProject / DOI 链接生成
  - 所有外链 target="_blank" rel="noopener noreferrer"
  - 空值不显示链接
- [x] **8.2** 空值格式化（`utils/formatters.ts`）
  - null / undefined / "" → 显示 "—"
- [x] **8.3** ExternalLink 组件
  - 统一的外链渲染组件（蓝色文字 + 新标签页）
- [x] **8.4** 长文本 tooltip 处理
  - Table 列启用 ellipsis
  - Descriptions 中超长文本用 Tooltip
- [x] **8.5** 导航栏搜索框
  - 右上角精简搜索框（不带分类下拉）
  - 回车后跳转 `/search?keyword=xxx`
- [ ] **8.6** 响应式布局检查
  - 最小宽度 1024px
  - 详情页 PDF 卡片窄屏单列

---

## 第九阶段：收尾

- [ ] **9.1** 全流程走查
  - [ ] 首页 → 搜索 → 结果列表 → 详情页 → 每个 Tab
  - [ ] 浏览页 → 筛选 → 点击详情
  - [ ] 下载整库 / 导出结果
- [ ] **9.2** 跨浏览器测试（Chrome / Firefox / Safari）
- [ ] **9.3** Docker 全新构建测试
  ```bash
  docker compose down
  docker compose up --build
  ```
- [ ] **9.4** 修复发现的 Bug

---

## 完成标志

从首页搜索任意关键词 → 看到正确结果 → 点进详情页 5 个 Tab 全部正常 → 下载功能正常 → Docker 一键启动可用。
