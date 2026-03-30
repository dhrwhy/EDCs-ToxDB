-- ============================================================
-- MouseToxDB 建表脚本
-- 数据库: mousetoxdb
-- 字符集: utf8mb4 / utf8mb4_general_ci
-- ============================================================

USE mousetoxdb;

-- ---------- 主表: main_records ----------
DROP TABLE IF EXISTS main_records;

CREATE TABLE main_records (
    -- ========== 系统字段 ==========
    record_pk          BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_key       VARCHAR(128) NOT NULL              COMMENT '系统唯一分析键: {DESEQ_ID}__{ID}__{GSE_ID}__{BioProject}',
    created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- ========== Excel 源字段（47 列） ==========
    sort_id                  INT          NOT NULL                COMMENT 'Excel原始排序号',
    chemical_id              INT          NOT NULL                COMMENT '化学物质内部编号(ID列)',
    cas_id                   VARCHAR(50)  NOT NULL                COMMENT 'CAS编号',
    inchi_key                VARCHAR(100) NOT NULL                COMMENT 'InChIKey',
    chemical_name            VARCHAR(512) NOT NULL                COMMENT '化学物标准名称',
    alternative_names        TEXT         NULL                    COMMENT '化学物别名',
    pubchem_cid              VARCHAR(50)  NOT NULL                COMMENT 'PubChem化合物编号',
    pubchem_name             VARCHAR(255) NOT NULL                COMMENT 'PubChem名称',
    deseq_id                 VARCHAR(50)  NOT NULL                COMMENT 'DESeq分析编号(非唯一)',
    from_group               VARCHAR(255) NOT NULL                COMMENT '数据来源分组',
    evidence                 VARCHAR(255) NOT NULL                COMMENT '证据等级说明',
    gse_id                   VARCHAR(50)  NOT NULL                COMMENT 'GEO Series编号',
    srr_id                   VARCHAR(50)  NOT NULL                COMMENT 'SRA Run编号',
    bioproject_id            VARCHAR(50)  NOT NULL                COMMENT 'BioProject编号',
    avg_spot_len             INT          NOT NULL                COMMENT '平均reads/spot长度',
    cell_type                VARCHAR(255) NULL                    COMMENT '细胞类型/样本来源',
    library_layout           VARCHAR(20)  NOT NULL                COMMENT '测序布局(PAIRED/SINGLE)',
    organism                 VARCHAR(100) NOT NULL                COMMENT '物种',
    platform                 VARCHAR(50)  NOT NULL                COMMENT '测序平台',
    treatment                VARCHAR(255) NULL                    COMMENT '处理条件',
    experiment_group         VARCHAR(20)  NOT NULL                COMMENT '实验分组(con/treat)',
    chem_name                VARCHAR(255) NULL                    COMMENT '实验中化学名称/简称',
    dose                     VARCHAR(100) NULL                    COMMENT '暴露剂量',
    exposure_time            VARCHAR(100) NULL                    COMMENT '暴露时间',
    summary_text             TEXT         NULL                    COMMENT 'Summary摘要',
    strain                   VARCHAR(255) NULL                    COMMENT '品系',
    in_vivo_vitro            VARCHAR(20)  NULL                    COMMENT '体内或体外',
    gender                   VARCHAR(20)  NULL                    COMMENT '性别',
    tissue_category          VARCHAR(100) NOT NULL                COMMENT '组织一级分类',
    tissue_subcategory       VARCHAR(100) NULL                    COMMENT '组织二级分类',
    reproductive_subcategory VARCHAR(100) NULL                    COMMENT '生殖系统细分',
    tissue_or_cell_line      VARCHAR(255) NOT NULL                COMMENT '具体组织或细胞系',
    exposure_toxicant        VARCHAR(255) NULL                    COMMENT '暴露毒物名称',
    library_method           VARCHAR(100) NULL                    COMMENT '建库方法',
    library_method_detail    VARCHAR(100) NULL                    COMMENT '详细建库方法',
    publication_year         SMALLINT     NULL                    COMMENT '发表年份',
    publication_month        TINYINT      NULL                    COMMENT '发表月份',
    reference_title          TEXT         NULL                    COMMENT '参考文献标题',
    doi                      VARCHAR(255) NULL                    COMMENT 'DOI编号',
    class1_code              VARCHAR(20)  NOT NULL                COMMENT 'MESH分类层级1',
    class2_code              VARCHAR(20)  NOT NULL                COMMENT 'MESH分类层级2',
    class3_name              VARCHAR(100) NULL                    COMMENT '分类层级3',
    class4_name              VARCHAR(100) NULL                    COMMENT '分类层级4',
    class5_name              VARCHAR(100) NULL                    COMMENT '分类层级5',
    class6_name              VARCHAR(100) NULL                    COMMENT '分类层级6',
    class7_name              VARCHAR(100) NULL                    COMMENT '分类层级7',
    inferred_class           VARCHAR(100) NULL                    COMMENT '推断分类',

    -- ========== 索引 ==========
    UNIQUE INDEX idx_analysis_key (analysis_key),
    INDEX idx_chemical_id (chemical_id),
    INDEX idx_cas_id (cas_id),
    INDEX idx_inchi_key (inchi_key),
    INDEX idx_pubchem_cid (pubchem_cid),
    INDEX idx_deseq_id (deseq_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='主表：Excel样本记录';


-- ---------- 资源表: record_assets ----------
DROP TABLE IF EXISTS record_assets;

CREATE TABLE record_assets (
    asset_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    deseq_id       VARCHAR(50)  NOT NULL                     COMMENT '资源所属DESEQ_ID',
    file_name      VARCHAR(255) NOT NULL                     COMMENT '原始文件名',
    file_path      TEXT         NOT NULL                     COMMENT '服务器相对路径',
    file_ext       VARCHAR(10)  NOT NULL                     COMMENT '文件扩展名(pdf/txt)',
    asset_category VARCHAR(50)  NOT NULL                     COMMENT '资源分类',
    display_name   VARCHAR(100) NOT NULL                     COMMENT '前端显示名称',
    sort_order     INT          NOT NULL DEFAULT 0           COMMENT '展示排序',
    parse_mode     VARCHAR(20)  NOT NULL DEFAULT 'none'      COMMENT '解析模式: none / table_preview',
    status         VARCHAR(20)  NOT NULL DEFAULT 'available' COMMENT '状态: available / missing / pending',
    remark         TEXT         NULL                         COMMENT '备注',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_deseq_id (deseq_id),
    INDEX idx_asset_category (asset_category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='资源表：DESEQ_ID关联的PDF/TXT文件';
