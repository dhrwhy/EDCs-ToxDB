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
    <div>
      <div style={{ marginBottom: 24 }}>
        <SearchBox
          onSearch={handleSearch}
          defaultKeyword={keyword}
          defaultCategory={category}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            {t("search.results")}
          </Title>
          {total > 0 && (
            <Text type="secondary">
              {t("search.found", { count: total })}
            </Text>
          )}
        </Space>
        {total > 0 && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportSearchResults(keyword, category)}
          >
            {t("search.exportResults")}
          </Button>
        )}
      </div>

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
  );
};

export default Search;
