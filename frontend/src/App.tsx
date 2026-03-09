import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
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
    <ConfigProvider locale={antdLocale}>
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
