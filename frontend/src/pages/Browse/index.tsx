import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Checkbox,
  Slider,
  Spin,
  InputNumber,
  Collapse,
  Select,
  Pagination,
  Tooltip,
  Tag,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { browseAnalyses, getBrowseFilters } from "../../api/browse";
import { displayValue } from "../../utils/formatters";
import useIsMobile from "../../hooks/useIsMobile";
import type { AnalysisItem, BrowseFilters } from "../../types";

const { Title, Text } = Typography;

const Browse: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<BrowseFilters | null>(null);
  const [selectedTissues, setSelectedTissues] = useState<string[]>(() => {
    const tc = searchParams.get("tissue_category");
    return tc ? [tc] : [];
  });
  const [selectedOrganisms, setSelectedOrganisms] = useState<string[]>([]);
  const [selectedVivoVitro, setSelectedVivoVitro] = useState<string[]>([]);
  const [selectedStrains, setSelectedStrains] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number] | null>(null);
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("deseq_id");
  const [sortOrder, setSortOrder] = useState("asc");
  const isMobile = useIsMobile();

  useEffect(() => {
    getBrowseFilters().then((res) => {
      if (res.code === 200 && res.data) {
        setFilters(res.data);
      }
    });
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, page_size: 30, sort_by: sortBy, sort_order: sortOrder };
    if (selectedTissues.length > 0)
      params.tissue_category = selectedTissues.join(",");
    if (selectedOrganisms.length > 0)
      params.organism = selectedOrganisms.join(",");
    if (selectedVivoVitro.length > 0)
      params.in_vivo_vitro = selectedVivoVitro.join(",");
    if (selectedStrains.length > 0)
      params.strain = selectedStrains.join(",");
    if (selectedGenders.length > 0)
      params.gender = selectedGenders.join(",");
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
  }, [page, selectedTissues, selectedOrganisms, selectedVivoVitro, selectedStrains, selectedGenders, yearRange, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const activeFilterCount =
    selectedTissues.length + selectedOrganisms.length + selectedVivoVitro.length +
    selectedStrains.length + selectedGenders.length + (yearRange ? 1 : 0);

  const filterContent = (
    <>
      <Collapse
        ghost
        size="small"
        defaultActiveKey={["tissue"]}
        items={[
          {
            key: "tissue",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.tissueCategory")}</span>,
            children: (
              <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 8 }}>
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
            ),
          },
          ...(filters?.year_range.min != null && filters?.year_range.max != null ? [{
            key: "year",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.publicationYear")}</span>,
            children: (
              <div>
                <Slider
                  range
                  min={filters.year_range.min}
                  max={filters.year_range.max}
                  value={yearRange ?? [filters.year_range.min, filters.year_range.max]}
                  onChange={(val: number | number[]) => {
                    if (!Array.isArray(val)) return;
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
              </div>
            ),
          }] : []),
          {
            key: "organism",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.organism")}</span>,
            children: (
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                <Checkbox.Group
                  options={filters?.organisms ?? []}
                  value={selectedOrganisms}
                  onChange={(vals) => { setSelectedOrganisms(vals as string[]); handleFilterChange(); }}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                />
              </div>
            ),
          },
          {
            key: "vivo",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.inVivoVitro")}</span>,
            children: (
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                <Checkbox.Group
                  options={filters?.in_vivo_vitro_options ?? []}
                  value={selectedVivoVitro}
                  onChange={(vals) => { setSelectedVivoVitro(vals as string[]); handleFilterChange(); }}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                />
              </div>
            ),
          },
          {
            key: "strain",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.strain")}</span>,
            children: (
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                <Checkbox.Group
                  options={filters?.strains ?? []}
                  value={selectedStrains}
                  onChange={(vals) => { setSelectedStrains(vals as string[]); handleFilterChange(); }}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                />
              </div>
            ),
          },
          {
            key: "gender",
            label: <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{t("browse.gender")}</span>,
            children: (
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                <Checkbox.Group
                  options={filters?.genders ?? []}
                  value={selectedGenders}
                  onChange={(vals) => { setSelectedGenders(vals as string[]); handleFilterChange(); }}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                />
              </div>
            ),
          },
        ]}
      />
    </>
  );

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
      {/* Card header */}
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
      {/* Card body */}
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

        {/* Card list */}
        <Col xs={24} md={18} lg={19}>
          <div style={{ background: "#fff", padding: isMobile ? 12 : 20, borderRadius: 4, border: "1px solid #c8d9ed", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Sort controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
              <Text type="secondary">{t("common.total", { count: total })}</Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>{t("browse.sortBy")}:</Text>
                <Select
                  value={sortBy}
                  onChange={(v) => { setSortBy(v); setPage(1); }}
                  size="small"
                  style={{ width: 140 }}
                  options={[
                    { value: "deseq_id", label: t("browse.sortDeseqId") },
                    { value: "chemical_name", label: t("browse.sortChemicalName") },
                    { value: "publication_year", label: t("browse.sortPublicationYear") },
                    { value: "gse_id", label: t("browse.sortGseId") },
                  ]}
                />
                <Select
                  value={sortOrder}
                  onChange={(v) => { setSortOrder(v); setPage(1); }}
                  size="small"
                  style={{ width: 80 }}
                  options={[
                    { value: "asc", label: t("browse.ascending") },
                    { value: "desc", label: t("browse.descending") },
                  ]}
                />
              </div>
            </div>

            <Spin spinning={loading}>
              {items.map(renderCard)}
              {items.length > 0 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Pagination
                    current={page}
                    pageSize={30}
                    total={total}
                    onChange={setPage}
                    showSizeChanger={false}
                    showTotal={(t) => `${t}`}
                  />
                </div>
              )}
              {!loading && items.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                  {t("common.noData")}
                </div>
              )}
            </Spin>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Browse;
