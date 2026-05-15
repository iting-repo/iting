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
  // Use UI Avatars as a clean, dynamic fallback for missing logos
  const UI_AVATAR = companyName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=3AB4E6&color=fff&bold=true`
    : `https://ui-avatars.com/api/?name=Company&background=3AB4E6&color=fff&bold=true`;

  // Check for placeholder/default images - treat them as missing
  if (!logoPath || logoPath === 'null' || logoPath === 'undefined' || logoPath === '') {
    return UI_AVATAR;
  }

  const normalizedLogoPath = String(logoPath);

  // Check for known placeholder/default paths - these should use UI_AVATAR instead
  if (normalizedLogoPath.includes('default-company') || normalizedLogoPath.includes('placeholder')) {
    return UI_AVATAR;
  }
  
  if (normalizedLogoPath.startsWith("http")) {
    // Basic validation for common placeholders if they are considered "bad" now
    if (normalizedLogoPath.includes("via.placeholder.com") && companyName) {
        return UI_AVATAR;
    }
    return normalizedLogoPath;
  }
  
  // Handle relative paths
  const baseUrl = API_BASE_URL.replace("/api", "");
  const result = `${baseUrl}${normalizedLogoPath.startsWith("/") ? "" : "/"}${normalizedLogoPath}`;
  return result;
};
