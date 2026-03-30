import api from "./index";
import type { ApiResponse, AnalysisDetail, DegTableData } from "../types";

export async function getAnalysisDetail(analysisKey: string) {
  const res = await api.get<ApiResponse<AnalysisDetail>>(
    `/analysis/${encodeURIComponent(analysisKey)}`
  );
  return res.data;
}

export async function getDegTable(
  analysisKey: string,
  page = 1,
  pageSize = 30
) {
  const res = await api.get<ApiResponse<DegTableData>>(
    `/analysis/${encodeURIComponent(analysisKey)}/tables/deg-table`,
    { params: { page, page_size: pageSize } }
  );
  return res.data;
}
