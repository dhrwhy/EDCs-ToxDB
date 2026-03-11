import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, Spin, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { getStatsSummary } from "../../api/stats";
import type { StatisticsAsset } from "../../types";

const { Title } = Typography;

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<StatisticsAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatsSummary()
      .then((res) => {
        if (res.code === 200 && res.data) {
          setAssets(res.data.statistics_assets ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <Title level={4} style={{ color: "#1d3e70", borderBottom: "2px solid #e8a735", paddingBottom: 8, marginBottom: 24 }}>
        {t("statistics.title")}
      </Title>
      <Spin spinning={loading}>
        {assets.length === 0 && !loading ? (
          <Empty description={t("statistics.noCharts")} />
        ) : (
          <Row gutter={[24, 24]}>
            {assets.map((asset) => (
              <Col xs={24} md={12} key={asset.name}>
                <Card 
                  title={<span style={{ color: "#1d3e70", fontSize: 16 }}>{asset.title}</span>}
                  headStyle={{ background: "#f8f9fa", borderBottom: "1px solid #e6edf5" }}
                  style={{ border: "1px solid #c8d9ed", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: 4 }}
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
        )}
      </Spin>
    </div>
  );
};

export default Statistics;
