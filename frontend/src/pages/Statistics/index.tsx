import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, Spin, Empty, Tree } from "antd";
import {
  BarChartOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { PieChart, BarChart as EBarChart } from "echarts/charts";
import { TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { getStatsSummary, getPublicationYears, getOrganDistribution, getMeshTree } from "../../api/stats";
import { buildPubYearOption, buildOrganPieOption } from "../../utils/chartOptions";
import type { StatsSummary, StatisticsAsset, PublicationYearData, OrganDistributionData, MeshTreeNode } from "../../types";
import { MouseBodyMap, HumanBodyMap } from "../../components/BodyMap";
import useIsMobile from "../../hooks/useIsMobile";

echarts.use([PieChart, EBarChart, TooltipComponent, GridComponent, LegendComponent, LabelLayout, CanvasRenderer]);

const { Title, Text } = Typography;

type TreeDataNode = {
  title: React.ReactNode;
  key: string;
  children?: TreeDataNode[];
  isLeaf?: boolean;
};

const Statistics: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [assets, setAssets] = useState<StatisticsAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pubYears, setPubYears] = useState<PublicationYearData[]>([]);
  const [organDist, setOrganDist] = useState<OrganDistributionData[]>([]);
  const [meshTree, setMeshTree] = useState<MeshTreeNode[]>([]);
  const [meshLoading, setMeshLoading] = useState(true);

  const isMobile = useIsMobile();

  useEffect(() => {
    getStatsSummary()
      .then((res) => {
        if (res.code === 200 && res.data) {
          setStats(res.data);
          setAssets(res.data.statistics_assets ?? []);
        }
      })
      .finally(() => setLoading(false));
    getPublicationYears().then((res) => {
      if (res.code === 200 && res.data) setPubYears(res.data);
    });
    getOrganDistribution().then((res) => {
      if (res.code === 200 && res.data) setOrganDist(res.data);
    });
    getMeshTree()
      .then((res) => {
        if (res.code === 200 && res.data) setMeshTree(res.data);
      })
      .finally(() => setMeshLoading(false));
  }, []);

  const panelHeaderStyle: React.CSSProperties = {
    backgroundColor: '#1d3e70',
    color: '#ffffff',
    padding: '12px 20px',
    fontWeight: 'bold',
    fontSize: '17px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #e8a735',
  };

  const panelBodyStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #c8d9ed',
    borderTop: 'none',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: isMobile ? '16px' : '24px',
  };

  const pubYearOption = buildPubYearOption(pubYears);
  const organPieOption = buildOrganPieOption(organDist, isMobile);

  // Convert MESH tree to Ant Design Tree data
  const convertMeshToTreeData = (nodes: MeshTreeNode[], prefix: string = ""): TreeDataNode[] => {
    return nodes.map((node, i) => {
      const key = `${prefix}${i}-${node.name}`;
      const children: TreeDataNode[] = [];

      // Add sub-nodes
      if (node.children.length > 0) {
        children.push(...convertMeshToTreeData(node.children, `${key}/`));
      }

      // Add chemicals as leaves
      node.chemicals.forEach((chem, ci) => {
        children.push({
          title: (
            <span
              style={{ cursor: "pointer", color: "#1d3e70" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/analysis/${encodeURIComponent(chem.analysis_key)}`);
              }}
            >
              {chem.chemical_name} ({chem.deseq_id})
            </span>
          ),
          key: `${key}/chem-${ci}`,
          isLeaf: true,
        });
      });

      return {
        title: <Text strong style={{ fontSize: 14 }}>{node.name}</Text>,
        key,
        children: children.length > 0 ? children : undefined,
      };
    });
  };

  const meshTreeData = convertMeshToTreeData(meshTree);

  // Collect keys for first two levels (class1/class2) for default expansion
  const defaultExpandedKeys: string[] = [];
  meshTreeData.forEach(level1 => {
    defaultExpandedKeys.push(level1.key);
    level1.children?.forEach(level2 => {
      defaultExpandedKeys.push(level2.key);
    });
  });

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <Title level={4} style={{ color: "#1d3e70", borderBottom: "2px solid #e8a735", paddingBottom: 8, marginBottom: 24 }}>
        {t("statistics.title")}
      </Title>

      {/* Statistics Overview section */}
      <Spin spinning={loading}>
        {/* Core stats */}
        {stats && (
          <div style={{ marginBottom: 24, background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #c8d9ed' }}>
            <div style={panelHeaderStyle}>
              <DatabaseOutlined style={{ marginRight: 8, fontSize: 16 }} />
              {t("statistics.overview")}
            </div>
            <Row>
              <Col xs={12} sm={6} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e6edf5' }}>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.sampleRecords")}</div>
                <div style={{ color: '#1d3e70', fontSize: 30, fontWeight: 'bold' }}>{stats.record_rows}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e6edf5' }}>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.analysisItems")}</div>
                <div style={{ color: '#1d3e70', fontSize: 30, fontWeight: 'bold' }}>{stats.analysis_groups}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid #e6edf5' }}>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.chemicalTypes")}</div>
                <div style={{ color: '#1d3e70', fontSize: 30, fontWeight: 'bold' }}>{stats.unique_chemicals}</div>
              </Col>
              <Col xs={12} sm={6} style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>{t("home.deseqCount")}</div>
                <div style={{ color: '#1d3e70', fontSize: 30, fontWeight: 'bold' }}>{stats.unique_deseq_id}</div>
              </Col>
            </Row>
          </div>
        )}

        {/* Charts */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {pubYearOption && (
            <Col xs={24} md={12}>
              <div style={panelHeaderStyle}>
                <BarChartOutlined style={{ marginRight: 8, fontSize: 16 }} />
                {t("home.publicationYearChart")}
              </div>
              <div style={panelBodyStyle}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={pubYearOption}
                  style={{ height: 360, width: '100%' }}
                />
              </div>
            </Col>
          )}
          {organPieOption && (
            <Col xs={24} md={12}>
              <div style={panelHeaderStyle}>
                <ClusterOutlined style={{ marginRight: 8, fontSize: 16 }} />
                {t("home.organDistChart")}
              </div>
              <div style={panelBodyStyle}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={organPieOption}
                  style={{ height: 360, width: '100%' }}
                />
              </div>
            </Col>
          )}
        </Row>

        {/* Body Maps */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <div style={panelHeaderStyle}>
              <ClusterOutlined style={{ marginRight: 8, fontSize: 16 }} />
              {t("home.mouseBodyMap")}
            </div>
            <div style={{ ...panelBodyStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420, overflow: 'visible' }}>
              <MouseBodyMap isMobile={isMobile} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={panelHeaderStyle}>
              <ClusterOutlined style={{ marginRight: 8, fontSize: 16 }} />
              {t("home.humanBodyMap")}
            </div>
            <div style={{ ...panelBodyStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420, overflow: 'visible' }}>
              <HumanBodyMap isMobile={isMobile} />
            </div>
          </Col>
        </Row>

        {/* Existing statistics assets images */}
        {assets.length > 0 && (
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {assets.map((asset) => (
              <Col xs={24} md={12} key={asset.name}>
                <Card
                  title={<span style={{ color: "#1d3e70", fontSize: 16 }}>{asset.title}</span>}
                  styles={{ header: { background: "#f8f9fa", borderBottom: "1px solid #e6edf5" } }}
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

      {/* MESH Tree */}
      <div style={{ marginBottom: 24 }}>
        <div style={panelHeaderStyle}>
          <ExperimentOutlined style={{ marginRight: 8, fontSize: 16 }} />
          {t("statistics.meshTree")}
        </div>
        <div style={panelBodyStyle}>
          <Spin spinning={meshLoading}>
            {meshTreeData.length > 0 ? (
              <Tree
                treeData={meshTreeData}
                defaultExpandedKeys={defaultExpandedKeys}
                showLine
                blockNode
                style={{ fontSize: 14 }}
              />
            ) : (
              !meshLoading && <Empty description={t("common.noData")} />
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
