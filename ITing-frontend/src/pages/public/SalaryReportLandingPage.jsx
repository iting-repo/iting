import React from 'react';
import { FaChartLine, FaCheckCircle, FaDownload, FaUsers, FaMapMarkedAlt } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import NewsletterSignup from '../../components/common/NewsletterSignup';

/**
 * Lead magnet landing page — "Báo cáo lương IT 2026".
 *
 * Mục đích: dùng PDF salary report làm "magnet" để collect email.
 * User điền email → backend lưu vào newsletter_subscriptions với source=LEAD_MAGNET.
 * Sau đó email gửi link download PDF (Phase 2 sẽ implement).
 */
const SalaryReportLandingPage = () => {
  return (
    <>
      <SEO
        title="Báo cáo lương IT 2026 — Tải miễn phí"
        description="Báo cáo lương IT Việt Nam 2026: 15 vị trí phổ biến, 5 thành phố lớn, theo mức kinh nghiệm. Dữ liệu từ 10.000+ tin tuyển dụng thực tế trên ITing. Tải PDF miễn phí."
        canonical="https://iting.vn/salary-report-2026"
      />

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-4">
                BÁO CÁO ĐỘC QUYỀN
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Báo cáo lương IT<br />
                <span className="text-blue-600">Việt Nam 2026</span>
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Dữ liệu từ <strong>10.000+ tin tuyển dụng</strong> thực tế trên ITing.
                Biết mình đang được trả công đúng giá hay đang bị underpaid.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  '15 vị trí IT phổ biến (Backend, Frontend, DevOps, AI/ML…)',
                  '5 thành phố lớn: HCM, HN, Đà Nẵng, Bình Dương, Cần Thơ',
                  'Phân tích theo mức kinh nghiệm (Fresher → Senior → Lead)',
                  'So sánh lương Việt Nam vs Foreign company',
                  'Xu hướng tuyển dụng + skill in-demand 2026',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  <strong>5.230+</strong> người đã tải
                </span>
                <span className="flex items-center gap-2">
                  <FaMapMarkedAlt className="w-4 h-4" />
                  <strong>5</strong> tỉnh/thành
                </span>
                <span className="flex items-center gap-2">
                  <FaChartLine className="w-4 h-4" />
                  <strong>42</strong> trang
                </span>
              </div>
            </div>

            {/* Signup card */}
            <div>
              <NewsletterSignup
                variant="expanded"
                source="LEAD_MAGNET"
                leadMagnet="salary-report-2026"
                title="📥 Tải báo cáo miễn phí"
                description="Nhập email — link download sẽ được gửi ngay trong 30 giây."
              />
              <p className="text-center text-xs text-slate-500 mt-4">
                🔒 Không spam · Email bảo mật · Hủy đăng ký bất cứ lúc nào
              </p>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="max-w-6xl mx-auto px-4 py-12 bg-white rounded-3xl shadow-sm my-12">
          <h2 className="text-2xl font-bold text-center mb-8">Bên trong báo cáo có gì?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Mức lương theo vị trí', desc: 'Median, P25, P75, P90 cho 15 vị trí IT phổ biến.' },
              { title: 'So sánh theo tỉnh thành', desc: 'Lương ở HCM cao hơn HN bao nhiêu? Đà Nẵng đang lên.' },
              { title: 'Kỹ năng được trả cao', desc: 'Top 20 tech stack có salary premium 2026.' },
              { title: 'Junior → Senior', desc: 'Lương tăng bao nhiêu % qua mỗi mức kinh nghiệm.' },
              { title: 'VN vs Foreign company', desc: 'Trả lương gấp 2x — nhưng OT 3x. So sánh full picture.' },
              { title: 'Xu hướng 2026', desc: 'AI/ML, DevOps, Blockchain — vị trí nào hot nhất?' },
            ].map((item) => (
              <div key={item.title} className="p-4 border border-slate-100 rounded-xl">
                <FaDownload className="w-5 h-5 text-blue-500 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default SalaryReportLandingPage;
