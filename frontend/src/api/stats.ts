import api from "./index";
import type { ApiResponse, StatsSummary } from "../types";

export async function getStatsSummary() {
  const res = await api.get<ApiResponse<StatsSummary>>("/stats/summary");
  return res.data;
}
