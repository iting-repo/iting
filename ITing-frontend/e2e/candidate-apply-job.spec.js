const path = require("path");
const { test, expect } = require("@playwright/test");
const { mockAuthApis, mockCommonApis } = require("./helpers/mock-api");

const candidateEmail = "nguyenvana@gmail.com";
const candidatePassword = "123456";
const jobDetailUrl = "/viec-lam/ky-su-phat-trien-phan-mem-c-c-java-golang-python/2099682.html";

const cvLibrary = [
  {
    id: 101,
    title: "CV gần nhất của Nguyễn Văn A",
    fileUrl: "https://files.example.com/nguyen-van-a-recent-cv.pdf",
  },
  {
    id: 202,
    title: "CV trong thư viện của Nguyễn Văn A",
    fileUrl: "https://files.example.com/nguyen-van-a-library-cv.pdf",
  },
];

async function fulfillJson(route, data) {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(data),
  });
}

async function mockCandidateApplyApis(page, applications) {
  await page.route("**/api/user/profile", async (route) => {
    await fulfillJson(route, {
      userId: 20,
      fullName: "Nguyen Van A",
      email: candidateEmail,
      phoneNum: "0909123456",
      avatarUrl: "",
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await fulfillJson(route, {
      token: "playwright-login-token",
      accessToken: "playwright-login-token",
      email: candidateEmail,
      role: "CANDIDATE",
      name: "Nguyen Van A",
      fullName: "Nguyen Van A",
      phoneNum: "0909123456",
    });
  });

  await page.route("**/api/candidates/applications/check/1", async (route) => {
    await fulfillJson(route, { hasApplied: false });
  });

  await page.route("**/api/candidates/cvs/recent", async (route) => {
    await fulfillJson(route, cvLibrary);
  });

  await page.route("**/api/candidates/cvs/upload", async (route) => {
    await fulfillJson(route, {
      id: 303,
      title: "CV Nguyễn Văn A tải lên",
      fileUrl: "https://files.example.com/nguyen-van-a-upload-cv.pdf",
    });
  });

  await page.route("**/api/candidates/applications/apply", async (route) => {
    const payload = JSON.parse(route.request().postData() || "{}");
    applications.push(payload);

    await fulfillJson(route, {
      id: 501,
      status: "PENDING",
      ...payload,
    });
  });
}

async function loginAsCandidate(page) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(candidateEmail);
  await page.locator('input[type="password"]').fill(candidatePassword);
  await page.locator('button[type="submit"]').click();

  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("user_role")))
    .toBe("CANDIDATE");
}

async function openApplyModal(page) {
  await page.goto(jobDetailUrl);
  await expect(page.getByRole("heading", { name: /C\/C\+\+ Java Golang Python/ })).toBeVisible();

  await page.locator("button").filter({ hasText: /Ngay/i }).first().click();

  const modal = page.locator(".fixed.inset-0").filter({
    has: page.locator("textarea"),
  });
  await expect(modal).toBeVisible();
  return modal;
}

async function submitApplication(modal) {
  await modal
    .locator("textarea")
    .fill("Nguyen Van A muon ung tuyen vi tri nay va co kinh nghiem phu hop.");

  await modal.getByRole("button").last().click();
  await expect(modal).toBeHidden();
}

test.describe("Ứng viên ứng tuyển việc làm", () => {
  let applications;

  test.beforeEach(async ({ page }) => {
    applications = [];
    await mockCommonApis(page);
    await mockAuthApis(page, "CANDIDATE");
    await mockCandidateApplyApis(page, applications);
  });

  test("ứng viên ứng tuyển bằng CV gần nhất", async ({ page }) => {
    await loginAsCandidate(page);
    const modal = await openApplyModal(page);

    await expect(modal.getByText("CV gần nhất của Nguyễn Văn A")).toBeVisible();
    await submitApplication(modal);

    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
      jobId: 1,
      cvId: 101,
      cvUrl: "https://files.example.com/nguyen-van-a-recent-cv.pdf",
    });
  });

  test("ứng viên ứng tuyển bằng CV trong thư viện", async ({ page }) => {
    await loginAsCandidate(page);
    const modal = await openApplyModal(page);

    await modal.locator(".border.rounded-lg.p-4.cursor-pointer").nth(1).click();
    await modal.getByText("CV trong thư viện của Nguyễn Văn A").click();
    await submitApplication(modal);

    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
      jobId: 1,
      cvId: 202,
      cvUrl: "https://files.example.com/nguyen-van-a-library-cv.pdf",
    });
  });

  test("ứng viên tải lên CV PDF rồi ứng tuyển", async ({ page }) => {
    await loginAsCandidate(page);
    const modal = await openApplyModal(page);

    await modal.locator(".border.rounded-lg.p-4.cursor-pointer").nth(2).click();
    await modal
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, "fixtures", "nguyen-van-a-cv.pdf"));
    await expect(modal.getByText("nguyen-van-a-cv.pdf")).toBeVisible();

    await submitApplication(modal);

    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
      jobId: 1,
      cvId: 303,
      cvUrl: "https://files.example.com/nguyen-van-a-upload-cv.pdf",
    });
  });
});
