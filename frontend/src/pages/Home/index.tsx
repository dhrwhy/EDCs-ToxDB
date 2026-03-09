import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Space, Spin } from "antd";
import {
  ExperimentOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBox from "../../components/SearchBox";
import { getStatsSummary } from "../../api/stats";
import type { StatsSummary } from "../../types";
import ExternalLink from "../../components/ExternalLink";

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
    <div>
      {/* Hero 区域 */}
      <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
        <Title level={1} style={{ color: "#1677ff", marginBottom: 8 }}>
          MouseToxDB
        </Title>
        <Title level={4} style={{ fontWeight: 400, color: "#666", marginTop: 0 }}>
          {t("common.subtitle")}
        </Title>
        <Paragraph style={{ maxWidth: 600, margin: "16px auto", color: "#888" }}>
          {t("home.description")}
        </Paragraph>
      </div>

      {/* 搜索区 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 48,
        }}
      >
        <SearchBox onSearch={handleSearch} />
      </div>

      {/* 数据摘要卡片 */}
      <Spin spinning={loading}>
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title={t("home.sampleRecords")}
                value={stats?.record_rows ?? 0}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title={t("home.analysisItems")}
                value={stats?.analysis_groups ?? 0}
                prefix={<FileSearchOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title={t("home.chemicalTypes")}
                value={stats?.unique_chemicals ?? 0}
                prefix={<ExperimentOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title={t("home.deseqCount")}
                value={stats?.unique_deseq_id ?? 0}
                prefix={<ClusterOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 统计图区 */}
      {stats?.statistics_assets && stats.statistics_assets.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <Title level={4}>{t("home.dataStats")}</Title>
          <Row gutter={[24, 24]}>
            {stats.statistics_assets.map((asset) => (
              <Col xs={24} md={12} key={asset.name}>
                <Card title={asset.title}>
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

      {/* 分析流程图区 */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <Title level={4}>{t("home.pipeline")}</Title>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              padding: "24px 0",
              fontSize: 15,
            }}
          >
            {pipelineSteps.map((step, i, arr) => (
              <React.Fragment key={step}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    minWidth: 140,
                    borderColor: "#1677ff",
                  }}
                >
                  {step}
                </Card>
                {i < arr.length - 1 && (
                  <span style={{ fontSize: 20, color: "#1677ff" }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>

      {/* 外部链接区 */}
      <div style={{ textAlign: "center" }}>
        <Title level={4}>{t("home.externalResources")}</Title>
        <Space size="large" wrap>
          <ExternalLink href="https://www.ncbi.nlm.nih.gov/geo/">
            {t("home.geo")}
          </ExternalLink>
          <ExternalLink href="https://pubchem.ncbi.nlm.nih.gov/">
            PubChem
          </ExternalLink>
          <ExternalLink href="https://www.ncbi.nlm.nih.gov/bioproject/">
            BioProject
          </ExternalLink>
          <ExternalLink href="https://www.ncbi.nlm.nih.gov/sra">
            SRA
          </ExternalLink>
        </Space>
      </div>
    </div>
  );
};

export default Home;
