/** 搜索/浏览结果中的分析条目 */
export interface AnalysisItem {
  analysis_key: string;
  deseq_id: string;
  chemical_id: number;
  sort_id: number;
  cas_id: string;
  chemical_name: string;
  pubchem_cid: string;
  pubchem_name: string;
  alternative_names: string | null;
  gse_id: string;
  bioproject_id: string;
  organism: string;
  tissue_category: string;
  tissue_subcategory: string | null;
  platform: string;
  publication_year: number | null;
  dose: string | null;
  cell_type: string | null;
  doi: string | null;
  has_assets: boolean;
}

/** 详情页汇总信息 */
export interface AnalysisSummary {
  sort_id: number;
  chemical_id: number;
  cas_id: string;
  inchi_key: string;
  chemical_name: string;
  alternative_names: string | null;
  pubchem_cid: string;
  pubchem_name: string;
  from_group: string;
  evidence: string;
  gse_id: string;
  bioproject_id: string;
  organism: string;
  platform: string;
  tissue_category: string;
  tissue_subcategory: string | null;
  reproductive_subcategory: string | null;
  tissue_or_cell_line: string;
  exposure_toxicant: string | null;
  library_method: string | null;
  library_method_detail: string | null;
  publication_year: number | null;
  publication_month: number | null;
  reference_title: string | null;
  doi: string | null;
  summary_text: string | null;
  strain: string | null;
  in_vivo_vitro: string | null;
  gender: string | null;
  class1_code: string;
  class2_code: string;
  class3_name: string | null;
  class4_name: string | null;
  class5_name: string | null;
  class6_name: string | null;
  class7_name: string | null;
  inferred_class: string | null;
}

/** 样本记录 */
export interface SampleRecord {
  srr_id: string;
  avg_spot_len: number;
  cell_type: string | null;
  library_layout: string;
  treatment: string | null;
  experiment_group: string;
  chem_name: string | null;
  dose: string | null;
  exposure_time: string | null;
}

/** 资源文件 */
export interface AssetItem {
  asset_id: number;
  deseq_id: string;
  display_name: string;
  asset_category: string;
  file_ext: string;
  preview_url: string;
  download_url: string;
  status: "available" | "missing" | "pending";
}

/** 详情页完整数据 */
export interface AnalysisDetail {
  analysis_key: string;
  deseq_id: string;
  summary: AnalysisSummary;
  sample_records: SampleRecord[];
  assets: AssetItem[];
}

/** DEG 表格数据 */
export interface DegTableData {
  name: string;
  columns: string[];
  total: number;
  page: number;
  page_size: number;
  items: Record<string, unknown>[];
  error?: string;
}

/** 统计摘要 */
export interface StatsSummary {
  record_rows: number;
  analysis_groups: number;
  unique_chemicals: number;
  unique_deseq_id: number;
  unique_srr_id: number;
  unique_gse_id: number;
  unique_bioproject_id: number;
  statistics_assets: StatisticsAsset[];
}

export interface StatisticsAsset {
  name: string;
  title: string;
  type: string;
  url: string;
}

/** 浏览筛选选项 */
export interface BrowseFilters {
  tissue_categories: string[];
  year_range: { min: number | null; max: number | null };
  organisms: string[];
  in_vivo_vitro_options: string[];
  strains: string[];
  genders: string[];
}

/** Publication year data */
export interface PublicationYearData {
  year: number;
  count: number;
}

/** Organ distribution data */
export interface OrganDistributionData {
  tissue_category: string;
  tissue_subcategory: string | null;
  count: number;
}

/** MESH tree node */
export interface MeshTreeNode {
  name: string;
  children: MeshTreeNode[];
  chemicals: MeshTreeChemical[];
}

export interface MeshTreeChemical {
  chemical_name: string;
  deseq_id: string;
  analysis_key: string;
}

/** 统一 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export interface PaginatedData<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}
