package com.iting.jobportal.common.service;

import java.util.List;
import java.util.Set;

/**
 * Knowledge Graph Service - Quản lý đồ thị kỹ năng IT. Load từ file JSON (in-memory), cung cấp các
 * phương thức mở rộng từ khóa và giải thích matching giữa CV và JD.
 */
public interface KnowledgeGraphService {

  /**
   * Mở rộng từ khóa tìm kiếm bằng Knowledge Graph. Ví dụ: "React" -> ["React", "JavaScript",
   * "Frontend", "ReactJS", "Next.js"]
   *
   * @param keyword Từ khóa gốc
   * @return Danh sách từ khóa mở rộng (bao gồm cả từ gốc)
   */
  Set<String> expandKeyword(String keyword);

  /**
   * Tìm tất cả skill liên quan trong bán kính depth bước. Ví dụ: getRelatedSkills("AI", 2) ->
   * ["Machine Learning", "Deep Learning", "NLP", "PyTorch", ...]
   *
   * @param skill Tên kỹ năng
   * @param depth Độ sâu duyệt (1 = trực tiếp, 2 = qua 1 trung gian)
   * @return Tập hợp tên kỹ năng liên quan
   */
  Set<String> getRelatedSkills(String skill, int depth);

  /**
   * Giải thích tại sao CV match với JD dựa trên quan hệ trong Knowledge Graph. Ví dụ: "PyTorch (CV)
   * → IS_A → Deep Learning → IS_A → AI (JD)"
   *
   * @param cvSkills Danh sách kỹ năng từ CV
   * @param jdSkills Danh sách kỹ năng từ JD
   * @return Danh sách giải thích matching
   */
  List<String> explainMatch(List<String> cvSkills, List<String> jdSkills);

  /**
   * Chuẩn hóa tên kỹ năng bằng synonym mapping. Ví dụ: "JS" -> "javascript", "React.js" -> "react"
   *
   * @param rawSkill Tên kỹ năng thô
   * @return ID chuẩn hóa trong graph
   */
  String normalize(String rawSkill);

  /**
   * Tính điểm phù hợp địa lý giữa địa điểm nhà tuyển dụng và ứng viên. Dựa trên đồ thị vùng miền
   * Việt Nam.
   *
   * @param employerLocation Địa chỉ/tỉnh thành của nhà tuyển dụng
   * @param candidateLocation Địa chỉ/tỉnh thành của ứng viên
   * @return Điểm phù hợp [0.0, 1.0] — 1.0 là cùng thành phố, 0.0 là rất xa
   */
  double locationScore(String employerLocation, String candidateLocation);
}
