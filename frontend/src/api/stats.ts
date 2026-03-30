import api from "./index";
import type {
  ApiResponse,
  StatsSummary,
  PublicationYearData,
  OrganDistributionData,
  MeshTreeNode,
} from "../types";

export async function getStatsSummary() {
  const res = await api.get<ApiResponse<StatsSummary>>("/stats/summary");
  return res.data;
}

export async function getPublicationYears() {
  const res = await api.get<ApiResponse<PublicationYearData[]>>("/stats/publication-years");
  return res.data;
}

export async function getOrganDistribution() {
  const res = await api.get<ApiResponse<OrganDistributionData[]>>("/stats/organ-distribution");
  return res.data;
}

export async function getMeshTree() {
  const res = await api.get<ApiResponse<MeshTreeNode[]>>("/stats/mesh-tree");
  return res.data;
}
