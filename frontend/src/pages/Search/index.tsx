import React, { useEffect, useState, useCallback } from "react";
import { Typography, Button, Space, Empty } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBox from "../../components/SearchBox";
import AnalysisTable from "../../components/AnalysisTable";
import { searchAnalyses } from "../../api/search";
import { exportSearchResults } from "../../api/download";
import type { AnalysisItem } from "../../types";

const { Title, Text } = Typography;

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const keyword = searchParams.get("keyword") ?? "";
  const category = searchParams.get("category") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (!keyword) return;
    setLoading(true);
    searchAnalyses(keyword, category, page)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setItems(res.data.items);
          setTotal(res.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [keyword, category, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (kw: string, cat: string) => {
    navigate(
      `/search?keyword=${encodeURIComponent(kw)}&category=${encodeURIComponent(cat)}&page=1`
    );
  };

  const handlePageChange = (p: number) => {
    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&page=${p}`
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24, maxWidth: 900, margin: "0 auto 24px" }}>
        <div style={{ background: "#ffffff", padding: "10px", borderRadius: "6px", border: "1px solid #c8d9ed", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <SearchBox
            onSearch={handleSearch}
            defaultKeyword={keyword}
            defaultCategory={category}
          />
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #c8d9ed", borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ background: "#1d3e70", padding: "12px 20px", borderBottom: "2px solid #e8a735", borderRadius: "4px 4px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Title level={5} style={{ margin: 0, color: "#fff" }}>
              {t("search.results")}
            </Title>
            {total > 0 && (
              <Text style={{ color: "#e0e8f5", fontSize: 13 }}>
                {t("search.found", { count: total })}
              </Text>
            )}
          </Space>
          {total > 0 && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => exportSearchResults(keyword, category)}
            >
              {t("search.exportResults")}
            </Button>
          )}
        </div>

        <div style={{ padding: "20px" }}>
          {!loading && total === 0 && keyword ? (
            <Empty description={t("search.noResults")} />
          ) : (
            <AnalysisTable
              items={items}
              total={total}
              page={page}
              pageSize={30}
              loading={loading}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
