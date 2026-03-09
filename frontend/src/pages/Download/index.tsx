import React from "react";
import { Card, Button, Typography } from "antd";
import { DownloadOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { downloadDatabase } from "../../api/download";

const { Title, Paragraph } = Typography;

const Download: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", paddingTop: 32 }}>
      <Title level={3}>{t("download.title")}</Title>
      <Card>
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <DatabaseOutlined style={{ fontSize: 48, color: "#1677ff", marginBottom: 16 }} />
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
