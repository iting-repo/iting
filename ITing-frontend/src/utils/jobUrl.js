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
