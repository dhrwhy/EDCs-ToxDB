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
  Space,
} from "antd";
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

  return (
    <Row gutter={24}>
      {/* 筛选面板 */}
      <Col xs={24} md={6}>
        <div
          style={{
            background: "#fafafa",
            borderRadius: 8,
            padding: 16,
            position: "sticky",
            top: 88,
          }}
        >
          <Title level={5}>{t("browse.filters")}</Title>

          <Divider style={{ margin: "12px 0" }} />
          <Title level={5} style={{ fontSize: 14 }}>
            {t("browse.tissueCategory")}
          </Title>
          <Checkbox.Group
            options={filters?.tissue_categories ?? []}
            value={selectedTissues}
            onChange={(vals) => {
              setSelectedTissues(vals as string[]);
              handleFilterChange();
            }}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          />

          <Divider style={{ margin: "12px 0" }} />
          <Title level={5} style={{ fontSize: 14 }}>
            {t("browse.libraryMethod")}
          </Title>
          <Checkbox.Group
            options={filters?.library_methods ?? []}
            value={selectedMethods}
            onChange={(vals) => {
              setSelectedMethods(vals as string[]);
              handleFilterChange();
            }}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          />

          {filters?.year_range.min != null &&
            filters?.year_range.max != null && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Title level={5} style={{ fontSize: 14 }}>
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
                <Space>
                  <InputNumber
                    size="small"
                    min={filters.year_range.min}
                    max={filters.year_range.max}
                    value={yearRange?.[0]}
                    onChange={(v) => {
                      if (v != null && yearRange)
                        setYearRange([v, yearRange[1]]);
                    }}
                  />
                  <span>-</span>
                  <InputNumber
                    size="small"
                    min={filters.year_range.min}
                    max={filters.year_range.max}
                    value={yearRange?.[1]}
                    onChange={(v) => {
                      if (v != null && yearRange)
                        setYearRange([yearRange[0], v]);
                    }}
                  />
                </Space>
              </>
            )}
        </div>
      </Col>

      {/* 数据表格 */}
      <Col xs={24} md={18}>
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
      </Col>
    </Row>
  );
};

export default Browse;
