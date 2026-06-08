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
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.AccountType;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
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
  private final CompanyRepository companyRepository;
  private final CompanyHrAffiliationRepository affiliationRepository;
  private final RbacPermissionResolver permissionResolver;
  private final PasswordEncoder passwordEncoder;

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

    // Cấp SUPER_ADMIN là quyền nhạy cảm nhất → chỉ Super Admin hiện tại mới được cấp
    if (SUPER_ADMIN.equals(role.getCode())) {
      requireSuperAdmin(actorId, "gán quyền SUPER_ADMIN");
      // Rule 6: không ai được tự nâng quyền SUPER_ADMIN cho chính mình
      if (Objects.equals(actorId, target.getId())) {
        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN, "Không thể tự gán quyền SUPER_ADMIN cho chính mình");
      }
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

  // ── Company RBAC ─────────────────────────────────────────────────────────

  @Override
  public List<CompanySummaryResponse> listCompanies(String keyword) {
    String kw = keyword == null ? "" : keyword.trim().toLowerCase();
    return companyRepository.findAll().stream()
        .filter(c -> kw.isEmpty() || (c.getName() != null && c.getName().toLowerCase().contains(kw)))
        .sorted(Comparator.comparing(Company::getName, Comparator.nullsLast(String::compareTo)))
        .map(
            c ->
                CompanySummaryResponse.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .memberCount(
                        (int)
                            affiliationRepository.countByCompany_IdAndStatus(
                                c.getId(), AffiliationStatus.APPROVED))
                    .build())
        .collect(Collectors.toList());
  }

  @Override
  public List<CompanyMemberResponse> listCompanyMembers(Long companyId) {
    Map<String, String> roleNames = companyRoleNames();
    return affiliationRepository.findByCompany_Id(companyId).stream()
        .filter(a -> a.getStatus() != AffiliationStatus.REVOKED)
        .map(a -> toMember(a, roleNames))
        .collect(Collectors.toList());
  }

  @Override
  public List<AvailableHrResponse> listAvailableHr(String keyword) {
    String kw = keyword == null ? "" : keyword.trim().toLowerCase();
    return accountRepository.findByRole(Role.EMPLOYER).stream()
        .filter(a -> affiliationRepository.findActiveByHrAccountId(a.getId()).isEmpty())
        .filter(
            a ->
                kw.isEmpty()
                    || (a.getEmail() != null && a.getEmail().toLowerCase().contains(kw))
                    || (a.getFullName() != null && a.getFullName().toLowerCase().contains(kw)))
        .map(
            a ->
                AvailableHrResponse.builder()
                    .accountId(a.getId())
                    .email(a.getEmail())
                    .fullName(a.getFullName())
                    .build())
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public CompanyMemberResponse addCompanyMember(
      Long actorId, Long companyId, AddCompanyMemberRequest req) {
    Company company =
        companyRepository
            .findById(companyId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy công ty"));
    Account hr =
        accountRepository
            .findById(req.getAccountId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

    if (hr.getRole() == null || hr.getRole().normalize() != Role.EMPLOYER) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Chỉ tài khoản HR (EMPLOYER) mới được thêm vào công ty");
    }
    // Rule 2: mỗi HR chỉ thuộc 1 công ty (1 affiliation active duy nhất)
    if (affiliationRepository.findActiveByHrAccountId(hr.getId()).isPresent()) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "HR này đã thuộc một công ty khác");
    }
    requireActiveCompanyRole(req.getRoleCode());

    CompanyHrAffiliation aff =
        CompanyHrAffiliation.builder()
            .hrAccount(hr)
            .company(company)
            .status(AffiliationStatus.APPROVED)
            .companyRoleCode(req.getRoleCode())
            .requestedAt(LocalDateTime.now())
            .reviewedAt(LocalDateTime.now())
            .reviewedBy(actorId)
            .submissionStatus(SubmissionStatus.NONE)
            .submittedConsentConfirmed(false)
            .build();
    aff = affiliationRepository.save(aff);

    // Tài khoản HR thuộc tổ chức công ty → COMPANY_STAFF
    if (hr.getAccountType() != AccountType.COMPANY_STAFF) {
      hr.setAccountType(AccountType.COMPANY_STAFF);
      accountRepository.save(hr);
    }

    audit(
        actorId,
        "ADD_MEMBER",
        aff.getId(),
        "Thêm HR " + hr.getEmail() + " vào công ty " + company.getName() + " với vai trò "
            + req.getRoleCode());
    return toMember(aff, companyRoleNames());
  }

  @Override
  @Transactional
  public CompanyMemberResponse assignCompanyRole(Long actorId, Long affiliationId, String roleCode) {
    CompanyHrAffiliation aff = findAffiliation(affiliationId);
    requireActiveCompanyRole(roleCode);
    aff.setCompanyRoleCode(roleCode);
    aff = affiliationRepository.save(aff);
    audit(
        actorId,
        "ASSIGN_COMPANY_ROLE",
        aff.getId(),
        "Gán company role " + roleCode + " cho " + aff.getHrAccount().getEmail());
    return toMember(aff, companyRoleNames());
  }

  @Override
  @Transactional
  public void removeCompanyMember(Long actorId, Long affiliationId) {
    CompanyHrAffiliation aff = findAffiliation(affiliationId);
    aff.setStatus(AffiliationStatus.REVOKED);
    aff.setCompanyRoleCode(null);
    affiliationRepository.save(aff);
    audit(
        actorId,
        "REMOVE_MEMBER",
        aff.getId(),
        "Gỡ HR " + aff.getHrAccount().getEmail() + " khỏi công ty");
  }

  private CompanyHrAffiliation findAffiliation(Long id) {
    return affiliationRepository
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên #" + id));
  }

  /** Xác thực role tồn tại, đúng scope COMPANY và đang ACTIVE. */
  private void requireActiveCompanyRole(String roleCode) {
    RbacRole role =
        roleRepository
            .findByCode(roleCode)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy company role: " + roleCode));
    if (role.getScope() != PermissionScope.COMPANY) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, roleCode + " không phải company role");
    }
    if (role.getStatus() != RoleStatus.ACTIVE) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company role chưa được kích hoạt");
    }
  }

  private Map<String, String> companyRoleNames() {
    Map<String, String> map = new HashMap<>();
    roleRepository
        .findByScopeOrderBySystemRoleDescCreatedAtAsc(PermissionScope.COMPANY)
        .forEach(r -> map.put(r.getCode(), r.getName()));
    return map;
  }

  private CompanyMemberResponse toMember(CompanyHrAffiliation a, Map<String, String> roleNames) {
    Account hr = a.getHrAccount();
    return CompanyMemberResponse.builder()
        .affiliationId(a.getId())
        .accountId(hr != null ? hr.getId() : null)
        .email(hr != null ? hr.getEmail() : null)
        .fullName(hr != null ? hr.getFullName() : null)
        .status(a.getStatus() != null ? a.getStatus().name() : null)
        .companyRoleCode(a.getCompanyRoleCode())
        .companyRoleName(
            a.getCompanyRoleCode() != null ? roleNames.get(a.getCompanyRoleCode()) : null)
        .build();
  }

  // ── Tài khoản nội bộ ───────────────────────────────────────────────────────

  @Override
  public List<StaffResponse> listStaff(String keyword) {
    Map<String, String> platformNames = platformRoleNames();
    List<Account> accounts;
    if (keyword == null || keyword.isBlank()) {
      accounts = accountRepository.findByAccountType(AccountType.INTERNAL_STAFF);
    } else {
      accounts = accountRepository.searchByKeyword(keyword.trim().toLowerCase());
      if (accounts.size() > 50) accounts = accounts.subList(0, 50);
    }
    return accounts.stream().map(a -> toStaff(a, platformNames)).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public StaffResponse promoteToStaff(Long actorId, Long accountId) {
    Account acc =
        accountRepository
            .findById(accountId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
    acc.setAccountType(AccountType.INTERNAL_STAFF);
    accountRepository.save(acc);
    audit(actorId, "PROMOTE_STAFF", acc.getId(), "Nâng " + acc.getEmail() + " thành nhân sự nội bộ");
    return toStaff(acc, platformRoleNames());
  }

  @Override
  @Transactional
  public StaffResponse createInternalAccount(Long actorId, CreateInternalAccountRequest req) {
    String email = req.getEmail() == null ? "" : req.getEmail().trim().toLowerCase();
    if (email.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không được để trống");
    }
    if (accountRepository.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã tồn tại: " + email);
    }
    if (req.getPassword() == null || req.getPassword().length() < 6) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu tối thiểu 6 ký tự");
    }
    String fullName = req.getFullName() == null ? "" : req.getFullName().trim();
    if (fullName.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên không được để trống");
    }

    Account acc =
        Account.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .fullName(fullName)
            .role(Role.CANDIDATE) // mặc định; nâng ADMIN nếu gán platform role
            .status(AccountStatus.ACTIVE)
            .accountType(AccountType.INTERNAL_STAFF)
            .build();

    // Tuỳ chọn: gán luôn vai trò nền tảng khi tạo (mirror logic assignRole).
    String roleCode = req.getPlatformRoleCode();
    if (roleCode != null && !roleCode.isBlank()) {
      RbacRole role =
          roleRepository
              .findByCode(roleCode)
              .orElseThrow(
                  () ->
                      new ResponseStatusException(
                          HttpStatus.NOT_FOUND, "Không tìm thấy role: " + roleCode));
      if (role.getScope() != PermissionScope.PLATFORM) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Chỉ gán được vai trò nền tảng (PLATFORM)");
      }
      if (role.getStatus() != RoleStatus.ACTIVE) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ gán được role đang ACTIVE");
      }
      if (SUPER_ADMIN.equals(role.getCode())) {
        requireSuperAdmin(actorId, "tạo tài khoản với quyền SUPER_ADMIN");
      }
      acc.setRole(Role.ADMIN);
      acc.setAdminRole(role.getCode());
    }

    Account saved = accountRepository.save(acc);
    audit(
        actorId,
        "CREATE_STAFF",
        saved.getId(),
        "Tạo tài khoản nội bộ "
            + saved.getEmail()
            + (roleCode != null && !roleCode.isBlank() ? " (role " + roleCode + ")" : ""));
    return toStaff(saved, platformRoleNames());
  }

  @Override
  @Transactional
  public void clearPlatformRole(Long actorId, Long accountId) {
    Account acc =
        accountRepository
            .findById(accountId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
    if (SUPER_ADMIN.equals(acc.getAdminRole())) {
      requireSuperAdmin(actorId, "thu hồi quyền của Super Admin");
    }
    acc.setAdminRole(null);
    accountRepository.save(acc);
    audit(actorId, "REVOKE_ROLE", acc.getId(), "Thu hồi platform role của " + acc.getEmail());
  }

  @Override
  public MePermissionsResponse currentUserPermissions(Long accountId) {
    Account acc =
        accountId == null ? null : accountRepository.findById(accountId).orElse(null);
    if (acc == null) {
      return MePermissionsResponse.builder().permissions(List.of()).build();
    }
    boolean superAdmin = SUPER_ADMIN.equals(acc.getAdminRole());
    String roleName =
        acc.getAdminRole() != null ? platformRoleNames().get(acc.getAdminRole()) : null;
    return MePermissionsResponse.builder()
        .accountId(acc.getId())
        .email(acc.getEmail())
        .accountType(
            acc.getAccountType() != null ? acc.getAccountType().name() : AccountType.PUBLIC.name())
        .platformRole(acc.getAdminRole())
        .platformRoleName(roleName)
        .superAdmin(superAdmin)
        .permissions(new ArrayList<>(permissionResolver.effectivePermissions(accountId)))
        .build();
  }

  private Map<String, String> platformRoleNames() {
    Map<String, String> map = new HashMap<>();
    roleRepository
        .findByScopeOrderBySystemRoleDescCreatedAtAsc(PermissionScope.PLATFORM)
        .forEach(r -> map.put(r.getCode(), r.getName()));
    return map;
  }

  private StaffResponse toStaff(Account a, Map<String, String> platformNames) {
    return StaffResponse.builder()
        .accountId(a.getId())
        .email(a.getEmail())
        .fullName(a.getFullName())
        .accountType(a.getAccountType() != null ? a.getAccountType().name() : AccountType.PUBLIC.name())
        .status(a.getStatus() != null ? a.getStatus().name() : null)
        .roleBasic(a.getRole() != null ? a.getRole().normalizedName() : null)
        .platformRoleCode(a.getAdminRole())
        .platformRoleName(a.getAdminRole() != null ? platformNames.get(a.getAdminRole()) : null)
        .build();
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
