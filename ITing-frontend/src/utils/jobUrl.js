import { API_BASE_URL } from "../config";

export const slugify = (value = "") =>
  String(value)
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const getJobTitle = (job = {}) =>
  job?.title || job?.position || job?.jobTitle || "chi-tiet-viec-lam";

export const getJobPublicKey = (job = {}) =>
  job?.public_id ||
  job?.publicId ||
  job?.jobKey ||
  job?.publicKey ||
  job?.id ||
  "";

export const normalizeJobKey = (jobKey = "") =>
  String(jobKey).replace(/\.html$/i, "");

export const buildJobDetailPath = (job = {}) => {
  const slug = slugify(getJobTitle(job)) || "chi-tiet-viec-lam";
  const jobKey = getJobPublicKey(job);

  return `/viec-lam/${slug}/${jobKey}.html`;
};

export const buildEmployerJobApplicationsPath = (job = {}) => {
  const slug = slugify(getJobTitle(job)) || "chi-tiet-viec-lam";
  const jobKey = getJobPublicKey(job);

  return `/employer/job/${slug}/${jobKey}/applications`;
};

export const getCompanyLogoUrl = (logoPath) => {
  const DEFAULT_LOGO = "/assets/default-company.png";
  
  if (!logoPath || logoPath === 'null' || logoPath === 'undefined' || logoPath === '') {
    return DEFAULT_LOGO;
  }
  
  if (logoPath.startsWith("http") && !logoPath.includes("logo.clearbit.com") && !logoPath.includes("via.placeholder.com")) {
    return logoPath;
  }
  
  // If it's a relative path, prefix with backend URL
  const baseUrl = API_BASE_URL.replace("/api", "");
  
  if (logoPath.startsWith("https://logo.clearbit.com") || logoPath.startsWith("https://via.placeholder.com")) {
      return DEFAULT_LOGO;
  }

  return `${baseUrl}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};
