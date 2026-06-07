package com.iting.jobportal.admin.rbac.service;

import com.iting.jobportal.admin.rbac.dto.*;
import com.iting.jobportal.admin.rbac.entity.Permission;
import com.iting.jobportal.admin.rbac.entity.RbacRole;
import com.iting.jobportal.admin.rbac.entity.RbacRolePermission;
import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import com.iting.jobportal.admin.rbac.enums.RiskLevel;
import com.iting.jobportal.admin.rbac.enums.RoleStatus;
import com.iting.jobportal.admin.rbac.repository.PermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRolePermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRoleRepository;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountType;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RbacServiceImpl implements RbacService {

  private static final String SUPER_ADMIN = "SUPER_ADMIN";
  private static final String AUDIT_ENTITY = "RBAC_ROLE";

  private final PermissionRepository permissionRepository;
  private final RbacRoleRepository roleRepository;
  private final RbacRolePermissionRepository rolePermissionRepository;
  private final AccountRepository accountRepository;
  private final AdminActivityLogService activityLogService;

  // ── Queries ───────────────────────────────────────────────────────────────

  @Override
  public List<PermissionResponse> listPermissions(String scope) {
    List<Permission> perms =
        scope == null || scope.isBlank()
            ? permissionRepository.findAllByOrderByModuleAscCodeAsc()
            : permissionRepository.findByScopeOrderByModuleAscCodeAsc(parseScope(scope));
    return perms.stream().map(PermissionResponse::from).collect(Collectors.toList());
  }

  @Override
  public List<RoleResponse> listRoles(String scope) {
    List<RbacRole> roles =
        scope == null || scope.isBlank()
            ? roleRepository.findAll()
            : roleRepository.findByScopeOrderBySystemRoleDescCreatedAtAsc(parseScope(scope));
    return mapRoles(roles);
  }

  @Override
  public List<RoleResponse> listPendingApprovals() {
    return mapRoles(roleRepository.findByStatusOrderByCreatedAtDesc(RoleStatus.PENDING_APPROVAL));
  }

  @Override
  public RoleResponse getRole(Long id) {
    return mapRole(findRole(id), riskMap());
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  @Override
  @Transactional
  public RoleResponse createRole(Long actorId, CreateRoleRequest request) {
    PermissionScope scope = parseScope(request.getScope());
    String code = request.getCode().trim().toUpperCase().replaceAll("\\s+", "_");
    if (roleRepository.existsByCode(code)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã role đã tồn tại: " + code);
    }

    RbacRole role =
        RbacRole.builder()
            .code(code)
            .name(request.getName().trim())
            .description(request.getDescription())
            .scope(scope)
            .status(RoleStatus.DRAFT)
            .systemRole(false)
            .reason(request.getReason())
            .createdBy(actorId)
            .build();
    role = roleRepository.save(role);

    replacePermissions(role, request.getPermissions(), scope);

    audit(actorId, "CREATE", role.getId(), "Tạo role " + code + " (" + scope + ")");
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public RoleResponse updateRole(Long actorId, Long id, UpdateRoleRequest request) {
    RbacRole role = findRole(id);
    if (Boolean.TRUE.equals(role.getSystemRole())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không thể chỉnh sửa role hệ thống: " + role.getCode());
    }
    if (request.getName() != null) role.setName(request.getName().trim());
    if (request.getDescription() != null) role.setDescription(request.getDescription());
    if (request.getReason() != null) role.setReason(request.getReason());

    if (request.getPermissions() != null) {
      replacePermissions(role, request.getPermissions(), role.getScope());
      // Sửa quyền của role đã duyệt → phải duyệt lại
      if (role.getStatus() == RoleStatus.ACTIVE || role.getStatus() == RoleStatus.APPROVED) {
        role.setStatus(RoleStatus.PENDING_APPROVAL);
      }
    }
    role = roleRepository.save(role);
    audit(actorId, "UPDATE", role.getId(), "Cập nhật role " + role.getCode());
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public RoleResponse submitForApproval(Long actorId, Long id) {
    RbacRole role = findRole(id);
    if (role.getStatus() != RoleStatus.DRAFT && role.getStatus() != RoleStatus.REJECTED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ role ở trạng thái DRAFT/REJECTED mới gửi duyệt được");
    }
    role.setStatus(RoleStatus.PENDING_APPROVAL);
    role.setRejectReason(null);
    role = roleRepository.save(role);
    audit(actorId, "SUBMIT", role.getId(), "Gửi duyệt role " + role.getCode());
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public RoleResponse approveRole(Long actorId, Long id) {
    requireSuperAdmin(actorId, "duyệt role");
    RbacRole role = findRole(id);
    if (role.getStatus() != RoleStatus.PENDING_APPROVAL) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Role không ở trạng thái chờ duyệt");
    }
    role.setStatus(RoleStatus.ACTIVE);
    role.setApprovedBy(actorId);
    role.setApprovedAt(LocalDateTime.now());
    role.setRejectReason(null);
    role = roleRepository.save(role);
    audit(actorId, "APPROVE", role.getId(), "Duyệt & kích hoạt role " + role.getCode());
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public RoleResponse rejectRole(Long actorId, Long id, String reason) {
    requireSuperAdmin(actorId, "từ chối role");
    RbacRole role = findRole(id);
    if (role.getStatus() != RoleStatus.PENDING_APPROVAL) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Role không ở trạng thái chờ duyệt");
    }
    role.setStatus(RoleStatus.REJECTED);
    role.setRejectReason(reason);
    role.setApprovedBy(actorId);
    role.setApprovedAt(LocalDateTime.now());
    role = roleRepository.save(role);
    audit(
        actorId,
        "REJECT",
        role.getId(),
        "Từ chối role " + role.getCode() + (reason != null ? " — " + reason : ""));
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public RoleResponse setStatus(Long actorId, Long id, String status) {
    RbacRole role = findRole(id);
    RoleStatus target = parseStatus(status);
    if (target != RoleStatus.ACTIVE && target != RoleStatus.DISABLED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ cho phép chuyển ACTIVE hoặc DISABLED");
    }
    if (target == RoleStatus.ACTIVE
        && role.getStatus() != RoleStatus.DISABLED
        && role.getStatus() != RoleStatus.APPROVED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ kích hoạt được role đã duyệt hoặc đang bị vô hiệu");
    }
    role.setStatus(target);
    role = roleRepository.save(role);
    audit(
        actorId,
        target == RoleStatus.ACTIVE ? "ENABLE" : "DISABLE",
        role.getId(),
        (target == RoleStatus.ACTIVE ? "Kích hoạt" : "Vô hiệu hóa") + " role " + role.getCode());
    return mapRole(role, riskMap());
  }

  @Override
  @Transactional
  public void deleteRole(Long actorId, Long id) {
    RbacRole role = findRole(id);
    if (Boolean.TRUE.equals(role.getSystemRole())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không thể xóa role hệ thống: " + role.getCode());
    }
    rolePermissionRepository.deleteByRoleId(id);
    roleRepository.delete(role);
    audit(actorId, "DELETE", id, "Xóa role " + role.getCode());
  }

  @Override
  @Transactional
  public void assignRole(Long actorId, AssignRoleRequest request) {
    RbacRole role =
        roleRepository
            .findByCode(request.getRoleCode())
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy role: " + request.getRoleCode()));
    Account target =
        accountRepository
            .findById(request.getAccountId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

    if (role.getStatus() != RoleStatus.ACTIVE) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ gán được role đang ACTIVE");
    }

    // Rule 6: không ai được tự nâng quyền SUPER_ADMIN cho chính mình
    if (SUPER_ADMIN.equals(role.getCode()) && Objects.equals(actorId, target.getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không thể tự gán quyền SUPER_ADMIN cho chính mình");
    }

    // Rule 1 & 8: chặn gán quyền nội bộ cho tài khoản công khai / sai phạm vi
    AccountType type = target.getAccountType() != null ? target.getAccountType() : AccountType.PUBLIC;
    if (role.getScope() == PermissionScope.PLATFORM && type != AccountType.INTERNAL_STAFF) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Không thể gán quyền nội bộ ITing cho tài khoản công khai (account_type=" + type + ")");
    }
    if (role.getScope() == PermissionScope.COMPANY && type == AccountType.PUBLIC) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Tài khoản công khai không thể nhận company role");
    }

    if (role.getScope() == PermissionScope.PLATFORM) {
      // Platform staff cần role nền tảng ADMIN để qua được security guard /api/admin/**
      target.setRole(Role.ADMIN);
      target.setAdminRole(role.getCode());
      accountRepository.save(target);
    }

    audit(
        actorId,
        "ASSIGN_ROLE",
        target.getId(),
        "Gán role " + role.getCode() + " cho tài khoản " + target.getEmail());
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private RbacRole findRole(Long id) {
    return roleRepository
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy role #" + id));
  }

  private void requireSuperAdmin(Long actorId, String action) {
    Account actor = actorId == null ? null : accountRepository.findById(actorId).orElse(null);
    boolean isSuper = actor != null && SUPER_ADMIN.equals(actor.getAdminRole());
    if (!isSuper) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Chỉ Super Admin mới được " + action);
    }
  }

  /** Thay thế toàn bộ tập quyền của role; chỉ chấp nhận permission đúng scope. */
  private void replacePermissions(RbacRole role, List<String> codes, PermissionScope scope) {
    rolePermissionRepository.deleteByRoleId(role.getId());
    if (codes == null || codes.isEmpty()) return;

    Map<String, Permission> catalog =
        permissionRepository.findAll().stream()
            .collect(Collectors.toMap(Permission::getCode, p -> p));

    List<RbacRolePermission> rows = new ArrayList<>();
    Set<String> seen = new HashSet<>();
    for (String code : codes) {
      Permission p = catalog.get(code);
      if (p == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Quyền không tồn tại: " + code);
      }
      if (p.getScope() != scope) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Quyền " + code + " không thuộc phạm vi " + scope);
      }
      if (seen.add(code)) {
        rows.add(RbacRolePermission.builder().roleId(role.getId()).permissionCode(code).build());
      }
    }
    rolePermissionRepository.saveAll(rows);
  }

  private Map<String, RiskLevel> riskMap() {
    return permissionRepository.findAll().stream()
        .collect(Collectors.toMap(Permission::getCode, Permission::getRiskLevel));
  }

  private List<RoleResponse> mapRoles(List<RbacRole> roles) {
    Map<String, RiskLevel> risk = riskMap();
    return roles.stream().map(r -> mapRole(r, risk)).collect(Collectors.toList());
  }

  private RoleResponse mapRole(RbacRole role, Map<String, RiskLevel> risk) {
    List<String> perms =
        rolePermissionRepository.findByRoleId(role.getId()).stream()
            .map(RbacRolePermission::getPermissionCode)
            .sorted()
            .collect(Collectors.toList());

    RiskLevel highest = RiskLevel.LOW;
    for (String code : perms) {
      RiskLevel rl = risk.getOrDefault(code, RiskLevel.LOW);
      if (rl == RiskLevel.HIGH) {
        highest = RiskLevel.HIGH;
        break;
      }
      if (rl == RiskLevel.MEDIUM) highest = RiskLevel.MEDIUM;
    }

    return RoleResponse.builder()
        .id(role.getId())
        .code(role.getCode())
        .name(role.getName())
        .description(role.getDescription())
        .scope(role.getScope().name())
        .status(role.getStatus().name())
        .systemRole(role.getSystemRole())
        .reason(role.getReason())
        .rejectReason(role.getRejectReason())
        .createdBy(role.getCreatedBy())
        .createdByName(resolveName(role.getCreatedBy()))
        .approvedBy(role.getApprovedBy())
        .approvedByName(resolveName(role.getApprovedBy()))
        .approvedAt(role.getApprovedAt())
        .createdAt(role.getCreatedAt())
        .permissions(perms)
        .permissionCount(perms.size())
        .highestRisk(highest.name())
        .build();
  }

  private String resolveName(Long accountId) {
    if (accountId == null) return null;
    return accountRepository
        .findById(accountId)
        .map(a -> a.getFullName() != null ? a.getFullName() : a.getEmail())
        .orElse(null);
  }

  private PermissionScope parseScope(String scope) {
    try {
      return PermissionScope.valueOf(scope.trim().toUpperCase());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Phạm vi không hợp lệ: " + scope);
    }
  }

  private RoleStatus parseStatus(String status) {
    try {
      return RoleStatus.valueOf(status.trim().toUpperCase());
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ: " + status);
    }
  }

  private void audit(Long actorId, String action, Long roleId, String description) {
    try {
      activityLogService.logActivity(actorId, action, AUDIT_ENTITY, roleId, description);
    } catch (Exception ignored) {
      // audit không được làm hỏng nghiệp vụ chính
    }
  }
}
