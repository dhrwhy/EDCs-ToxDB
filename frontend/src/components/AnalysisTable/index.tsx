import React from "react";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AnalysisItem } from "../../types";
import { displayValue } from "../../utils/formatters";
import { externalLinks } from "../../utils/externalLinks";
import ExternalLink from "../ExternalLink";

interface Props {
  items: AnalysisItem[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const AnalysisTable: React.FC<Props> = ({
  items,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<AnalysisItem> = [
    {
      title: t("table.deseqId"),
      dataIndex: "deseq_id",
      width: 130,
      render: (val: string, record: AnalysisItem) => (
        <Link to={`/analysis/${encodeURIComponent(record.analysis_key)}`}>
          {val}
        </Link>
      ),
    },
    {
      title: t("table.chemicalName"),
      dataIndex: "chemical_name",
      width: 220,
      ellipsis: { showTitle: false },
      render: (val: string) => (
        <Tooltip title={val} placement="topLeft">
          {val}
        </Tooltip>
      ),
    },
    {
      title: t("table.casId"),
      dataIndex: "cas_id",
      width: 130,
    },
    {
      title: t("table.gseId"),
      dataIndex: "gse_id",
      width: 130,
      render: (val: string) => (
        <ExternalLink href={externalLinks.geo(val)}>{val}</ExternalLink>
      ),
    },
    {
      title: t("table.organism"),
      dataIndex: "organism",
      width: 130,
    },
    {
      title: t("table.tissueCategory"),
      dataIndex: "tissue_category",
      width: 110,
    },
    {
      title: t("table.libraryMethod"),
      dataIndex: "library_method",
      width: 130,
      render: (val: string | null) => displayValue(val),
    },
    {
      title: t("table.sampleCount"),
      dataIndex: "sample_count",
      width: 80,
      align: "center",
    },
  ];

  return (
    <Table<AnalysisItem>
      rowKey="analysis_key"
      columns={columns}
      dataSource={items}
      loading={loading}
      bordered
      size="middle"
      scroll={{ x: 1060 }}
      pagination={{
        current: page,
        pageSize,
        total,
        showTotal: (t) => `${t}`,
        onChange: onPageChange,
        showSizeChanger: false,
      }}
    />
  );
};

export default AnalysisTable;
