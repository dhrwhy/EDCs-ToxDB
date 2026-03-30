import React, { useEffect, useState } from "react";
import { Table, Typography, Button, Alert } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { DegTableData, AssetItem } from "../../types";
import { getDegTable } from "../../api/analysis";
import { downloadAsset } from "../../api/download";

const { Text } = Typography;

interface Props {
  analysisKey: string;
  assets: AssetItem[];
}

const DegTable: React.FC<Props> = ({ analysisKey, assets }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<DegTableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const degAsset = assets.find((a) => a.asset_category === "deg_table");

  useEffect(() => {
    setPage(1);
  }, [analysisKey]);

  useEffect(() => {
    setLoading(true);
    getDegTable(analysisKey, page, 30)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setData(res.data);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [analysisKey, page]);

  if (data?.error) {
    return (
      <div>
        <Alert
          message={t("deg.parseFailed")}
          description={data.error}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        {degAsset && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadAsset(degAsset.asset_id)}
          >
            {t("deg.downloadRaw")}
          </Button>
        )}
      </div>
    );
  }

  if (!loading && data && data.total === 0) {
    return <Text type="secondary">{t("deg.noData")}</Text>;
  }

  const columns = (data?.columns ?? []).map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    render: (val: unknown) => {
      if (val === null || val === undefined) return "—";
      if (typeof val === "number") {
        if (Math.abs(val) < 0.001 && val !== 0) return val.toExponential(2);
        return Number.isInteger(val) ? val : val.toFixed(4);
      }
      return String(val);
    },
  }));

  return (
    <div>
      {degAsset && (
        <div style={{ marginBottom: 12 }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadAsset(degAsset.asset_id)}
          >
            {t("deg.downloadDeg")}
          </Button>
        </div>
      )}
      <Table
        rowKey={(_, index) => String(index)}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={loading}
        bordered
        scroll={{ x: "max-content" }}
        pagination={{
          current: page,
          pageSize: 30,
          total: data?.total ?? 0,
          showTotal: (total) => t("common.total", { count: total }),
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default DegTable;
