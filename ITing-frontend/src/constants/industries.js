export const AVAILABLE_INDUSTRIES = [
  { value: "SOFTWARE_DEVELOPMENT", label: "Phát triển phần mềm" },
  { value: "CLOUD_COMPUTING", label: "Điện toán đám mây" },
  { value: "AI", label: "Trí tuệ nhân tạo (AI)" },
  { value: "QA_TESTING", label: "Kiểm thử (QA/QC)" },
  { value: "CYBER_SECURITY", label: "An ninh mạng" },
  { value: "DATA_SCIENCE", label: "Khoa học dữ liệu" },
  { value: "E_COMMERCE", label: "Thương mại điện tử" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
  { value: "IOT", label: "Internet of Things" },
  { value: "GAME_DEVELOPMENT", label: "Phát triển Game" },
  { value: "FINTECH", label: "Công nghệ tài chính" },
  { value: "EDTECH", label: "Công nghệ giáo dục" },
  { value: "HEALTHTECH", label: "Công nghệ y tế" },
  { value: "OUTSOURCING", label: "Outsourcing" },
  { value: "PRODUCT_BASED", label: "Product Based" },
  { value: "OTHER", label: "Lĩnh vực khác" },
];

export const getIndustryLabel = (value) => {
  const industry = AVAILABLE_INDUSTRIES.find((i) => i.value === value);
  return industry ? industry.label : value;
};
