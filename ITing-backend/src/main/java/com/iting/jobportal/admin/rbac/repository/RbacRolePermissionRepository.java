package com.iting.jobportal.admin.rbac.repository;

import com.iting.jobportal.admin.rbac.entity.RbacRolePermission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface RbacRolePermissionRepository extends JpaRepository<RbacRolePermission, Long> {

  List<RbacRolePermission> findByRoleId(Long roleId);

  /**
   * Xoá toàn bộ quyền của role bằng bulk DELETE chạy NGAY (không qua persistence context).
   *
   * <p>{@code flushAutomatically=true} đẩy mọi thay đổi pending xuống DB trước khi DELETE, và bulk
   * DELETE thực thi tức thì — nhờ vậy khi {@code replacePermissions} chèn lại quyền (có thể trùng mã
   * cũ), DELETE đã hoàn tất trước INSERT, tránh vi phạm UNIQUE(role_id, permission_code). Nếu dùng
   * derived delete thường, Hibernate sắp INSERT trước DELETE trong cùng transaction → lỗi trùng khoá
   * khi role giữ lại quyền cũ. {@code clearAutomatically=true} dọn context để không còn entity cũ.
   */
  /**
   * Xoá toàn bộ quyền của role bằng bulk DELETE chạy NGAY (không qua persistence context).
   *
   * <p>{@code flushAutomatically=true} đẩy mọi thay đổi pending xuống DB trước khi DELETE, và bulk
   * DELETE thực thi tức thì — nhờ vậy khi {@code replacePermissions} chèn lại quyền (có thể trùng mã
   * cũ), DELETE đã hoàn tất trước INSERT, tránh vi phạm UNIQUE(role_id, permission_code). Nếu dùng
   * derived delete thường, Hibernate sắp INSERT trước DELETE trong cùng transaction → lỗi trùng khoá
   * khi role giữ lại quyền cũ. {@code clearAutomatically=true} dọn context để không còn entity cũ.
   */
  @Transactional
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("DELETE FROM RbacRolePermission rp WHERE rp.roleId = :roleId")
  void deleteByRoleId(@Param("roleId") Long roleId);
}
