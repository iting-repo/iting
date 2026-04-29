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
  job?.jobId ||
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

export const getCompanyLogoUrl = (logoPath, companyName = "") => {
  const DEFAULT_LOGO = "/assets/default-company.png";
  
  // Use UI Avatars as a clean, dynamic fallback for missing logos
  const UI_AVATAR = companyName 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=3AB4E6&color=fff&bold=true` 
    : DEFAULT_LOGO;

  if (!logoPath || logoPath === 'null' || logoPath === 'undefined' || logoPath === '') {
    return UI_AVATAR;
  }
  
  if (logoPath.startsWith("http")) {
    // Basic validation for common placeholders if they are considered "bad" now
    if (logoPath.includes("via.placeholder.com") && companyName) {
        return UI_AVATAR;
    }
    return logoPath;
  }
  
  // Handle relative paths
  const baseUrl = API_BASE_URL.replace("/api", "");
  return `${baseUrl}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};
