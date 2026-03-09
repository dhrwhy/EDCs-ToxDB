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
    <div>
      <Title level={3}>{t("statistics.title")}</Title>
      <Spin spinning={loading}>
        {assets.length === 0 && !loading ? (
          <Empty description={t("statistics.noCharts")} />
        ) : (
          <Row gutter={[24, 24]}>
            {assets.map((asset) => (
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
        )}
      </Spin>
    </div>
  );
};

export default Statistics;
