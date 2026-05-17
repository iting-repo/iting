import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component – quản lý meta tags cho từng trang.
 *
 * @param {string}  title       – Tiêu đề trang (sẽ tự nối thêm " | ITing")
 * @param {string}  description – Mô tả cho thẻ meta description
 * @param {string}  keywords    – Từ khoá SEO (phân tách bằng dấu phẩy)
 * @param {string}  canonical   – URL canonical (tuỳ chọn)
 * @param {string}  ogImage     – Ảnh thumbnail cho Open Graph
 * @param {string}  ogType      – og:type (mặc định "website")
 * @param {boolean} noIndex     – Nếu true sẽ thêm noindex,nofollow
 * @param {object}  children    – Thẻ Helmet con tuỳ ý
 */
const SEO = ({
  title,
  description = 'ITing – Nền tảng tuyển dụng IT hàng đầu Việt Nam. Tìm việc làm công nghệ, kết nối nhà tuyển dụng và ứng viên IT nhanh chóng.',
  keywords = 'việc làm IT, tuyển dụng công nghệ, tìm việc developer, ITing, IT jobs Vietnam',
  canonical,
  ogImage = '/assets/og-image.png',
  ogType = 'website',
  noIndex = false,
  jsonLd,
  children,
}) => {
  const fullTitle = title ? `${title} | ITing` : 'ITing – Tuyển dụng IT hàng đầu Việt Nam';

  return (
    <Helmet>
      {/* Cơ bản */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content="ITing" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data (Schema.org) — accept single obj or array */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}

      {children}
    </Helmet>
  );
};

/**
 * Helper builder: Organization JSON-LD cho HomePage / About / Contact.
 */
export const buildOrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ITing',
  url: 'https://iting.vn',
  logo: 'https://iting.vn/assets/logo.png',
  sameAs: [
    'https://www.facebook.com/iting.vn',
    'https://www.linkedin.com/company/iting',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@iting.vn',
    availableLanguage: ['Vietnamese', 'English'],
  },
});

/**
 * Helper builder: JobPosting JSON-LD cho JobDetailPage (Google for Jobs).
 * Quan trọng cho SEO — Google sẽ index job và show ở rich results.
 */
export const buildJobPostingJsonLd = (job) => {
  if (!job) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || '',
    datePosted: job.createdAt,
    validThrough: job.dueDate,
    employmentType: job.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.name,
      sameAs: job.company?.webLink,
      logo: job.company?.logoUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.province || job.location,
        addressCountry: 'VN',
      },
    },
    baseSalary: (job.minSalary && job.maxSalary) ? {
      '@type': 'MonetaryAmount',
      currency: 'VND',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.minSalary,
        maxValue: job.maxSalary,
        unitText: job.salaryType === 'MONTH' ? 'MONTH' : 'YEAR',
      },
    } : undefined,
  };
};

export default SEO;
