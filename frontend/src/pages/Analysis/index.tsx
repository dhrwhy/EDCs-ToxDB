import React, { useEffect, useState, useRef } from "react";
import {
  Collapse,
  Tabs,
  Descriptions,
  Table,
  Typography,
  Button,
  Spin,
  Empty,
  Breadcrumb,
  Row,
  Col,
} from "antd";
import { DownloadOutlined, RightOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAnalysisDetail } from "../../api/analysis";
import { downloadAsset } from "../../api/download";
import { displayValue } from "../../utils/formatters";
import { externalLinks } from "../../utils/externalLinks";
import ExternalLink from "../../components/ExternalLink";
import PdfCard from "../../components/PdfCard";
import DegTable from "../../components/DegTable";
import type { AnalysisDetail, AssetItem } from "../../types";
import useIsMobile from "../../hooks/useIsMobile";

const { Title, Text } = Typography;

const allKeys = ["toxicant", "experiment", "differential", "enrichment", "expression"];

const Analysis: React.FC = () => {
  const { analysisKey } = useParams<{ analysisKey: string }>();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(allKeys);
  const collapseRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>(allKeys[0]);

  // Intersection Observer to track the currently visible section
  useEffect(() => {
    const sectionEls = allKeys
      .map((key) => document.getElementById(`section-${key}`))
      .filter(Boolean) as HTMLElement[];
    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("section-", "");
          setCurrentSection(id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [detail, activeKeys]);

  useEffect(() => {
    if (!analysisKey) return;
    setLoading(true);
    getAnalysisDetail(analysisKey)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setDetail(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [analysisKey]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  if (notFound || !detail) {
    return <Empty description={t("common.notFound")} />;
  }

  const { summary, sample_records, assets } = detail;

  const plotDf = assets.find((a) => a.asset_category === "plot_df");

  const enrichmentCategories = [
    { key: "kegg_up_plot", label: t("analysis.keggUp") },
    { key: "kegg_down_plot", label: t("analysis.keggDown") },
    { key: "reactome_up_plot", label: t("analysis.reactomeUp") },
    { key: "reactome_down_plot", label: t("analysis.reactomeDown") },
    { key: "hallmark_up_plot", label: t("analysis.hallmarkUp") },
    { key: "do_up_plot", label: t("analysis.doUp") },
  ];
  const enrichmentAssets = enrichmentCategories
    .map((cat) => {
      const asset = assets.find((a) => a.asset_category === cat.key);
      return asset ? { ...cat, asset } : null;
    })
    .filter(Boolean) as { key: string; label: string; asset: AssetItem }[];

  const pcaAsset = assets.find((a) => a.asset_category === "pca_plot");
  const volcanoAsset = assets.find((a) => a.asset_category === "volcano_plot");
  const heatmapAsset = assets.find((a) => a.asset_category === "heatmap");

  const renderLink = (
    val: string | null,
    builder: (v: string) => string
  ) => {
    if (!val) return "\u2014";
    return <ExternalLink href={builder(val)}>{val}</ExternalLink>;
  };

  // Build MESH chain: infer_Class -> Class7 -> ... -> Class1, skip NULL, arrow style
  const meshChain = [
    summary.inferred_class,
    summary.class7_name,
    summary.class6_name,
    summary.class5_name,
    summary.class4_name,
    summary.class3_name,
    summary.class2_code,
    summary.class1_code,
  ].filter(Boolean) as string[];

  const sectionLabels: Record<string, string> = {
    toxicant: t("analysis.toxicantInfo"),
    experiment: t("analysis.experiment"),
    differential: t("analysis.differential"),
    enrichment: t("analysis.enrichment"),
    expression: t("analysis.expression"),
  };

  const scrollToSection = (key: string) => {
    if (!activeKeys.includes(key)) {
      setActiveKeys((prev) => [...prev, key]);
    }
    setTimeout(() => {
      const el = document.getElementById(`section-${key}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const collapseItems = [
    {
      key: "toxicant",
      label: sectionLabels.toxicant,
      children: (
        <div id="section-toxicant">
          {/* Sub-panel A: Basic toxicant info */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12, marginTop: 0 }}>
            {t("analysis.basicInfo")}
          </Title>
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 20 }}>
            <Descriptions.Item label={t("analysis.chemicalName")}>
              {summary.chemical_name}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.alternativeNames")}>
              {displayValue(summary.alternative_names)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.pubchemCid")}>
              {renderLink(summary.pubchem_cid, externalLinks.pubchem)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.pubchemName")}>
              {summary.pubchem_name}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.casId")}>
              {summary.cas_id}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.inchiKey")}>
              {summary.inchi_key}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.fromGroup")}>
              {summary.from_group}
            </Descriptions.Item>
          </Descriptions>

          {/* Sub-panel B: MESH Classification chain */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
            {t("analysis.classificationInfo")}
          </Title>
          {meshChain.length > 0 ? (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#f8f9fa",
              borderRadius: 4,
              border: "1px solid #e6edf5",
            }}>
              {meshChain.map((item, i) => (
                <React.Fragment key={i}>
                  <span style={{
                    padding: "4px 12px",
                    background: i === 0 ? "#1d3e70" : "#e6edf5",
                    color: i === 0 ? "#fff" : "#333",
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: i === 0 ? "bold" : "normal",
                  }}>
                    {item}
                  </span>
                  {i < meshChain.length - 1 && (
                    <RightOutlined style={{ color: "#999", fontSize: 12 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <Text type="secondary">{"\u2014"}</Text>
          )}
        </div>
      ),
    },
    {
      key: "experiment",
      label: sectionLabels.experiment,
      children: (
        <div id="section-experiment">
          {/* Sub-panel A: Sample table */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12, marginTop: 0 }}>
            {t("analysis.sampleTable")}
          </Title>
          <Table
            rowKey="srr_id"
            dataSource={sample_records}
            bordered
            size="small"
            pagination={
              sample_records.length > 30
                ? { pageSize: 30, showTotal: (total: number) => t("common.total", { count: total }) }
                : false
            }
            scroll={{ x: "max-content" }}
            style={{ marginBottom: 20 }}
            columns={[
              {
                title: t("analysis.experimentGroup"),
                dataIndex: "experiment_group",
                width: 100,
              },
              {
                title: t("analysis.chemAbbr"),
                dataIndex: "chem_name",
                render: (v: string | null) => displayValue(v),
              },
              {
                title: t("analysis.dose"),
                dataIndex: "dose",
                render: (v: string | null) => displayValue(v),
              },
              {
                title: t("analysis.exposureTime"),
                dataIndex: "exposure_time",
                render: (v: string | null) => displayValue(v),
              },
            ]}
          />

          {/* Sub-panel B: Experiment metadata */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
            {t("analysis.organism")} / {t("analysis.strain")}
          </Title>
          <Descriptions bordered column={{ xs: 1, sm: 3 }} style={{ marginBottom: 20 }}>
            <Descriptions.Item label={t("analysis.organism")}>
              {displayValue(summary.organism)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.strain")}>
              {displayValue(summary.strain)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.inVivoVitro")}>
              {displayValue(summary.in_vivo_vitro)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.gender")}>
              {displayValue(summary.gender)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.tissueCategory")}>
              {displayValue(summary.tissue_category)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.tissueCellLine")}>
              {displayValue(summary.tissue_or_cell_line)}
            </Descriptions.Item>
          </Descriptions>

          {/* Sub-panel C: Literature info */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
            {t("analysis.literatureInfo")}
          </Title>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 20 }}>
            <Descriptions.Item label={t("analysis.reference")} span={2}>
              {displayValue(summary.reference_title)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.publicationYear")}>
              {displayValue(summary.publication_year)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.publicationMonth")}>
              {displayValue(summary.publication_month)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.doi")} span={2}>
              {renderLink(summary.doi, externalLinks.doi)}
            </Descriptions.Item>
          </Descriptions>

          {/* Sub-panel C: Summary (only if has value) */}
          {summary.summary_text && (
            <>
              <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
                {t("analysis.summaryText")}
              </Title>
              <div style={{
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: 4,
                border: "1px solid #e6edf5",
                lineHeight: 1.8,
                fontSize: 14,
                marginBottom: 20,
                whiteSpace: "pre-wrap",
              }}>
                {summary.summary_text}
              </div>
            </>
          )}

          {/* Sub-panel D: PCA plot */}
          {pcaAsset && (
            <>
              <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
                {t("analysis.pcaPlot")}
              </Title>
              <PdfCard asset={pcaAsset} />
            </>
          )}
        </div>
      ),
    },
    {
      key: "differential",
      label: sectionLabels.differential,
      children: (
        <div id="section-differential">
          {/* Volcano plot */}
          {volcanoAsset && (
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#1d3e70', marginBottom: 12, marginTop: 0 }}>
                {t("analysis.volcanoPlot")}
              </Title>
              <PdfCard asset={volcanoAsset} />
            </div>
          )}

          {/* DEG Table */}
          <Title level={5} style={{ color: '#1d3e70', marginBottom: 12 }}>
            {t("analysis.degTable")}
          </Title>
          <DegTable analysisKey={analysisKey!} assets={assets} />
        </div>
      ),
    },
    {
      key: "enrichment",
      label: sectionLabels.enrichment,
      children: (
        <div id="section-enrichment">
          {/* Heatmap */}
          {heatmapAsset && (
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#1d3e70', marginBottom: 12, marginTop: 0 }}>
                {t("analysis.heatmap")}
              </Title>
              <PdfCard asset={heatmapAsset} />
            </div>
          )}

          {/* Enrichment pathway tabs */}
          {enrichmentAssets.length > 0 && (
            <div
              style={{
                marginBottom: 24,
                background: "#fff",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  padding: "16px 24px 0",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fafafa",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <Title level={5} style={{ margin: 0, paddingBottom: 12 }}>
                  {t("analysis.enrichmentAnalysis")}
                </Title>
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <Tabs
                  items={enrichmentAssets.map((item) => ({
                    key: item.key,
                    label: item.label,
                    children: (
                      <div style={{ textAlign: "center" }}>
                        <img
                          src={item.asset.preview_url}
                          alt={item.asset.display_name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: 600,
                            objectFit: "contain",
                          }}
                        />
                        <div style={{ marginTop: 12 }}>
                          <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() =>
                              downloadAsset(item.asset.asset_id)
                            }
                          >
                            {t("common.download")}
                          </Button>
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            </div>
          )}

          {plotDf && (
            <div style={{ marginTop: 16 }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadAsset(plotDf.asset_id)}
              >
                {t("analysis.downloadPlotDf")}
              </Button>
            </div>
          )}

          {!heatmapAsset && enrichmentAssets.length === 0 && (
            <Empty description={t("analysis.noResources")} />
          )}
        </div>
      ),
    },
    {
      key: "expression",
      label: sectionLabels.expression,
      children: (
        <div id="section-expression">
          <Empty
            description={t("analysis.expressionComingSoon")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/">{t("nav.home")}</Link> },
          { title: <Link to="/browse">{t("nav.browse")}</Link> },
          { title: detail.deseq_id },
        ]}
      />

      <Title level={4} style={{ marginBottom: 20, fontSize: isMobile ? 16 : undefined, wordBreak: "break-word" }}>
        {detail.deseq_id} — {summary.chemical_name}
      </Title>

      <Row gutter={24}>
        {/* Left sidebar navigation */}
        <Col xs={0} md={6} lg={5}>
          <div
            style={{
              position: "sticky",
              top: 140,
              background: "#ffffff",
              borderRadius: 4,
              border: "1px solid #c8d9ed",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              overflow: "hidden",
              maxHeight: "calc(100vh - 160px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ background: "#1d3e70", padding: "12px 16px", borderBottom: "2px solid #e8a735", flexShrink: 0 }}>
              <Text strong style={{ fontSize: 16, color: "#ffffff" }}>
                {detail.deseq_id}
              </Text>
            </div>

            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Button
                  onClick={() => setActiveKeys(allKeys)}
                  style={{ flex: 1, fontSize: 13 }}
                  size="small"
                >
                  {t("analysis.showAll")}
                </Button>
                <Button
                  onClick={() => setActiveKeys([])}
                  style={{ flex: 1, fontSize: 13 }}
                  size="small"
                >
                  {t("analysis.collapseAll")}
                </Button>
              </div>

              <div
                style={{
                  borderLeft: "2px solid #e8e8e8",
                }}
              >
                {allKeys.map((key) => {
                  const isCurrent = currentSection === key;
                  return (
                    <div
                      key={key}
                      onClick={() => scrollToSection(key)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: isCurrent ? "#1d3e70" : "#666",
                        fontWeight: isCurrent ? "bold" : 400,
                        marginLeft: -2,
                        borderLeft: isCurrent
                          ? "2px solid #e8a735"
                          : "2px solid transparent",
                        background: isCurrent ? "#f8f9fa" : "transparent",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.color = "#1d3e70";
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.color = "#666";
                      }}
                    >
                      {sectionLabels[key]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Col>

        {/* Main content */}
        <Col xs={24} md={18} lg={19}>
          <div ref={collapseRef}>
            <Collapse
              className="analysis-collapse"
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys as string[])}
              bordered={false}
              items={collapseItems.map(item => ({
                ...item,
                style: {
                  marginBottom: 16,
                  background: "#ffffff",
                  border: "1px solid #c8d9ed",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }
              }))}
              style={{ background: "transparent" }}
              expandIcon={({ isActive }) => (
                <div style={{ color: "#ffffff", fontSize: 12, marginTop: 4, transform: isActive ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                  {"\u25B6"}
                </div>
              )}
              styles={{
                header: {
                  background: "#1d3e70",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: 15,
                  padding: "10px 16px",
                  borderBottom: "2px solid #e8a735",
                  alignItems: "center",
                  borderRadius: 0,
                },
                body: {
                  padding: "16px",
                  background: "#ffffff"
                },
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Analysis;
