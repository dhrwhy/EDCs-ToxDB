import React from "react";
import { Typography, Table, Card } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;

const Help: React.FC = () => {
  const { t } = useTranslation();

  const helpColumns = [
    { title: t("help.displayName"), dataIndex: "display", key: "display" },
    { title: t("help.fieldName"), dataIndex: "field", key: "field" },
    { title: t("help.description"), dataIndex: "desc", key: "desc" },
  ];

  const fieldData = [
    { key: "1", display: "DESEQ_ID", field: "deseq_id", desc: t("help.fieldDeseq") },
    { key: "2", display: t("table.chemicalName"), field: "chemical_name", desc: t("help.fieldChemName") },
    { key: "3", display: t("table.casId"), field: "cas_id", desc: t("help.fieldCas") },
    { key: "4", display: "InChIKey", field: "inchi_key", desc: t("help.fieldInchi") },
    { key: "5", display: "PubChem CID", field: "pubchem_cid", desc: t("help.fieldPubchem") },
    { key: "6", display: "GSE_ID", field: "gse_id", desc: t("help.fieldGse") },
    { key: "7", display: "SRR_ID", field: "srr_id", desc: t("help.fieldSrr") },
    { key: "8", display: "BioProject", field: "bioproject_id", desc: t("help.fieldBioproject") },
    { key: "9", display: t("table.tissueCategory"), field: "tissue_category", desc: t("help.fieldTissue") },
    { key: "10", display: t("table.libraryMethod"), field: "library_method", desc: t("help.fieldLibrary") },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Title level={3}>{t("help.title")}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t("help.usageGuide")}</Title>
        <Paragraph>{t("help.usageIntro")}</Paragraph>
        <Paragraph>
          <Text strong>{t("help.searchLabel")}</Text>
          {t("help.searchDesc")}
        </Paragraph>
        <Paragraph>
          <Text strong>{t("help.browseLabel")}</Text>
          {t("help.browseDesc")}
        </Paragraph>
        <Paragraph>
          <Text strong>{t("help.detailLabel")}</Text>
          {t("help.detailDesc")}
        </Paragraph>
        <Paragraph>
          <Text strong>{t("help.downloadLabel")}</Text>
          {t("help.downloadDesc")}
        </Paragraph>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t("help.fieldTitle")}</Title>
        <Table
          columns={helpColumns}
          dataSource={fieldData}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t("help.externalLinksTitle")}</Title>
        <Paragraph>{t("help.externalLinksIntro")}</Paragraph>
        <ul>
          <li>
            <Text strong>PubChem CID</Text> → {t("help.linkPubchem")}
          </li>
          <li>
            <Text strong>GSE_ID</Text> → {t("help.linkGse")}
          </li>
          <li>
            <Text strong>SRR_ID</Text> → {t("help.linkSrr")}
          </li>
          <li>
            <Text strong>BioProject</Text> → {t("help.linkBioproject")}
          </li>
          <li>
            <Text strong>DOI</Text> → {t("help.linkDoi")}
          </li>
        </ul>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t("help.contactTitle")}</Title>
        <Paragraph>{t("help.contactDesc")}</Paragraph>
      </Card>

      <Card>
        <Title level={4}>{t("help.citationTitle")}</Title>
        <Paragraph>{t("help.citationDesc")}</Paragraph>
      </Card>
    </div>
  );
};

export default Help;
