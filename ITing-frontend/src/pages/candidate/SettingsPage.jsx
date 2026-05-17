import React from 'react';
import SEO from '../../components/common/SEO';
import GdprExportButton from '../../components/settings/GdprExportButton';

/**
 * Candidate Settings page — currently focused on data & privacy controls.
 * More sections (notifications, security, deletion) can be added later.
 */
const SettingsPage = () => {
  return (
    <>
      <SEO title="Cài đặt tài khoản" noIndex />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Cài đặt</h1>
        <p className="text-sm text-slate-500 mb-6">
          Quản lý dữ liệu cá nhân và quyền riêng tư của bạn.
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Dữ liệu & quyền riêng tư</h2>
          <GdprExportButton />
        </section>
      </div>
    </>
  );
};

export default SettingsPage;
