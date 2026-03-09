import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Spin } from "antd";
import {
  ExperimentOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  FileSearchOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBox from "../../components/SearchBox";
import { getStatsSummary } from "../../api/stats";
import type { StatsSummary } from "../../types";
import ExternalLink from "../../components/ExternalLink";
import bannerBg from "../../assets/banner.svg";

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

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Banner 区域 (带有网络背景图和深蓝遮罩) */}
      <div
        style={{
          margin: "-16px -16px 0 -16px",
          backgroundImage: `linear-gradient(rgba(29, 62, 112, 0.8), rgba(42, 82, 152, 0.9)), url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "100px 20px 130px",
          textAlign: "center",
          color: "#ffffff",
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={1} style={{ color: "#ffffff", fontSize: 48, letterSpacing: 2, marginBottom: 12, marginTop: 0 }}>
          MouseToxDB
        </Title>
        <div style={{ fontSize: 20, color: "#e0e8f5", marginBottom: 20 }}>
          {t("common.subtitle")}
        </div>
        <Paragraph
          style={{
            maxWidth: 800,
            margin: "0 auto 40px",
            color: "#c8d9ed",
            fontSize: 16,
            lineHeight: 1.6,
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
          }}
        >
          <div style={{ background: "#ffffff", padding: 10, borderRadius: 6, width: "100%", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* 悬浮数据统计卡片 (负 margin 向上覆盖在 Banner 底部) */}
      <div style={{ maxWidth: 1400, margin: "-55px auto 50px", position: "relative", zIndex: 10, padding: "0 20px" }}>
        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            <Col xs={12} sm={6}>
              <Card
                hoverable
                style={{ textAlign: "center", borderTop: "5px solid #1d3e70", borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                bodyStyle={{ padding: "24px 16px" }}
              >
                <Statistic
                  title={<span style={{ color: "#666", fontWeight: "bold", fontSize: 15 }}>{t("home.sampleRecords")}</span>}
                  value={stats?.record_rows ?? 0}
                  prefix={<DatabaseOutlined style={{ color: "#2b579a", marginRight: 10 }} />}
                  valueStyle={{ color: "#1d3e70", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                hoverable
                style={{ textAlign: "center", borderTop: "5px solid #1d3e70", borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                bodyStyle={{ padding: "24px 16px" }}
              >
                <Statistic
                  title={<span style={{ color: "#666", fontWeight: "bold", fontSize: 15 }}>{t("home.analysisItems")}</span>}
                  value={stats?.analysis_groups ?? 0}
                  prefix={<FileSearchOutlined style={{ color: "#2b579a", marginRight: 10 }} />}
                  valueStyle={{ color: "#1d3e70", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                hoverable
                style={{ textAlign: "center", borderTop: "5px solid #1d3e70", borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                bodyStyle={{ padding: "24px 16px" }}
              >
                <Statistic
                  title={<span style={{ color: "#666", fontWeight: "bold", fontSize: 15 }}>{t("home.chemicalTypes")}</span>}
                  value={stats?.unique_chemicals ?? 0}
                  prefix={<ExperimentOutlined style={{ color: "#2b579a", marginRight: 10 }} />}
                  valueStyle={{ color: "#1d3e70", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card
                hoverable
                style={{ textAlign: "center", borderTop: "5px solid #1d3e70", borderRadius: 6, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                bodyStyle={{ padding: "24px 16px" }}
              >
                <Statistic
                  title={<span style={{ color: "#666", fontWeight: "bold", fontSize: 15 }}>{t("home.deseqCount")}</span>}
                  value={stats?.unique_deseq_id ?? 0}
                  prefix={<ClusterOutlined style={{ color: "#2b579a", marginRight: 10 }} />}
                  valueStyle={{ color: "#1d3e70", fontSize: 32, fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
        <Row gutter={[40, 40]}>
          {/* 左侧：分析流程 */}
          <Col xs={24} md={16}>
            <div style={{ background: "#f8f9fa", border: "1px solid #e6edf5", borderRadius: 6, padding: "24px 32px", height: "100%" }}>
              <Title level={4} style={{ color: "#1d3e70", borderBottom: "3px solid #2b579a", paddingBottom: 10, display: "inline-block", marginTop: 0, fontSize: 20 }}>
                {t("home.pipeline")}
              </Title>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 32,
                  flexWrap: "nowrap",
                  overflowX: "auto"
                }}
              >
                {pipelineSteps.map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        background: "#ffffff",
                        border: "2px solid #2b579a",
                        color: "#1d3e70",
                        padding: "14px 8px",
                        fontWeight: "bold",
                        borderRadius: 4,
                        minWidth: 120,
                        fontSize: 15,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      }}
                    >
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ padding: "0 12px", color: "#2b579a", fontSize: 18 }}>
                        <RightOutlined />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Col>

          {/* 右侧：外部链接与资源 */}
          <Col xs={24} md={8}>
            <div style={{ background: "#f8f9fa", border: "1px solid #e6edf5", borderRadius: 6, padding: "24px 32px", height: "100%" }}>
              <Title level={4} style={{ color: "#1d3e70", borderBottom: "3px solid #2b579a", paddingBottom: 10, display: "inline-block", marginTop: 0, fontSize: 20 }}>
                {t("home.externalResources")}
              </Title>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                <ExternalLink href="https://www.ncbi.nlm.nih.gov/geo/">
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>{t("home.geo")} (GEO)</span>
                </ExternalLink>
                <ExternalLink href="https://pubchem.ncbi.nlm.nih.gov/">
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>PubChem Compound</span>
                </ExternalLink>
                <ExternalLink href="https://www.ncbi.nlm.nih.gov/bioproject/">
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>NCBI BioProject</span>
                </ExternalLink>
                <ExternalLink href="https://www.ncbi.nlm.nih.gov/sra">
                  <span style={{ fontSize: 16, fontWeight: "bold" }}>Sequence Read Archive (SRA)</span>
                </ExternalLink>
              </div>
            </div>
          </Col>
        </Row>

        {/* 统计图区（如果有的话） */}
        {stats?.statistics_assets && stats.statistics_assets.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <Title level={4} style={{ color: "#1d3e70", borderBottom: "3px solid #2b579a", paddingBottom: 10, display: "inline-block", fontSize: 20 }}>
              {t("home.dataStats")}
            </Title>
            <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
              {stats.statistics_assets.map((asset) => (
                <Col xs={24} md={12} key={asset.name}>
                  <Card 
                    title={<span style={{ fontSize: 16 }}>{asset.title}</span>}
                    size="small" 
                    headStyle={{ backgroundColor: "#e6edf5", color: "#1d3e70", fontWeight: "bold", padding: "12px 16px" }}
                    bodyStyle={{ padding: 16 }}
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
        )}
      </div>
    </div>
  );
};

export default Home;