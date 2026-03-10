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
import { DownloadOutlined } from "@ant-design/icons";
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

const { Title, Text } = Typography;

const allKeys = ["basic", "sequencing", "tissue", "literature", "mesh", "samples", "charts", "deg"];

const Analysis: React.FC = () => {
  const { analysisKey } = useParams<{ analysisKey: string }>();
  const { t } = useTranslation();
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(allKeys);
  const collapseRef = useRef<HTMLDivElement>(null);

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

  const standaloneCategories = ["pca_plot", "volcano_plot", "heatmap"];
  const standaloneAssets = standaloneCategories
    .map((cat) => assets.find((a) => a.asset_category === cat))
    .filter(Boolean) as AssetItem[];

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

  const renderLink = (
    val: string | null,
    builder: (v: string) => string
  ) => {
    if (!val) return "—";
    return <ExternalLink href={builder(val)}>{val}</ExternalLink>;
  };

  const sectionLabels: Record<string, string> = {
    basic: t("analysis.basicInfo"),
    sequencing: t("analysis.sequencingInfo"),
    tissue: t("analysis.tissueClassification"),
    literature: t("analysis.literatureInfo"),
    mesh: t("analysis.meshClassification"),
    samples: t("analysis.sampleRecords"),
    charts: t("analysis.chartResources"),
    deg: t("analysis.degTable"),
  };

  const scrollToSection = (key: string) => {
    // Ensure section is expanded first
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
      key: "basic",
      label: sectionLabels.basic,
      children: (
        <div id="section-basic">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t("analysis.chemicalName")}>
              {summary.chemical_name}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.casId")}>
              {summary.cas_id}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.inchiKey")}>
              {summary.inchi_key}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.pubchemCid")}>
              {renderLink(summary.pubchem_cid, externalLinks.pubchem)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.pubchemName")}>
              {summary.pubchem_name}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.deseqId")}>
              {detail.deseq_id}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.dataSource")}>
              {summary.from_group}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.evidenceLevel")}>
              {summary.evidence}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "sequencing",
      label: sectionLabels.sequencing,
      children: (
        <div id="section-sequencing">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t("analysis.gseId")}>
              {renderLink(summary.gse_id, externalLinks.geo)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.bioproject")}>
              {renderLink(summary.bioproject_id, externalLinks.bioproject)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.organism")}>
              {summary.organism}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.platform")}>
              {summary.platform}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "tissue",
      label: sectionLabels.tissue,
      children: (
        <div id="section-tissue">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t("analysis.tissueCategory")}>
              {summary.tissue_category}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.tissueSubcategory")}>
              {displayValue(summary.tissue_subcategory)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.reproductiveSubcategory")}>
              {displayValue(summary.reproductive_subcategory)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.tissueCellLine")}>
              {summary.tissue_or_cell_line}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.exposureToxicant")}>
              {displayValue(summary.exposure_toxicant)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "literature",
      label: sectionLabels.literature,
      children: (
        <div id="section-literature">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={t("analysis.libraryMethod")}>
              {displayValue(summary.library_method)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.libraryMethodDetail")}>
              {displayValue(summary.library_method_detail)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.publicationYear")}>
              {displayValue(summary.publication_year)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.publicationMonth")}>
              {displayValue(summary.publication_month)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.reference")} span={2}>
              {displayValue(summary.reference_title)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.doi")} span={3}>
              {renderLink(summary.doi, externalLinks.doi)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "mesh",
      label: sectionLabels.mesh,
      children: (
        <div id="section-mesh">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Class1">
              {displayValue(summary.class1_code)}
            </Descriptions.Item>
            <Descriptions.Item label="Class2">
              {displayValue(summary.class2_code)}
            </Descriptions.Item>
            <Descriptions.Item label="Class3">
              {displayValue(summary.class3_name)}
            </Descriptions.Item>
            <Descriptions.Item label="Class4">
              {displayValue(summary.class4_name)}
            </Descriptions.Item>
            <Descriptions.Item label="Class5">
              {displayValue(summary.class5_name)}
            </Descriptions.Item>
            <Descriptions.Item label="Class6">
              {displayValue(summary.class6_name)}
            </Descriptions.Item>
            <Descriptions.Item label="Class7">
              {displayValue(summary.class7_name)}
            </Descriptions.Item>
            <Descriptions.Item label={t("analysis.inferredClass")}>
              {displayValue(summary.inferred_class)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "samples",
      label: sectionLabels.samples,
      children: (
        <div id="section-samples">
          <Table
            rowKey="srr_id"
            dataSource={sample_records}
            bordered
            pagination={
              sample_records.length > 30
                ? { pageSize: 30, showTotal: (total: number) => t("common.total", { count: total }) }
                : false
            }
            scroll={{ x: "max-content" }}
            columns={[
              {
                title: t("analysis.srrId"),
                dataIndex: "srr_id",
                render: (v: string) => (
                  <ExternalLink href={externalLinks.sra(v)}>{v}</ExternalLink>
                ),
              },
              {
                title: t("analysis.treatment"),
                dataIndex: "treatment",
                render: (v: string | null) => displayValue(v),
              },
              {
                title: t("analysis.experimentGroup"),
                dataIndex: "experiment_group",
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
              { title: "AvgSpotLen", dataIndex: "avg_spot_len" },
              {
                title: t("analysis.cellType"),
                dataIndex: "cell_type",
                render: (v: string | null) => displayValue(v),
              },
              { title: t("analysis.libraryLayout"), dataIndex: "library_layout" },
            ]}
          />
        </div>
      ),
    },
    {
      key: "charts",
      label: sectionLabels.charts,
      children: (
        <div id="section-charts">
          {assets.length === 0 ? (
            <Empty description={t("analysis.noResources")} />
          ) : (
            <>
              {standaloneAssets.map((asset) => (
                <div key={asset.asset_id} style={{ marginBottom: 24 }}>
                  <PdfCard asset={asset} />
                </div>
              ))}

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
            </>
          )}
        </div>
      ),
    },
    {
      key: "deg",
      label: sectionLabels.deg,
      children: (
        <div id="section-deg">
          <DegTable analysisKey={analysisKey!} assets={assets} />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/">{t("nav.home")}</Link> },
          { title: <Link to="/browse">{t("nav.browse")}</Link> },
          { title: detail.deseq_id },
        ]}
      />

      <Title level={4} style={{ marginBottom: 16, fontSize: window.innerWidth < 768 ? 16 : undefined, wordBreak: "break-word" }}>
        {detail.deseq_id} — {summary.chemical_name}
      </Title>

      <Row gutter={24}>
        {/* Left sidebar navigation */}
        <Col xs={0} md={5} lg={4}>
          <div
            style={{
              position: "sticky",
              top: 80,
              background: "#fafafa",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 18, color: "#1677ff" }}>
                {detail.deseq_id}
              </Text>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <Button
                onClick={() => setActiveKeys(allKeys)}
                style={{ flex: 1, fontSize: 14 }}
              >
                {t("analysis.showAll")}
              </Button>
              <Button
                onClick={() => setActiveKeys([])}
                style={{ flex: 1, fontSize: 14 }}
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
                const isActive = activeKeys.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => scrollToSection(key)}
                    style={{
                      padding: "7px 12px",
                      cursor: "pointer",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: isActive ? "#1677ff" : "#666",
                      fontWeight: isActive ? 500 : 400,
                      marginLeft: -2,
                      borderLeft: isActive
                        ? "2px solid #1677ff"
                        : "2px solid transparent",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "#1677ff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = "#666";
                    }}
                  >
                    {sectionLabels[key]}
                  </div>
                );
              })}
            </div>
          </div>
        </Col>

        {/* Main content */}
        <Col xs={24} md={19} lg={20}>
          <div ref={collapseRef}>
            <Collapse
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys as string[])}
              items={collapseItems}
              style={{ background: "transparent" }}
              styles={{
                header: {
                  background: "#f0f0f0",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 4,
                },
                body: {
                  padding: "16px 0",
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
