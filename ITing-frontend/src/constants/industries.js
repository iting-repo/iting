export const AVAILABLE_INDUSTRIES = [
  { value: "SOFTWARE_DEVELOPMENT", label: "Phát triển phần mềm" },
  { value: "WEB_DEVELOPMENT", label: "Phát triển web" },
  { value: "MOBILE_DEVELOPMENT", label: "Phát triển mobile" },
  { value: "CLOUD_COMPUTING", label: "Điện toán đám mây" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA_SCIENCE", label: "Khoa học dữ liệu" },
  { value: "AI", label: "Trí tuệ nhân tạo (AI)" },
  { value: "CYBERSECURITY", label: "An ninh mạng" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
  { value: "GAME_DEVELOPMENT", label: "Phát triển Game" },
  { value: "QA_TESTING", label: "Kiểm thử (QA/QC)" },
];

export const getIndustryLabel = (value) => {
  const industry = AVAILABLE_INDUSTRIES.find((i) => i.value === value);
  return industry ? industry.label : value;
};
