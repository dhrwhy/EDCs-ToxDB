import React, { useEffect, useState, useCallback } from "react";
import { Typography, Button, Space, Empty, Spin, Row, Col, Tooltip, Tag, Pagination } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBox from "../../components/SearchBox";
import { searchAnalyses } from "../../api/search";
import { exportSearchResults } from "../../api/download";
import { displayValue } from "../../utils/formatters";
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

  const renderCard = (item: AnalysisItem) => (
    <div
      key={item.analysis_key}
      onClick={() => navigate(`/analysis/${encodeURIComponent(item.analysis_key)}`)}
      style={{
        background: "#fff",
        border: "1px solid #c8d9ed",
        borderRadius: 4,
        marginBottom: 12,
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(29,62,112,0.15)";
        e.currentTarget.style.borderColor = "#1d3e70";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#c8d9ed";
      }}
    >
      <div style={{
        background: '#1d3e70',
        color: '#fff',
        padding: '10px 16px',
        fontWeight: 'bold',
        fontSize: 15,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{item.deseq_id}</span>
        {item.publication_year && (
          <Tag color="gold" style={{ margin: 0 }}>{item.publication_year}</Tag>
        )}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t("browse.toxicant")}: </Text>
              <Tooltip title={
                <div>
                  <div>{item.chemical_name}</div>
                  {item.pubchem_name && item.pubchem_name !== item.chemical_name && <div>PubChem: {item.pubchem_name}</div>}
                  {item.alternative_names && <div>{item.alternative_names}</div>}
                </div>
              }>
                <Text strong style={{ fontSize: 14 }}>{item.chemical_name}</Text>
              </Tooltip>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t("browse.dose")}: </Text>
              <Text style={{ fontSize: 14 }}>{displayValue(item.dose)}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>GSE: </Text>
              <Text style={{ fontSize: 14 }}>{item.gse_id}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t("browse.organism")}: </Text>
              <Text style={{ fontSize: 14 }}>{item.organism}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t("browse.tissue")}: </Text>
              <Text style={{ fontSize: 14 }}>
                {item.tissue_category}
                {item.tissue_subcategory ? ` > ${item.tissue_subcategory}` : ""}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t("browse.cellLine")}: </Text>
              <Text style={{ fontSize: 14 }}>{displayValue(item.cell_type)}</Text>
            </div>
          </Col>
          {item.doi && (
            <Col xs={24}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>DOI: </Text>
                <Text style={{ fontSize: 13 }} copyable>{item.doi}</Text>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );

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
          <Spin spinning={loading}>
            {!loading && total === 0 && keyword ? (
              <Empty description={t("search.noResults")} />
            ) : (
              <>
                {items.map(renderCard)}
                {total > 30 && (
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Pagination
                      current={page}
                      total={total}
                      pageSize={30}
                      onChange={handlePageChange}
                      showTotal={(t) => `${t} ${t === 1 ? 'result' : 'results'}`}
                    />
                  </div>
                )}
              </>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Search;
