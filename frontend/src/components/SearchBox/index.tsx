import React, { useState } from "react";
import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

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

  if (compact) {
    return (
      <Input.Search
        placeholder={t("search.placeholderCompact")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={handleSearch}
        style={{ width: 240 }}
        enterButton={<SearchOutlined />}
      />
    );
  }

  return (
    <Space.Compact size="large" style={{ width: "100%", maxWidth: 700 }}>
      <Select
        value={category}
        onChange={setCategory}
        options={categoryOptions}
        style={{ width: 160 }}
      />
      <Input.Search
        placeholder={t("search.placeholderFull")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={handleSearch}
        enterButton={t("common.search")}
      />
    </Space.Compact>
  );
};

export default SearchBox;
