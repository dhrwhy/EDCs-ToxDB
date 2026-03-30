import api from "./index";
import type {
  ApiResponse,
  PaginatedData,
  AnalysisItem,
  BrowseFilters,
} from "../types";

export async function browseAnalyses(params: {
  tissue_category?: string;
  year_min?: number;
  year_max?: number;
  organism?: string;
  in_vivo_vitro?: string;
  strain?: string;
  gender?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}) {
  const res = await api.get<ApiResponse<PaginatedData<AnalysisItem>>>(
    "/browse",
    { params }
  );
  return res.data;
}

export async function getBrowseFilters() {
  const res = await api.get<ApiResponse<BrowseFilters>>("/browse/filters");
  return res.data;
}
