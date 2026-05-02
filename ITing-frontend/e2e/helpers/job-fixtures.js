const primaryJob = {
  id: 1,
  public_id: '2099682',
  title: 'Kỹ sư phát triển phần mềm C/C++ Java Golang Python',
  position: 'Kỹ sư phát triển phần mềm C/C++ Java Golang Python',
  companyName: 'ITing Software',
  companyLogo: 'https://via.placeholder.com/100',
  jobType: 'FULL_TIME',
  experienceLevel: 'SENIOR',
  minSalary: 25000000,
  maxSalary: 40000000,
  dueDate: '2026-12-30',
  location: 'Hồ Chí Minh',
  techRequired: ['C/C++', 'Java', 'Golang', 'Python'],
  description: 'Thiết kế hệ thống\nPhát triển tính năng\nTối ưu hiệu năng',
  createdAt: '2026-04-01T08:00:00.000Z',
  applicationCount: 12,
  status: 'ACTIVE',
  aiReview: {
    status: 'APPROVED',
    score: 0.04,
    reason: 'AI không phát hiện nội dung nhạy cảm.',
    action: 'AUTO_APPROVE_CANDIDATE_VISIBLE',
    sensitiveTerms: [],
  },
};

const employerJobsPage = {
  content: [primaryJob],
  totalElements: 1,
  totalPages: 1,
  size: 50,
  number: 0,
};

const employerApplicationsPage = {
  content: [
    {
      id: 501,
      applicantName: 'Nguyễn Văn A',
      avatarUrl: 'https://via.placeholder.com/80',
      jobTitle: primaryJob.title,
      yearsExperience: 4,
      education: 'Đại học Bách Khoa',
      timeSent: '2026-04-01T10:00:00.000Z',
      status: 'PENDING',
    },
  ],
  totalElements: 1,
};

const companyProfile = {
  id: 10,
  name: 'ITing Software',
  logoUrl: 'https://via.placeholder.com/120',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  description: 'Nền tảng tuyển dụng ngành CNTT',
  website: 'https://iting.vn',
  companyEmail: 'hello@iting.vn',
  industry: 'Phần mềm',
  companySize: '51-100',
  phone: '0909123456',
  representativeName: 'Lê Quản Trị',
  representativeGender: 'MALE',
  representativePhone: '0909888777',
  accountEmail: 'owner@iting.vn',
  taxCode: '0312345678',
  businessLicenseFileUrl: '',
  businessLicenseDocumentType: 'BUSINESS_LICENSE',
  businessLicensePreviewUrl: '',
  consentDocumentFileUrl: '',
  verificationLevel: 'VERIFIED_LEVEL_1',
  companyInfoUpdateStatus: 'DRAFT',
  lastUpdateRequestDate: '2026-04-02T14:05:50.596Z',
  lastUpdate: '2026-04-02T14:05:50.596Z',
  active: true,
  profileSetup: true,
};

const candidateApplicationsPage = {
  content: [
    {
      id: 801,
      companyName: 'ITing Software',
      jobPosition: primaryJob.title,
      appliedAt: '2026-04-02T09:00:00.000Z',
      status: 'PENDING',
    },
  ],
  totalElements: 1,
};

const adminUsersPage = {
  content: [
    {
      id: 101,
      fullName: 'Nguyen Candidate',
      email: 'candidate@example.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-04-01T08:00:00.000Z',
      lastLoginAt: '2026-04-03T09:00:00.000Z',
    },
    {
      id: 102,
      companyName: 'ITing Employer',
      email: 'employer@example.com',
      role: 'COMPANY',
      status: 'BANNED',
      createdAt: '2026-03-25T08:00:00.000Z',
      lastLoginAt: '2026-04-02T16:00:00.000Z',
    },
  ],
  totalElements: 2,
  totalPages: 1,
};

const adminJobsPage = {
  content: [
    {
      id: 201,
      public_id: '2099682',
      position: 'Backend Engineer',
      title: 'Backend Engineer',
      companyName: 'ITing Software',
      company: 'ITing Software',
      location: 'Ho Chi Minh',
      status: 'PENDING',
      aiReview: {
        status: 'APPROVED',
        score: 0.03,
        reason: 'AI đề xuất phê duyệt, admin chỉ cần kiểm tra lại.',
        action: 'AUTO_APPROVE_AFTER_ADMIN_DOUBLE_CHECK',
        sensitiveTerms: [],
      },
      techRequired: ['Java', 'Spring Boot'],
      description: 'Build backend services',
    },
    {
      id: 202,
      public_id: '2099683',
      position: 'Frontend Engineer',
      title: 'Frontend Engineer',
      companyName: 'ITing Software',
      company: 'ITing Software',
      location: 'Da Nang',
      status: 'ACTIVE',
      aiReview: {
        status: 'CLEANED',
        score: 0.31,
        reason: 'AI đã loại bỏ một số cụm từ nhạy cảm trong mô tả.',
        action: 'REVIEW_CLEANED_CONTENT',
        sensitiveTerms: ['cam kết lương cao'],
        cleanedDescription: 'Build frontend interfaces with clear role expectations.',
      },
      techRequired: ['React', 'Tailwind'],
      description: 'Build frontend interfaces',
    },
  ],
  totalElements: 2,
  totalPages: 1,
};

const adminCompaniesPage = {
  content: [
    {
      id: 'CMP-001',
      name: 'ITing Software',
      taxCode: '0312345678',
      companyEmail: 'hello@iting.vn',
      representativeName: 'Le Quan Tri',
      representativePhone: '0909888777',
      verificationLevel: 'BASIC',
      companyInfoUpdateStatus: 'PENDING_REVIEW',
      active: true,
      businessLicenseFileUrl: 'https://files.example.com/license.pdf',
      description: 'Recruitment platform for tech jobs',
      industry: 'Software',
      companySize: '51-100',
      lastUpdateRequestDate: '2026-04-02T14:05:50.596Z',
    },
    {
      id: 'CMP-002',
      name: 'Another Tech',
      taxCode: '0399999999',
      companyEmail: 'contact@another.tech',
      representativeName: 'Tran Thi B',
      representativePhone: '0909000000',
      verificationLevel: 'VERIFIED',
      companyInfoUpdateStatus: 'SUSPENDED',
      active: false,
      businessLicenseFileUrl: 'https://files.example.com/license-2.pdf',
      description: 'Software outsourcing company',
      industry: 'Software',
      companySize: '11-50',
      lastUpdateRequestDate: '2026-04-01T10:05:50.596Z',
    },
  ],
  totalElements: 2,
  totalPages: 1,
};

module.exports = {
  primaryJob,
  employerJobsPage,
  employerApplicationsPage,
  companyProfile,
  candidateApplicationsPage,
  adminUsersPage,
  adminJobsPage,
  adminCompaniesPage,
};
