/** 触发浏览器文件下载 */
export function downloadFile(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** 整库下载 */
export function downloadDatabase() {
  downloadFile("/api/download/database");
}

/** 搜索结果导出 */
export function exportSearchResults(keyword: string, category: string) {
  downloadFile(
    `/api/search/export?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
  );
}

/** 单个资源下载 */
export function downloadAsset(assetId: number) {
  downloadFile(`/api/assets/${assetId}/download`);
}
