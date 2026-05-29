import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import publicService from '../../services/publicService';
import { GlobalLoading } from '../../components/common';
import { Search, Briefcase, FileText, ArrowRight, Clock, ChevronRight, TrendingUp, BookOpen, Eye } from 'lucide-react';

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

const categories = ["Tất cả", "Tin tức", "Bí quyết viết CV", "Phỏng vấn", "Xu hướng", "Lương thưởng"];

/* ── helper ── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  return h > 0 ? `${h} giờ trước` : 'Vừa xong';
}

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */
export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchBlogs = async (keyword = '') => {
    try {
      setLoading(true);
      const params = { page: 0, size: 20 };
      if (keyword.trim()) params.keyword = keyword.trim();
      const res = await publicService.getBlogs(params);
      const d = res.data || res;
      setBlogs(d?.content ?? (Array.isArray(d) ? d : []));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchBlogs(searchQuery);
    }
  };

  if (loading) return <GlobalLoading message="Đang tải bài viết..." />;

  // Filter by category
  const filtered = active === 0
    ? blogs
    : blogs.filter(b => b.category === categories[active]);

  const hero    = filtered[0];
  const sub     = filtered.slice(1, 3);
  const latest  = filtered.slice(3, 9);
  const popular = [...filtered].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 3);
  const guide   = filtered.slice(9, 13);
  const trends  = filtered.slice(0, 4);

  const go = (blog) => {
    if (!blog) return;
    // Fire-and-forget view tracking
    if (blog.id) publicService.trackBlogView(blog.id);
    navigate(`/blog/${blog.slug}`);
  };
  const img = (b, sz = 600) => b?.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b?.category || 'Blog')}&background=3AB4E6&color=fff&size=${sz}`;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">

      {/* ─── HEADER ─── */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14 md:h-16">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl md:text-2xl text-[#3AB4E6]">iTing</span>
            <span className="font-extrabold text-xl md:text-2xl text-gray-900">Blog</span>
          </Link>
          <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-72 border border-gray-200 focus-within:border-[#3AB4E6] focus-within:ring-2 focus-within:ring-[#3AB4E6]/20 transition-all">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
            />
          </div>
          <button type="button" aria-label="Tìm kiếm" onClick={() => handleSearch({ key: 'Enter' })} className="md:hidden bg-gray-100 p-2 rounded-full hover:bg-gray-200"><Search className="h-4 w-4" /></button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-[#0f2b5e] via-[#1E3A8A] to-[#3AB4E6] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/3 -right-1/4 w-[60%] h-[120%] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <img src="/jobportal.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] blur-[2px] mix-blend-luminosity" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-xl">
              Bí quyết tìm việc<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">thành công</span>
            </h1>
            <p className="text-blue-200/80 text-sm md:text-base mt-3 max-w-md">Cập nhật xu hướng, kỹ năng và chia sẻ hữu ích cho sự nghiệp của bạn</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map((c, i) => (
                <button key={c} onClick={() => setActive(i)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${active === i ? 'bg-white text-[#1E3A8A] shadow-lg' : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'}`}>
                  {c}
                </button>
              ))}
            </div>
        </div>
      </section>

      {/* ─── FEATURED BENTO ─── */}
      {hero && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-[#3AB4E6] rounded-full" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Bài viết nổi bật</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
              {/* Main */}
              <div onClick={() => go(hero)} className="md:col-span-7 group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl min-h-[280px] md:min-h-[420px]">
                <img src={img(hero, 900)} alt={hero.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5 md:p-8">
                  <span className="inline-block text-[10px] md:text-xs font-bold text-white bg-[#3AB4E6] px-3 py-1 rounded-full uppercase mb-3">{hero.category || 'Nghề nghiệp'}</span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-white leading-tight line-clamp-2 mb-2">{hero.title}</h2>
                  <p className="text-white/60 text-xs md:text-sm line-clamp-2 max-w-lg hidden sm:block">{hero.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-white/50 text-xs">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(hero.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatViews(hero.viewCount)} lượt xem</span>
                  </div>
                </div>
              </div>
              {/* Side */}
              <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
                {sub.map((b, i) => (
                  <div key={i} onClick={() => go(b)} className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg min-h-[180px] md:min-h-[198px]">
                    <img src={img(b)} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 p-4 md:p-5">
                      <span className="inline-block text-[9px] md:text-[10px] font-bold text-white bg-[#3AB4E6]/90 px-2 py-0.5 rounded-full uppercase mb-2">{b.category || 'Tin tức'}</span>
                      <h3 className="text-sm md:text-base font-bold text-white leading-snug line-clamp-2">{b.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-white/50 text-[10px]">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(b.createdAt)}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatViews(b.viewCount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── LATEST ─── */}
        <section className="py-10 md:py-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1"><BookOpen className="h-5 w-5 text-[#3AB4E6]" /><h2 className="text-xl md:text-2xl font-bold text-gray-900">Bài viết mới nhất</h2></div>
              <p className="text-gray-400 text-sm">Những bài viết vừa được xuất bản</p>
            </div>
            <span className="text-sm text-[#3AB4E6] font-semibold hover:underline cursor-pointer hidden sm:flex items-center gap-1">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {latest.map((b, i) => (
              <div key={i} onClick={() => go(b)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col border border-gray-100 hover:border-[#3AB4E6]/30">
                <div className="overflow-hidden relative">
                  <img src={img(b)} alt={b.title} className="w-full h-44 md:h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 text-[9px] font-bold text-white bg-[#3AB4E6] px-2.5 py-1 rounded-full uppercase">{b.category || 'Tin tức'}</span>
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-grow">
                  <h3 className="text-sm md:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#3AB4E6] transition-colors min-h-[2.5rem]">{b.title}</h3>
                  {b.summary && <p className="text-gray-400 text-xs mt-2 line-clamp-2 flex-grow">{b.summary}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-gray-400 text-[11px]">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(b.createdAt)}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatViews(b.viewCount)}</span>
                    </div>
                    <span className="text-[#3AB4E6] text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Đọc thêm <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── POPULAR + CTA ─── */}
        <section className="pb-10 md:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Popular */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 md:p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-5 w-5 text-orange-500" /><h2 className="text-lg md:text-xl font-bold text-gray-900">Bài viết xem nhiều</h2></div>
              <p className="text-gray-400 text-xs mb-4">Được đọc nhiều nhất trong tuần</p>
              {popular.map((b, i) => (
                <div key={i} onClick={() => go(b)} className="flex gap-4 py-4 items-center group cursor-pointer border-b border-gray-50 last:border-0 hover:bg-blue-50/40 -mx-3 px-3 rounded-xl transition-colors">
                  <span className="text-2xl md:text-3xl font-black text-gray-200 group-hover:text-[#3AB4E6]/30 transition-colors w-8 text-center flex-shrink-0">{String(i+1).padStart(2,'0')}</span>
                  <img src={img(b,200)} alt={b.title} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm md:text-[15px] font-bold text-gray-900 group-hover:text-[#3AB4E6] transition-colors line-clamp-2 leading-snug">{b.title}</h4>
                    <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatViews(b.viewCount)} lượt xem</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(b.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#3AB4E6] transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
            {/* CTAs */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3AB4E6] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex-1">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <img src="/lookup-removebg-preview.png" alt="" className="absolute right-0 bottom-0 w-40 h-40 object-contain opacity-[0.12] blur-[1px]" />
                <h3 className="text-xl md:text-2xl font-extrabold mb-2 relative z-10">Hơn 60.000+<br/>Việc làm</h3>
                <p className="text-sm text-white/70 mb-5 relative z-10">Đang chờ đợi bạn ứng tuyển.</p>
                <Link to="/jobs" className="relative z-10 inline-flex items-center gap-2 bg-white text-[#1E3A8A] font-bold py-2.5 px-6 rounded-full hover:shadow-lg transition-all text-sm">Khám phá ngay <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex-1">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <img src="/cv-removebg-preview.png" alt="" className="absolute right-0 bottom-0 w-40 h-40 object-contain opacity-[0.12] blur-[1px]" />
                <h3 className="text-xl md:text-2xl font-extrabold mb-2 relative z-10">Tạo CV<br/>Nổi Bật</h3>
                <p className="text-sm text-white/60 mb-5 relative z-10">Gây ấn tượng với nhà tuyển dụng.</p>
                <button type="button" onClick={() => navigate('/candidate/profile')} className="relative z-10 inline-flex items-center gap-2 bg-white text-gray-900 font-bold py-2.5 px-6 rounded-full hover:shadow-lg transition-all text-sm">Tạo CV Miễn Phí <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CAREER GUIDE ─── */}
        <section className="pb-10 md:pb-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Cẩm nang nghề nghiệp</h2>
              <p className="text-gray-400 text-sm mt-1">Kiến thức & kỹ năng thiết yếu</p>
            </div>
            <span className="text-sm text-[#3AB4E6] font-semibold hover:underline cursor-pointer hidden sm:flex items-center gap-1">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {guide.map((b, i) => (
              <div key={i} onClick={() => go(b)} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:border-[#3AB4E6]/30">
                <div className="overflow-hidden"><img src={img(b,400)} alt={b.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-3 md:p-4">
                  <span className="text-[9px] font-bold text-[#3AB4E6] uppercase">{b.category || 'Cẩm nang'}</span>
                  <h3 className="text-xs md:text-sm font-bold text-gray-900 leading-snug line-clamp-2 mt-1 group-hover:text-[#3AB4E6] transition-colors">{b.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── TRENDS (full-width dark) ─── */}
      <section className="bg-[#0a192f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(58,180,230,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(58,180,230,.12) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div><h2 className="text-xl md:text-2xl font-bold text-white">Xu hướng nghề nghiệp</h2><p className="text-blue-400/50 text-sm mt-1">Cập nhật những xu hướng hot nhất</p></div>
            <span className="text-sm text-white/60 hover:text-white cursor-pointer hidden sm:flex items-center gap-1 transition-colors">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {trends.map((b, i) => (
              <div key={i} onClick={() => go(b)} className="group bg-[#112240]/80 rounded-2xl overflow-hidden border border-blue-800/40 hover:border-[#3AB4E6]/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#3AB4E6]/10">
                <div className="overflow-hidden"><img src={img(b,400)} alt={b.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" /></div>
                <div className="p-3 md:p-4">
                  <span className="text-[9px] font-bold text-[#3AB4E6] uppercase">{b.category || 'Xu hướng'}</span>
                  <h3 className="text-xs md:text-sm font-bold text-white leading-snug line-clamp-2 mt-1 group-hover:text-[#3AB4E6] transition-colors">{b.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO ─── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Về iTing Blog</h2>
          <div className="text-sm text-gray-500 leading-relaxed space-y-3 max-w-3xl">
            <p>Trang thông tin tuyển dụng iTing cung cấp các bí quyết viết CV, kinh nghiệm phỏng vấn và định hướng nghề nghiệp hàng đầu cho người Việt.</p>
            <p>Hàng ngàn bài viết chất lượng được cập nhật mỗi ngày bởi các chuyên gia nhân sự, giúp bạn tự tin chinh phục mọi nhà tuyển dụng.</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div><Link to="/" className="flex items-center gap-1 mb-3"><span className="font-extrabold text-lg text-[#3AB4E6]">iTing</span><span className="font-extrabold text-lg text-white">Blog</span></Link><p className="text-xs text-gray-500 leading-relaxed">Nền tảng chia sẻ kiến thức nghề nghiệp hàng đầu Việt Nam.</p></div>
            <div><h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Chuyên mục</h4><ul className="space-y-2 text-xs"><li className="hover:text-white cursor-pointer transition-colors">Tin tức</li><li className="hover:text-white cursor-pointer transition-colors">Bí quyết CV</li><li className="hover:text-white cursor-pointer transition-colors">Phỏng vấn</li></ul></div>
            <div><h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Về chúng tôi</h4><ul className="space-y-2 text-xs"><li className="hover:text-white cursor-pointer transition-colors">Giới thiệu</li><li className="hover:text-white cursor-pointer transition-colors">Liên hệ</li></ul></div>
            <div><h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Pháp lý</h4><ul className="space-y-2 text-xs"><li className="hover:text-white cursor-pointer transition-colors">Điều khoản sử dụng</li><li className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© 2026 iTing Corporation. All rights reserved.</p>
            <div className="flex gap-3">
              <button type="button" disabled title="App mobile sắp ra mắt" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">App Store</button>
              <button type="button" disabled title="App mobile sắp ra mắt" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">Google Play</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MOBILE BOTTOM BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 backdrop-blur-md p-2 shadow-[0_-2px_12px_rgba(0,0,0,.08)] flex gap-2 z-50 border-t border-gray-100">
        <Link to="/jobs" className="flex-1 bg-[#3AB4E6] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"><Briefcase className="h-4 w-4" />Tìm việc ngay</Link>
        <button type="button" onClick={() => navigate('/candidate/profile')} className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"><FileText className="h-4 w-4" />Tạo CV</button>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
