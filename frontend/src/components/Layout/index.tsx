import React from "react";
import { Layout, Button } from "antd";
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

  const navItems = [
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

  const isActive = (key: string) => {
    if (key === "/") return location.pathname === "/";
    return location.pathname.startsWith(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 32px",
            position: "relative",
            minHeight: 70,
          }}
        >
          <div
            className="academic-header-title"
            style={{
              marginRight: 60,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/")}
          >
            MouseToxDB
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SearchBox onSearch={handleNavSearch} compact />
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={toggleLang}
            style={{ fontWeight: 500, color: "#ffffff" }}
          >
            {i18n.language === "zh" ? "EN" : "中"}
          </Button>
          </div>
        </Header>

        {/* Tab-style navigation bar */}
        <nav
          style={{
            display: "flex",
            gap: 2,
            padding: "0 24px",
            background: "#2b579a",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.key);
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: "4px 4px 0 0",
                  color: active ? "#2b579a" : "rgba(255,255,255,0.9)",
                  background: active ? "#ffffff" : "transparent",
                  borderTop: active ? "3px solid #e8a735" : "3px solid transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.icon}
                {item.label}
              </div>
            );
          })}
        </nav>
      </div>

      <Content className="ant-layout-content" style={{ background: "#ffffff" }}>
        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            minHeight: 600,
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: "center", color: "#666", borderTop: "1px solid #ccc", padding: "12px 0", background: "#f5f5f5" }}>
        MouseToxDB &copy; 2026 — {t("common.subtitle")}
      </Footer>
    </Layout>
  );
};

export default AppLayout;
