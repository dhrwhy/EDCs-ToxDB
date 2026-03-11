import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Typography } from "antd";
import {
  ExperimentOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  RightOutlined,
  BuildOutlined,
  ProjectOutlined,
  BarChartOutlined,
  LinkOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { SunburstChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import SearchBox from "../../components/SearchBox";
import { getStatsSummary } from "../../api/stats";
import type { StatsSummary } from "../../types";
import ExternalLink from "../../components/ExternalLink";
import bannerBg from "../../assets/banner.svg";

echarts.use([SunburstChart, TooltipComponent, CanvasRenderer]);

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getStatsSummary()
      .then((res) => {
        if (res.code === 200 && res.data) setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (keyword: string, category: string) => {
    navigate(
      `/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
    );
  };

  const pipelineSteps = [
    t("home.fastq"),
    t("home.qc"),
    t("home.deseq2"),
    t("home.enrichment"),
    t("home.database"),
  ];

  const isMobile = window.innerWidth < 768;

  // 科学数据库风格面板样式
  const panelHeaderStyle: React.CSSProperties = {
    backgroundColor: '#1d3e70',
    color: '#ffffff',
    padding: '12px 20px',
    fontWeight: 'bold',
    fontSize: '16px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #e8a735', // 加入一点金色强调色，类似传统科研数据库的配色
  };

  const panelBodyStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #c8d9ed',
    borderTop: 'none',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: isMobile ? '16px' : '24px',
    height: 'calc(100% - 46px)', // 减去header的高度
  };

  return (
    <div style={{ paddingBottom: isMobile ? 20 : 40 }}>
      {/* Hero Banner 区域 */}
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
        <Title level={1} style={{ color: "#ffffff", fontSize: isMobile ? 28 : 40, letterSpacing: 2, marginBottom: 12, marginTop: 0 }}>
          MouseToxDB
        </Title>
        <div style={{ fontSize: isMobile ? 14 : 18, color: "#e0e8f5", marginBottom: 16 }}>
          {t("common.subtitle")}
        </div>
        <Paragraph
          style={{
            maxWidth: 800,
            margin: isMobile ? "0 auto 20px" : "0 auto 30px",
            color: "#c8d9ed",
            fontSize: isMobile ? 13 : 15,
            lineHeight: 1.6,
            padding: isMobile ? "0 8px" : 0,
          }}
        >
          {t("home.description")}
        </Paragraph>

        {/* 居中大搜索框 */}
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
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 20px" }}>
        
        {/* 核心数据指标 - 科学表格风格 */}
        <Spin spinning={loading}>
          <div style={{ marginBottom: isMobile ? 16 : 24, background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #c8d9ed' }}>
            <div style={panelHeaderStyle}>
              <DatabaseOutlined style={{ marginRight: 8, fontSize: 16 }} />
              {t("home.dataStats")}
            </div>
            <Row>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: '1px solid #e6edf5', borderBottom: isMobile ? '1px solid #e6edf5' : 'none' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 12 : 13, marginBottom: 4, fontWeight: 'bold' }}>{t("home.sampleRecords")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 20 : 28, fontWeight: 'bold' }}>{stats?.record_rows ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: isMobile ? 'none' : '1px solid #e6edf5', borderBottom: isMobile ? '1px solid #e6edf5' : 'none' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 12 : 13, marginBottom: 4, fontWeight: 'bold' }}>{t("home.analysisItems")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 20 : 28, fontWeight: 'bold' }}>{stats?.analysis_groups ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center', borderRight: '1px solid #e6edf5' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 12 : 13, marginBottom: 4, fontWeight: 'bold' }}>{t("home.chemicalTypes")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 20 : 28, fontWeight: 'bold' }}>{stats?.unique_chemicals ?? 0}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: isMobile ? 12 : 13, marginBottom: 4, fontWeight: 'bold' }}>{t("home.deseqCount")}</div>
                <div style={{ color: '#1d3e70', fontSize: isMobile ? 20 : 28, fontWeight: 'bold' }}>{stats?.unique_deseq_id ?? 0}</div>
              </Col>
            </Row>
          </div>
        </Spin>

        {/* 亮点 + 统计总览 */}
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          {/* 左侧：亮点 (网格入口风格) */}
          <Col xs={24} md={12}>
            <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <BuildOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.highlights")}
              </div>
              <div style={panelBodyStyle}>
                <Row gutter={isMobile ? [12, 12] : [16, 16]} style={{ height: '100%' }}>
                  {[
                    { text: t("home.highlightData"), icon: <DatabaseOutlined style={{ fontSize: 32, color: '#1d3e70' }} /> },
                    { text: t("home.highlightTissue"), icon: <ClusterOutlined style={{ fontSize: 32, color: '#1d3e70' }} /> },
                    { text: t("home.highlightOmics"), icon: <ExperimentOutlined style={{ fontSize: 32, color: '#1d3e70' }} /> },
                    { text: t("home.highlightPipeline"), icon: <ProjectOutlined style={{ fontSize: 32, color: '#1d3e70' }} /> },
                  ].map((item, i) => (
                    <Col xs={12} key={i}>
                      <Card 
                        hoverable 
                        bodyStyle={{ padding: isMobile ? '16px 8px' : '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                        style={{ height: '100%', borderColor: '#e6edf5', backgroundColor: '#f8f9fa' }}
                      >
                        <div style={{ marginBottom: 16 }}>{item.icon}</div>
                        <div style={{ fontSize: isMobile ? 13 : 15, color: '#333', fontWeight: 'bold', lineHeight: 1.4 }}>{item.text}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Col>

          {/* 右侧：统计总览旭日图 (内嵌在科学面板中) */}
          <Col xs={24} md={12}>
             <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <BarChartOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.statsOverview")}
              </div>
              <div style={{ ...panelBodyStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stats ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    <ReactEChartsCore
                      echarts={echarts}
                      option={{
                        tooltip: {
                          trigger: "item",
                          formatter: (params: { name: string }) => params.name,
                        },
                        series: [
                          {
                            type: "sunburst",
                            center: ["50%", "50%"],
                            radius: ["15%", "75%"],
                            sort: undefined,
                            nodeClick: false,
                            emphasis: { focus: "ancestor" },
                            itemStyle: { borderWidth: 2, borderColor: "#ffffff" },
                            label: {
                              fontSize: isMobile ? 11 : 13,
                              color: "#333",
                            },
                            levels: [
                              {},
                              {
                                r0: "20%",
                                r: "48%",
                                label: { fontSize: isMobile ? 11 : 13, fontWeight: "bold", color: "#fff", rotate: "tangential" },
                                itemStyle: { borderWidth: 2 },
                              },
                              {
                                r0: "48%",
                                r: "72%",
                                label: { fontSize: isMobile ? 9 : 11, rotate: "tangential", color: "#333" },
                                itemStyle: { borderWidth: 1 },
                              },
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
                          },
                        ],
                      }}
                      style={{ height: isMobile ? 280 : 360, width: '100%' }}
                      onEvents={{
                        click: () => {
                          navigate("/browse");
                        },
                      }}
                    />
                  </div>
                ) : (
                  <Spin />
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={isMobile ? [16, 16] : [24, 24]}>
          {/* 左侧：分析流程 */}
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
                          fontSize: isMobile ? 13 : 14,
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

          {/* 右侧：外部链接与资源 */}
          <Col xs={24} md={8}>
             <div style={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
              <div style={panelHeaderStyle}>
                <LinkOutlined style={{ marginRight: 8, fontSize: 18 }} />
                {t("home.externalResources")}
              </div>
              <div style={panelBodyStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", justifyContent: "center" }}>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/geo/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 15, transition: 'all 0.2s' }}>
                      {t("home.geo")} (GEO)
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://pubchem.ncbi.nlm.nih.gov/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 15, transition: 'all 0.2s' }}>
                      PubChem Compound
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/bioproject/">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 15, transition: 'all 0.2s' }}>
                      NCBI BioProject
                    </div>
                  </ExternalLink>
                  <ExternalLink href="https://www.ncbi.nlm.nih.gov/sra">
                    <div style={{ padding: '12px 16px', border: '1px solid #e6edf5', borderRadius: 4, background: '#f8f9fa', color: '#2b579a', fontWeight: 'bold', fontSize: 15, transition: 'all 0.2s' }}>
                      Sequence Read Archive (SRA)
                    </div>
                  </ExternalLink>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* 统计图区（如果有的话） */}
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
                      headStyle={{ backgroundColor: "#f8f9fa", borderBottom: '1px solid #e6edf5', fontWeight: "bold", padding: "12px 16px" }}
                      bodyStyle={{ padding: 16, border: '1px solid #e6edf5', borderTop: 'none' }}
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
