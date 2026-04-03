const {
  primaryJob,
  employerJobsPage,
  employerApplicationsPage,
  companyProfile,
  candidateApplicationsPage,
  adminUsersPage,
  adminJobsPage,
  adminCompaniesPage,
} = require('./job-fixtures');

async function fulfillJson(route, data, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });
}

async function mockCommonApis(page) {
  await page.route('**/api/jobs/search**', async (route) => {
    await fulfillJson(route, employerJobsPage);
  });

  await page.route('**/api/jobs/latest**', async (route) => {
    await fulfillJson(route, [primaryJob]);
  });

  await page.route('**/api/jobs/2099682', async (route) => {
    await fulfillJson(route, primaryJob);
  });

  await page.route('**/api/jobs/1', async (route) => {
    await fulfillJson(route, primaryJob);
  });

  await page.route('**/api/companies/me', async (route) => {
    if (route.request().method() === 'GET') {
      await fulfillJson(route, companyProfile);
      return;
    }

    await route.fallback();
  });
}

async function mockEmployerApis(page) {
  await page.route('**/api/employer/jobs/my-jobs**', async (route) => {
    await fulfillJson(route, employerJobsPage);
  });

  await page.route('**/api/employer/applications/job/2099682**', async (route) => {
    await fulfillJson(route, employerApplicationsPage);
  });

  await page.route('**/api/employer/applications/job/1**', async (route) => {
    await fulfillJson(route, employerApplicationsPage);
  });
}

async function mockCandidateApis(page) {
  await page.route('**/api/applications/my-applications**', async (route) => {
    await fulfillJson(route, candidateApplicationsPage);
  });

  await page.route('**/api/api/applications/my-applications**', async (route) => {
    await fulfillJson(route, candidateApplicationsPage);
  });
}

async function mockAdminApis(page) {
  await page.route('**/api/admin/users**', async (route) => {
    await fulfillJson(route, adminUsersPage);
  });

  await page.route('**/api/admin/users/101/ban', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/users/102/unban', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/users/101', async (route) => {
    if (route.request().method() === 'DELETE') {
      await fulfillJson(route, { success: true });
      return;
    }

    await fulfillJson(route, adminUsersPage.content[0]);
  });

  await page.route('**/api/admin/users/102', async (route) => {
    await fulfillJson(route, adminUsersPage.content[1]);
  });

  await page.route('**/api/admin/jobs**', async (route) => {
    await fulfillJson(route, adminJobsPage);
  });

  await page.route('**/api/admin/jobs/201', async (route) => {
    await fulfillJson(route, adminJobsPage.content[0]);
  });

  await page.route('**/api/admin/jobs/202', async (route) => {
    await fulfillJson(route, adminJobsPage.content[1]);
  });

  await page.route('**/api/admin/jobs/201/approve', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/jobs/201/reject', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/jobs/201/request-revision', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/jobs/201/close', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/companies**', async (route) => {
    await fulfillJson(route, adminCompaniesPage);
  });

  await page.route('**/api/admin/companies/CMP-001', async (route) => {
    await fulfillJson(route, adminCompaniesPage.content[0]);
  });

  await page.route('**/api/admin/companies/CMP-002', async (route) => {
    await fulfillJson(route, adminCompaniesPage.content[1]);
  });

  await page.route('**/api/admin/companies/CMP-001/approve', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/companies/CMP-001/reject', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/companies/CMP-001/request-resubmission', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/companies/CMP-002/unsuspend', async (route) => {
    await fulfillJson(route, { success: true });
  });

  await page.route('**/api/admin/companies/CMP-001/suspend', async (route) => {
    await fulfillJson(route, { success: true });
  });
}

async function mockAuthApis(page, role = 'CANDIDATE') {
  await page.route('**/api/auth/login', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');

    await fulfillJson(route, {
      token: 'playwright-login-token',
      accessToken: 'playwright-login-token',
      email: body.email,
      role,
      name: role === 'ADMIN' ? 'Playwright Admin' : 'Playwright User',
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await fulfillJson(route, {
      token: 'playwright-login-token',
      accessToken: 'playwright-login-token',
      email: 'playwright@example.com',
      role,
      name: role === 'ADMIN' ? 'Playwright Admin' : 'Playwright User',
    });
  });
}

async function setEmployerSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'playwright-token');
    localStorage.setItem('user_role', 'EMPLOYER');
    localStorage.setItem(
      'user_info',
      JSON.stringify({
        id: 10,
        name: 'ITing Employer',
        role: 'EMPLOYER',
      }),
    );
  });
}

async function setCandidateSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'playwright-token');
    localStorage.setItem('user_role', 'CANDIDATE');
    localStorage.setItem(
      'user_info',
      JSON.stringify({
        id: 20,
        name: 'Playwright Candidate',
        role: 'CANDIDATE',
      }),
    );
  });
}

async function setAdminSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'playwright-token');
    localStorage.setItem('user_role', 'ADMIN');
    localStorage.setItem(
      'user_info',
      JSON.stringify({
        id: 1,
        name: 'Playwright Admin',
        role: 'ADMIN',
      }),
    );
  });
}

module.exports = {
  fulfillJson,
  mockCommonApis,
  mockEmployerApis,
  mockCandidateApis,
  mockAdminApis,
  mockAuthApis,
  setEmployerSession,
  setCandidateSession,
  setAdminSession,
};
