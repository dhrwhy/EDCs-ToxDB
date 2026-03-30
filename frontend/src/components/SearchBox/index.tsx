import React, { useState, useEffect } from "react";
import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useIsMobile from "../../hooks/useIsMobile";

interface Props {
  onSearch: (keyword: string, category: string) => void;
  defaultKeyword?: string;
  defaultCategory?: string;
  /** 是否为精简模式（导航栏使用，不展示分类下拉） */
  compact?: boolean;
}

const SearchBox: React.FC<Props> = ({
  onSearch,
  defaultKeyword = "",
  defaultCategory = "all",
  compact = false,
}) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [category, setCategory] = useState(defaultCategory);

  useEffect(() => { setKeyword(defaultKeyword); }, [defaultKeyword]);
  useEffect(() => { setCategory(defaultCategory); }, [defaultCategory]);

  const categoryOptions = [
    { value: "all", label: t("search.all") },
    { value: "cas", label: t("search.cas") },
    { value: "inchikey", label: t("search.inchikey") },
    { value: "chemical_name", label: t("search.chemicalName") },
    { value: "pubchem_cid", label: t("search.pubchemCid") },
    { value: "deseq_id", label: t("search.deseqId") },
  ];

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim(), category);
    }
  };

  const isMobile = useIsMobile();

  if (compact) {
    return (
      <Input.Search
        placeholder={t("search.placeholderCompact")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={handleSearch}
        style={{ width: isMobile ? "100%" : 240 }}
        enterButton={<SearchOutlined />}
      />
    );
  }

  return (
    <Space.Compact size={isMobile ? "middle" : "large"} style={{ width: "100%", maxWidth: 700 }}>
      {!isMobile && (
        <Select
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          style={{ width: 160 }}
        />
      )}
      <Input.Search
        placeholder={isMobile ? t("search.placeholderCompact") : t("search.placeholderFull")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={handleSearch}
        enterButton={t("common.search")}
      />
    </Space.Compact>
  );
};

export default SearchBox;
