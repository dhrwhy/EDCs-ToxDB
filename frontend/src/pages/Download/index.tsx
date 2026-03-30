import React from "react";
import { Card, Button, Typography } from "antd";
import { DownloadOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { downloadDatabase } from "../../api/download";

const { Title, Paragraph } = Typography;

const Download: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <Title level={4} style={{ color: "#1d3e70", borderBottom: "2px solid #e8a735", paddingBottom: 8, marginBottom: 24 }}>
        {t("download.title")}
      </Title>
      <Card style={{ border: "1px solid #c8d9ed", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderRadius: 4 }}>
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <DatabaseOutlined style={{ fontSize: 48, color: "#1d3e70", marginBottom: 16 }} />
          <Title level={4}>{t("download.fullDb")}</Title>
          <Paragraph type="secondary">
            {t("download.fullDbDesc")}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={downloadDatabase}
          >
            {t("download.downloadBtn")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Download;
