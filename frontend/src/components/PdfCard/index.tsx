import React from "react";
import { Card, Button, Typography } from "antd";
import {
  DownloadOutlined,
  FileExclamationOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { AssetItem } from "../../types";
import { downloadAsset } from "../../api/download";

const { Text } = Typography;

interface Props {
  asset: AssetItem;
}

const PdfCard: React.FC<Props> = ({ asset }) => {
  const { t } = useTranslation();

  if (asset.status === "missing") {
    return (
      <Card title={asset.display_name} style={{ height: "100%" }}>
        <div
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            borderRadius: 4,
          }}
        >
          <Text type="secondary">
            <FileExclamationOutlined style={{ marginRight: 8 }} />
            {t("asset.fileMissing")}
          </Text>
        </div>
      </Card>
    );
  }

  if (asset.status === "pending") {
    return (
      <Card title={asset.display_name} style={{ height: "100%" }}>
        <div
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa",
            borderRadius: 4,
          }}
        >
          <Text type="secondary">
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {t("asset.pending")}
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={asset.display_name}
      style={{ height: "100%" }}
      actions={[
        <Button
          key="download"
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => downloadAsset(asset.asset_id)}
        >
          {t("common.download")}
        </Button>,
      ]}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
        }}
      >
        <img
          src={asset.preview_url}
          alt={asset.display_name}
          style={{
            maxWidth: "100%",
            maxHeight: 400,
            objectFit: "contain",
          }}
        />
      </div>
    </Card>
  );
};

export default PdfCard;
