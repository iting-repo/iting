import React from 'react';
import { FaFlask, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import SEO from '../../../components/common/SEO';

/**
 * A/B Test Dashboard — currently a documentation page since experiment metrics
 * are stored in GA4 (events: experiment_exposure + experiment_conversion).
 *
 * Lists active experiments in code + how to view results in GA4.
 */
const ACTIVE_EXPERIMENTS = [
  {
    id: 'exit_intent_popup',
    name: 'Exit-Intent Popup Variants',
    status: 'Running',
    variants: [
      { code: 'A', desc: 'Original "Đợi đã! 🎁" + Salary Report (control)' },
      { code: 'B', desc: 'Job-focused "10 việc làm IT hot tuần này 💼"' },
      { code: 'C', desc: 'Urgency/Value "Bạn xứng đáng mức lương cao hơn 📈"' },
    ],
    conversion: 'newsletter_subscribe → apply_job',
    file: 'src/components/common/ExitIntentPopup.jsx',
  },
];

const AbTestDashboardPage = () => {
  return (
    <>
      <SEO title="A/B Test Dashboard" noIndex />

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FaFlask className="text-purple-500" /> A/B Test Dashboard
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Active experiments + nơi xem kết quả phân tích.
        </p>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <FaInfoCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Cách thức hoạt động:</strong> Mỗi user lần đầu vào trang được assign
            random vào 1 variant (lưu trong <code>localStorage</code>). Metric tracking qua
            GA4 events <code>experiment_exposure</code> và <code>experiment_conversion</code>.
            Xem kết quả tại GA4 → Reports → Engagement → Events.
          </div>
        </div>

        {/* Experiments list */}
        <div className="space-y-4">
          {ACTIVE_EXPERIMENTS.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl ring-1 ring-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{exp.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    ID: <code>{exp.id}</code>
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {exp.status}
                </span>
              </div>

              {/* Variants */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Variants</div>
                <div className="space-y-1">
                  {exp.variants.map((v) => (
                    <div key={v.code} className="flex gap-2 text-sm">
                      <span className="font-mono font-bold text-purple-600 w-6">{v.code}</span>
                      <span className="text-slate-700">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Conversion event:</span>{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded">{exp.conversion}</code>
                </div>
                <div>
                  <span className="text-slate-500">Code file:</span>{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded">{exp.file}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GA4 link */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <h3 className="font-bold text-slate-900 mb-2">📊 Xem kết quả phân tích</h3>
          <p className="text-sm text-slate-600 mb-3">
            Mở GA4 → Explore → Free form report → Dimensions: <code>experiment</code>, <code>variant</code> → Metric: <code>Event count</code>.
            So sánh tỷ lệ <code>experiment_conversion / experiment_exposure</code> giữa các variant để chọn winner.
          </p>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
          >
            Mở GA4 <FaExternalLinkAlt className="w-3 h-3" />
          </a>
        </div>

        {/* How to add new experiment */}
        <div className="mt-6 bg-slate-50 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-2">➕ Cách thêm experiment mới</h3>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>
              Trong component, import:{' '}
              <code className="bg-white px-1.5 py-0.5 rounded text-xs">getVariant, trackVariantConversion</code>{' '}
              từ <code>utils/abTest.js</code>
            </li>
            <li>Gọi <code>getVariant('my_experiment_id', ['A', 'B'])</code> để get variant</li>
            <li>Render UI khác nhau cho từng variant</li>
            <li>Khi user convert → gọi <code>trackVariantConversion('my_experiment_id', 'conversion_type')</code></li>
            <li>Update <code>ACTIVE_EXPERIMENTS</code> list trong file này</li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default AbTestDashboardPage;
