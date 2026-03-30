import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Card, Spin, Typography, Carousel } from "antd";
import {
  ExperimentOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  RightOutlined,
  LeftOutlined,
  ProjectOutlined,
  BarChartOutlined,
  LinkOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { SunburstChart, PieChart, BarChart as EBarChart } from "echarts/charts";
import { TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import SearchBox from "../../components/SearchBox";
import useIsMobile from "../../hooks/useIsMobile";
import { getStatsSummary, getPublicationYears, getOrganDistribution } from "../../api/stats";
import { buildPubYearOption, buildOrganPieOption } from "../../utils/chartOptions";
import type { StatsSummary, PublicationYearData, OrganDistributionData } from "../../types";
import ExternalLink from "../../components/ExternalLink";
import { MouseBodyMap, HumanBodyMap } from "../../components/BodyMap";
import bannerBg from "../../assets/banner.svg";

echarts.use([SunburstChart, PieChart, EBarChart, TooltipComponent, GridComponent, LegendComponent, LabelLayout, CanvasRenderer]);

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pubYears, setPubYears] = useState<PublicationYearData[]>([]);
  const [organDist, setOrganDist] = useState<OrganDistributionData[]>([]);
  const highlightCarouselRef = useRef<any>(null);
  const statsCarouselRef = useRef<any>(null);

  useEffect(() => {
    getStatsSummary()
      .then((res) => {
        if (res.code === 200 && res.data) setStats(res.data);
      })
      .finally(() => setLoading(false));
    getPublicationYears().then((res) => {
      if (res.code === 200 && res.data) setPubYears(res.data);
    });
    getOrganDistribution().then((res) => {
      if (res.code === 200 && res.data) setOrganDist(res.data);
    });
  }, []);

  const handleSearch = (keyword: string, category: string) => {
    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
    );
  };

  const handleExampleClick = (text: string) => {
    navigate(`/search?keyword=${encodeURIComponent(text)}&category=all`);
  };

  const pipelineSteps = [
    t("home.fastq"),
    t("home.qc"),
    t("home.deseq2"),
    t("home.enrichment"),
    t("home.database"),
  ];

  const isMobile = useIsMobile();

  const panelHeaderStyle: React.CSSProperties = {
    backgroundColor: '#1d3e70',
    color: '#ffffff',
    padding: '12px 20px',
    fontWeight: 'bold',
    fontSize: '17px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #e8a735',
  };

  const panelBodyStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #c8d9ed',
    borderTop: 'none',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: isMobile ? '16px' : '24px',
    height: 'calc(100% - 46px)',
  };

  // Highlights data
  const highlights = [
    {
      icon: <DatabaseOutlined style={{ fontSize: 36, color: '#1d3e70' }} />,
      title: t("home.highlightData"),
      desc: t("home.highlightDataDesc"),
    },
    {
      icon: <ClusterOutlined style={{ fontSize: 36, color: '#1d3e70' }} />,
      title: t("home.highlightTissue"),
      desc: t("home.highlightTissueDesc"),
    },
    {
      icon: <ProjectOutlined style={{ fontSize: 36, color: '#1d3e70' }} />,
      title: t("home.highlightPipeline"),
      desc: t("home.highlightPipelineDesc"),
    },
  ];

  const pubYearOption = buildPubYearOption(pubYears);
  const organPieOption = buildOrganPieOption(organDist, isMobile);

  return (
    <div style={{ paddingBottom: isMobile ? 20 : 40 }}>
      {/* Hero Banner */}
      <div
        style={{
          margin: "-16px -16px 0 -16px",
          backgroundImage: `linear-gradient(rgba(29, 62, 112, 0.85), rgba(42, 82, 152, 0.95)), url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: isMobile ? "40px 16px" : "60px 20px",
          textAlign: "center",
          color: "#ffffff",
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={1} style={{ color: "#ffffff", fontSize: isMobile ? 30 : 44, letterSpacing: 2, marginBottom: 12, marginTop: 0 }}>
          EDC-ToxDB
        </Title>
        <div style={{ fontSize: isMobile ? 15 : 19, color: "#e0e8f5", marginBottom: 16 }}>
          {t("common.subtitle")}
        </div>
        <Paragraph
          style={{
            maxWidth: 800,
            margin: isMobile ? "0 auto 20px" : "0 auto 30px",
            color: "#c8d9ed",
            fontSize: isMobile ? 14 : 16,
            lineHeight: 1.6,
            padding: isMobile ? "0 8px" : 0,
          }}
        >
          {t("home.description")}
        </Paragraph>

        {/* Search box */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            maxWidth: 900,
            margin: "0 auto",
            padding: isMobile ? "0 8px" : 0,
          }}
        >
          <div style={{ background: "#ffffff", padding: isMobile ? 6 : 8, borderRadius: 6, width: "100%", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>

        {/* Search examples */}
        <div style={{ marginTop: 12, fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.6)" }}>
          {t("home.searchExample")}{" "}
          {["Bisphenol A", "80-05-7", "DESEQ0001"].map((example, i) => (
            <React.Fragment key={example}>
              {i > 0 && <span>, </span>}
              <span
                onClick={() => handleExampleClick(example)}
                style={{ cursor: "pointer", textDecoration: "underline", color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              >
                {example}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 20px" }}>

        {/* Core stats */}
        <Spin spinning={loading}>
          <div style={{ marginBottom: isMobile ? 16 : 24, background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #c8d9ed' }}>
            <div style={panelHeaderStyle}>
              <DatabaseOutlined style={{ marginRight: 8, fontSize: 16 }} />
              {t("home.dataStats")}
            </div>
            <Row>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: '1px solid #e6edf5', borderBottom: isMobile ? '1px solid #e6edf5' : 'none' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 13 : 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.sampleRecords")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 22 : 30, fontWeight: 'bold' }}>{stats?.record_rows ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: isMobile ? 'none' : '1px solid #e6edf5', borderBottom: isMobile ? '1px solid #e6edf5' : 'none' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 13 : 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.analysisItems")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 22 : 30, fontWeight: 'bold' }}>{stats?.analysis_groups ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: '1px solid #e6edf5' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 13 : 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.chemicalTypes")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 22 : 30, fontWeight: 'bold' }}>{stats?.unique_chemicals ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 13 : 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.deseqCount")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 22 : 30, fontWeight: 'bold' }}>{stats?.unique_deseq_id ?? 0}</div>
              </Col>
            </Row>
          </div>
        </Spin>

        {/* Highlights horizontal carousel + Stats overview */}
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          {/* Highlights carousel */}
          <Col xs={24} md={12}>
            <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <ExperimentOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.highlights")}
              </div>
              <div style={{ ...panelBodyStyle, position: 'relative', display: 'flex', alignItems: 'center', padding: isMobile ? '16px 8px' : '24px 16px' }}>
                <div
                  onClick={() => highlightCarouselRef.current?.prev()}
                  style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2, color: '#1d3e70', fontSize: 20 }}
                >
                  <LeftOutlined />
                </div>
                <div style={{ width: '100%', padding: '0 24px' }}>
                  <Carousel ref={highlightCarouselRef} autoplay autoplaySpeed={4000} pauseOnHover dots={{ className: 'highlight-dots' }}>
                    {highlights.map((item, i) => (
                      <div key={i}>
                        <div style={{ textAlign: 'center', padding: isMobile ? '20px 12px' : '40px 24px' }}>
                          <div style={{ marginBottom: 20 }}>{item.icon}</div>
                          <div style={{ fontSize: isMobile ? 16 : 18, color: '#1d3e70', fontWeight: 'bold', marginBottom: 12, lineHeight: 1.4 }}>{item.title}</div>
                          <div style={{ fontSize: isMobile ? 13 : 15, color: '#666', lineHeight: 1.6 }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
                <div
                  onClick={() => highlightCarouselRef.current?.next()}
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2, color: '#1d3e70', fontSize: 20 }}
                >
                  <RightOutlined />
                </div>
              </div>
            </div>
          </Col>

          {/* Stats overview - sunburst */}
          <Col xs={24} md={12}>
            <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div
                style={{ ...panelHeaderStyle, cursor: 'pointer' }}
                onClick={() => navigate("/statistics")}
              >
                <BarChartOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.statsOverview")}
              </div>
              <div style={{ ...panelBodyStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: isMobile ? '16px 8px' : '24px 16px' }}>
                {stats ? (
                  <>
                    <div
                      onClick={() => statsCarouselRef.current?.prev()}
                      style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2, color: '#1d3e70', fontSize: 20 }}
                    >
                      <LeftOutlined />
                    </div>
                    <div style={{ width: '100%', padding: '0 24px' }}>
                      <Carousel ref={statsCarouselRef} autoplay autoplaySpeed={6000} pauseOnHover dots={{ className: 'highlight-dots' }}>
                        {/* Original sunburst */}
                        <div>
                          <ReactEChartsCore
                            echarts={echarts}
                            notMerge
                            option={{
                              tooltip: {
                                trigger: "item",
                                formatter: (params: { name: string }) => params.name,
                              },
                              series: [{
                                type: "sunburst",
                                center: ["50%", "50%"],
                                radius: ["15%", "75%"],
                                sort: undefined,
                                nodeClick: false,
                                emphasis: { focus: "ancestor" },
                                itemStyle: { borderWidth: 2, borderColor: "#ffffff" },
                                label: { fontSize: isMobile ? 11 : 13, color: "#333" },
                                levels: [
                                  {},
                                  { r0: "20%", r: "48%", label: { fontSize: isMobile ? 11 : 13, fontWeight: "bold", color: "#fff", rotate: "tangential" }, itemStyle: { borderWidth: 2 } },
                                  { r0: "48%", r: "72%", label: { fontSize: isMobile ? 9 : 11, rotate: "tangential", color: "#333" }, itemStyle: { borderWidth: 1 } },
                                ],
                                data: [
                                  {
                                    name: t("home.statsLiterature"),
                                    itemStyle: { color: "#3a7bd5" },
                                    children: [
                                      { name: `GSE (${stats.unique_gse_id})`, value: 50, itemStyle: { color: "#5b9bd5" } },
                                      { name: `BioProject (${stats.unique_bioproject_id})`, value: 50, itemStyle: { color: "#7fb3e0" } },
                                    ],
                                  },
                                  {
                                    name: t("home.statsDatasets"),
                                    itemStyle: { color: "#2b579a" },
                                    children: [
                                      { name: `DESEQ (${stats.unique_deseq_id})`, value: 100, itemStyle: { color: "#4a76b5" } },
                                    ],
                                  },
                                  {
                                    name: t("home.statsSamples"),
                                    itemStyle: { color: "#e8a735" },
                                    children: [
                                      { name: `SRR (${stats.unique_srr_id})`, value: 50, itemStyle: { color: "#f0c060" } },
                                      { name: `Records (${stats.record_rows})`, value: 50, itemStyle: { color: "#f5d590" } },
                                    ],
                                  },
                                  {
                                    name: t("home.statsChemicals"),
                                    itemStyle: { color: "#1d8348" },
                                    children: [
                                      { name: `${stats.unique_chemicals} Types`, value: 100, itemStyle: { color: "#28a760" } },
                                    ],
                                  },
                                ],
                              }],
                            }}
                            style={{ height: isMobile ? 280 : 360, width: '100%' }}
                          />
                        </div>

                        {/* Organ sunburst */}
                        {organPieOption && (
                          <div>
                            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#1d3e70', marginBottom: 4, paddingTop: 4 }}>
                              {t("home.organDistChart")}
                            </div>
                            <ReactEChartsCore
                              echarts={echarts}
                              notMerge
                              option={organPieOption}
                              style={{ height: isMobile ? 260 : 340, width: '100%' }}
                            />
                          </div>
                        )}

                        {/* Publication year bar chart */}
                        {pubYearOption && (
                          <div>
                            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#1d3e70', marginBottom: 4, paddingTop: 4 }}>
                              {t("home.publicationYearChart")}
                            </div>
                            <ReactEChartsCore
                              echarts={echarts}
                              notMerge
                              option={pubYearOption}
                              style={{ height: isMobile ? 260 : 340, width: '100%' }}
                            />
                          </div>
                        )}

                        {/* Mouse Body Map */}
                        <div>
                          <div style={{ height: isMobile ? 320 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                            <MouseBodyMap isMobile={isMobile} />
                          </div>
                        </div>

                        {/* Human Body Map */}
                        <div>
                          <div style={{ height: isMobile ? 320 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                            <HumanBodyMap isMobile={isMobile} />
                          </div>
                        </div>
                      </Carousel>
                    </div>
                    <div
                      onClick={() => statsCarouselRef.current?.next()}
                      style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2, color: '#1d3e70', fontSize: 20 }}
                    >
                      <RightOutlined />
                    </div>
                  </>
                ) : (
                  <Spin />
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={isMobile ? [16, 16] : [24, 24]}>
          {/* Pipeline */}
          <Col xs={24} md={16}>
             <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <ShareAltOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.pipeline")}
              </div>
              <div style={panelBodyStyle}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                    gap: isMobile ? 8 : 0,
                    padding: isMobile ? "0" : "20px 0"
                  }}
                >
                  {pipelineSteps.map((step, i, arr) => (
                    <React.Fragment key={step}>
                      <div
                        style={{
                          flex: isMobile ? undefined : 1,
                          width: isMobile ? "100%" : undefined,
                          textAlign: "center",
                          background: "#f8f9fa",
                          border: "1px solid #c8d9ed",
                          color: "#1d3e70",
                          padding: isMobile ? "12px 8px" : "16px 8px",
                          fontWeight: "bold",
                          borderRadius: 4,
                          minWidth: isMobile ? undefined : 110,
                          fontSize: isMobile ? 14 : 15,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        }}
                      >
                        {step}
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ padding: isMobile ? "4px 0" : "0 12px", color: "#e8a735", fontSize: 20, transform: isMobile ? "rotate(90deg)" : undefined }}>
                          <RightOutlined />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* External resources */}
          <Col xs={24} md={8}>
             <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <LinkOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.externalResources")}
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", justifyContent: "center" }}>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/geo/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 16, transition: 'all 0.2s' }}>
                      {t("home.geo")} (GEO)
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://pubchem.ncbi.nlm.nih.gov/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 16, transition: 'all 0.2s' }}>
                      PubChem Compound
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/bioproject/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 16, transition: 'all 0.2s' }}>
                      NCBI BioProject
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/sra">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 16, transition: 'all 0.2s' }}>
                      Sequence Read Archive (SRA)
                    </div>
                  </ExternalLink>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats images if any */}
        {stats?.statistics_assets && stats.statistics_assets.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={panelHeaderStyle}>
               <BarChartOutlined style={{ marginRight: 8, fontSize: 18 }} />
              {t("home.dataStats")} - {t("statistics.title")}
            </div>
            <div style={{ ...panelBodyStyle, padding: isMobile ? '16px' : '32px' }}>
              <Row gutter={[32, 32]}>
                {stats.statistics_assets.map((asset) => (
                  <Col xs={24} md={12} key={asset.name}>
                    <Card
                      title={<span style={{ fontSize: 16, color: '#1d3e70' }}>{asset.title}</span>}
                      size="small"
                      styles={{ header: { backgroundColor: "#f8f9fa", borderBottom: '1px solid #e6edf5', fontWeight: "bold", padding: "12px 16px" }, body: { padding: 16, border: '1px solid #e6edf5', borderTop: 'none' } }}
                      style={{ boxShadow: 'none' }}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        style={{ width: "100%", borderRadius: 4 }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
