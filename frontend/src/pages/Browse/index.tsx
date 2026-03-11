import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Checkbox,
  Slider,
  Spin,
  Divider,
  InputNumber,
  Collapse,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import AnalysisTable from "../../components/AnalysisTable";
import { browseAnalyses, getBrowseFilters } from "../../api/browse";
import type { AnalysisItem, BrowseFilters } from "../../types";

const { Title } = Typography;

const Browse: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [selectedTissues, setSelectedTissues] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    getBrowseFilters().then((res) => {
      if (res.code === 200 && res.data) {
        setFilters(res.data);
      }
    });
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, page_size: 30 };
    if (selectedTissues.length > 0)
      params.tissue_category = selectedTissues.join(",");
    if (selectedMethods.length > 0)
      params.library_method = selectedMethods.join(",");
    if (yearRange) {
      params.year_min = yearRange[0];
      params.year_max = yearRange[1];
    }
    browseAnalyses(params as Record<string, string | number>)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setItems(res.data.items);
          setTotal(res.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [page, selectedTissues, selectedMethods, yearRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const activeFilterCount = selectedTissues.length + selectedMethods.length + (yearRange ? 1 : 0);

  const filterContent = (
    <>
      <Title level={5} style={{ fontSize: 15, marginBottom: 12, marginTop: 0, color: "#333" }}>
        {t("browse.tissueCategory")}
      </Title>
      <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 8 }}>
        <Checkbox.Group
          options={filters?.tissue_categories ?? []}
          value={selectedTissues}
          onChange={(vals) => {
            setSelectedTissues(vals as string[]);
            handleFilterChange();
          }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        />
      </div>

      <Divider style={{ margin: "20px 0" }} />

      <Title level={5} style={{ fontSize: 15, marginBottom: 12, color: "#333" }}>
        {t("browse.libraryMethod")}
      </Title>
      <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 8 }}>
        <Checkbox.Group
          options={filters?.library_methods ?? []}
          value={selectedMethods}
          onChange={(vals) => {
            setSelectedMethods(vals as string[]);
            handleFilterChange();
          }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        />
      </div>

      {filters?.year_range.min != null &&
        filters?.year_range.max != null && (
          <>
            <Divider style={{ margin: "20px 0" }} />
            <Title level={5} style={{ fontSize: 15, marginBottom: 12, color: "#333" }}>
              {t("browse.publicationYear")}
            </Title>
            <Slider
              range
              min={filters.year_range.min}
              max={filters.year_range.max}
              value={yearRange ?? [filters.year_range.min, filters.year_range.max]}
              onChange={(val) => {
                setYearRange(val as [number, number]);
                handleFilterChange();
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <InputNumber
                style={{ width: "100%" }}
                min={filters.year_range.min}
                max={filters.year_range.max}
                value={yearRange?.[0]}
                onChange={(v) => {
                  if (v != null && yearRange)
                    setYearRange([v, yearRange[1]]);
                }}
              />
              <span style={{ color: "#888" }}>-</span>
              <InputNumber
                style={{ width: "100%" }}
                min={filters.year_range.min}
                max={filters.year_range.max}
                value={yearRange?.[1]}
                onChange={(v) => {
                  if (v != null && yearRange)
                    setYearRange([yearRange[0], v]);
                }}
              />
            </div>
          </>
        )}
    </>
  );

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      {/* Mobile: collapsible filter */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <Collapse
            activeKey={mobileFilterOpen ? ["filter"] : []}
            onChange={(keys) => setMobileFilterOpen(keys.includes("filter"))}
            items={[{
              key: "filter",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "bold" }}>
                  <FilterOutlined />
                  {t("browse.filters")}
                  {activeFilterCount > 0 && (
                    <span style={{
                      background: "#e8a735",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "0 8px",
                      fontSize: 12,
                      lineHeight: "20px",
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </span>
              ),
              children: filterContent,
            }]}
            style={{ background: "#fff", border: "1px solid #c8d9ed" }}
          />
        </div>
      )}

      <Row gutter={isMobile ? 16 : 24}>
        {/* Desktop: sidebar filter panel */}
        {!isMobile && (
          <Col md={6} lg={5}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #c8d9ed",
                borderRadius: 4,
                position: "sticky",
                top: 140,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                maxHeight: "calc(100vh - 160px)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ background: "#1d3e70", padding: "12px 16px", borderBottom: "2px solid #e8a735", borderRadius: "4px 4px 0 0", display: "flex", alignItems: "center", flexShrink: 0 }}>
                <FilterOutlined style={{ color: "#fff", marginRight: 8 }} />
                <Title level={5} style={{ fontSize: 15, margin: 0, color: "#ffffff" }}>
                  {t("browse.filters")}
                </Title>
              </div>
              <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
                {filterContent}
              </div>
            </div>
          </Col>
        )}

        {/* 数据表格 */}
        <Col xs={24} md={18} lg={19}>
          <div style={{ background: "#fff", padding: isMobile ? 12 : 20, borderRadius: 4, border: "1px solid #c8d9ed", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Spin spinning={loading}>
              <AnalysisTable
                items={items}
                total={total}
                page={page}
                pageSize={30}
                loading={loading}
                onPageChange={setPage}
              />
            </Spin>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Browse;
