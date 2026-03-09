import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import AppLayout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Browse from "./pages/Browse";
import Analysis from "./pages/Analysis";
import Download from "./pages/Download";
import Statistics from "./pages/Statistics";
import Help from "./pages/Help";

function App() {
  const { i18n } = useTranslation();
  const antdLocale = i18n.language === "en" ? enUS : zhCN;

  return (
    <ConfigProvider 
      locale={antdLocale}
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          colorPrimary: '#2b579a',
          colorLink: '#0033cc',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 14,
          borderRadius: 2,
          colorTextHeading: '#333333',
          colorBgContainer: '#ffffff',
          colorBorderSecondary: '#cccccc',
        },
        components: {
          Layout: {
            headerBg: '#2b579a',
            headerColor: '#ffffff',
            headerHeight: 56,
            headerPadding: '0 24px',
            bodyBg: '#ffffff',
          },
          Menu: {
            itemBg: 'transparent',
            itemColor: 'rgba(255,255,255,0.85)',
            itemHoverColor: '#ffffff',
            itemHoverBg: 'rgba(255,255,255,0.12)',
            itemSelectedColor: '#ffffff',
            itemSelectedBg: 'rgba(255,255,255,0.2)',
            activeBarHeight: 2,
            activeBarBorderWidth: 2,
            horizontalItemSelectedColor: '#ffffff',
            horizontalItemSelectedBg: 'rgba(255,255,255,0.2)',
            fontSize: 14,
          },
          Table: {
            headerBg: '#e6edf5',
            headerColor: '#333333',
            borderColor: '#cccccc',
            cellPaddingBlock: 8,
            cellPaddingInline: 12,
          },
          Descriptions: {
            contentColor: '#000000',
            titleColor: '#333333',
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/analysis/:analysisKey" element={<Analysis />} />
            <Route path="/download" element={<Download />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
