import api from "./index";
import type { ApiResponse, PaginatedData, AnalysisItem } from "../types";

export async function searchAnalyses(
  keyword: string,
  category = "all",
  page = 1,
  pageSize = 30
) {
  const res = await api.get<ApiResponse<PaginatedData<AnalysisItem>>>(
    "/search",
    { params: { keyword, category, page, page_size: pageSize } }
  );
  return res.data;
}
