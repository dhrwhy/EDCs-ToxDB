import React from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  UnorderedListOutlined,
  DownloadOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBox from "../SearchBox";

const { Header, Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: t("nav.home") },
    { key: "/browse", icon: <UnorderedListOutlined />, label: t("nav.browse") },
    { key: "/download", icon: <DownloadOutlined />, label: t("nav.download") },
    { key: "/statistics", icon: <BarChartOutlined />, label: t("nav.statistics") },
    { key: "/help", icon: <QuestionCircleOutlined />, label: t("nav.help") },
  ];

  const handleNavSearch = (keyword: string) => {
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const toggleLang = () => {
    const next = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const selectedKey =
    menuItems.find(
      (item) => item.key !== "/" && location.pathname.startsWith(item.key)
    )?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 20,
            color: "#1677ff",
            marginRight: 40,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate("/")}
        >
          MouseToxDB
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, border: "none" }}
        />
        <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <SearchBox onSearch={handleNavSearch} compact />
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={toggleLang}
            style={{ fontWeight: 500 }}
          >
            {i18n.language === "zh" ? "EN" : "中"}
          </Button>
        </div>
      </Header>

      <Content style={{ padding: "24px 48px", background: "#f5f5f5" }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            minHeight: 600,
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: "center", color: "#999" }}>
        MouseToxDB &copy; 2026 — {t("common.subtitle")}
      </Footer>
    </Layout>
  );
};

export default AppLayout;
