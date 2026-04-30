import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import publicService from '../../services/publicService';
import { GlobalLoading } from '../../components/common';
import { Search, Briefcase, FileText } from 'lucide-react';

const categories = [
  "Tất cả",
  "Tin tức",
  "Bí quyết viết CV",
  "Phỏng vấn",
  "Xu hướng",
  "Lương thưởng",
];

// === Reusable components ===

function ArticleCard({ slug, title, category, image, excerpt }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/blog/${slug}`)}
      className="block bg-white rounded-lg shadow-sm overflow-hidden mb-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <img src={image} alt={title} loading="lazy" className="w-full h-48 object-cover" />
      <div className="p-4">
        <span className="text-[10px] font-semibold text-[#1E3A8A] bg-blue-50 uppercase px-2 py-1 rounded-md mb-2 inline-block">
          {category}
        </span>
        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">{excerpt}</p>
        )}
      </div>
    </div>
  );
}

function ListArticleItem({ slug, title, image, readTime }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/blog/${slug}`)}
      className="flex gap-3 mb-4 last:mb-0 items-center group cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
      />
      <div>
        <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#3AB4E6] transition-colors line-clamp-2">
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{readTime}</p>
      </div>
    </div>
  );
}

function GridArticleCard({ slug, title, category, image }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/blog/${slug}`)}
      className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer"
    >
      <img src={image} alt={title} loading="lazy" className="w-full aspect-video object-cover" />
      <div className="p-3 flex flex-col flex-grow">
        <span className="text-[10px] font-semibold text-[#1E3A8A] uppercase mb-1">
          {category}
        </span>
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>
      </div>
    </div>
  );
}

// === Page ===

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await publicService.getBlogs({ page: 0, size: 20 });
        const data = response.data || response;
        if (data && data.content) {
          setBlogs(data.content);
        } else if (Array.isArray(data)) {
          setBlogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <GlobalLoading message="Đang tải danh sách bài viết..." />;

  const displayBlogs = blogs.length > 0 
    ? [...blogs, ...blogs, ...blogs, ...blogs, ...blogs, ...blogs, ...blogs].slice(0, 15)
    : [];

  const latest = displayBlogs.slice(0, 4);
  const popular = displayBlogs.slice(4, 7);
  const guide = displayBlogs.slice(7, 11);
  const trends = displayBlogs.slice(11, 15);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans relative">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-1">
          <span className="font-extrabold text-2xl text-[#3AB4E6]">iTing</span>
          <span className="font-extrabold text-2xl text-gray-900">Blog</span>
        </Link>
        <button
          aria-label="Tìm kiếm"
          className="text-gray-800 bg-gray-100 p-2 rounded-md hover:bg-gray-200"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50 pt-6 pb-2">
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-extrabold text-[#1E3A8A] leading-tight">
            Bí quyết tìm việc
            <br />
            thành công
          </h1>
          <p className="text-sm text-[#1E3A8A]/80 mt-2">
            Cập nhật xu hướng và kỹ năng mới nhất
          </p>
        </div>
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x hide-scrollbar scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium snap-start shadow-sm cursor-pointer ${
                i === 0
                  ? "bg-[#3AB4E6] text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      <main>
        {/* BLOCK 1: Latest articles */}
        <section className="px-4 mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bài viết mới nhất</h2>
          {latest.map((p, index) => (
            <ArticleCard
              key={`${p.id}-${index}`}
              slug={p.slug}
              title={p.title}
              category={p.category || "Tin tức"}
              image={p.thumbnailUrl || `https://ui-avatars.com/api/?name=${p.category || 'Blog'}&background=3AB4E6&color=fff&size=600`}
              excerpt={p.summary}
            />
          ))}
        </section>

        {/* BLOCK 2: Popular list */}
        <section className="bg-white px-4 py-6 mt-2 shadow-sm border-y border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bài viết xem nhiều</h2>
          {popular.map((p, index) => (
            <ListArticleItem
              key={`${p.id}-${index}`}
              slug={p.slug}
              title={p.title}
              image={p.thumbnailUrl || `https://ui-avatars.com/api/?name=${p.category || 'Blog'}&background=22c55e&color=fff&size=200`}
              readTime="3 phút đọc"
            />
          ))}
          <button className="w-full mt-2 py-2 text-sm font-semibold text-[#1E3A8A] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Xem thêm bài viết
          </button>
        </section>

        {/* BLOCK 3: Internal banners */}
        <section className="px-4 py-6 space-y-4">
          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3AB4E6] rounded-xl p-6 text-center text-white shadow-md">
            <h3 className="text-xl font-bold mb-2">Hơn 60.000+ Việc làm</h3>
            <p className="text-sm mb-4 text-white/90">
              Đang chờ đợi bạn ứng tuyển.
            </p>
            <Link to="/jobs" className="block bg-white text-[#1E3A8A] font-bold py-2 px-6 rounded-full w-full hover:bg-gray-50 transition-colors">
              Khám phá ngay
            </Link>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-center text-white shadow-md">
            <h3 className="text-xl font-bold mb-2">Tạo CV Nổi Bật</h3>
            <p className="text-sm mb-4 text-white/80">
              Gây ấn tượng với nhà tuyển dụng.
            </p>
            <button className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full w-full hover:bg-gray-50 transition-colors">
              Tạo CV Miễn Phí
            </button>
          </div>
        </section>

        {/* BLOCK 4: Career guide grid (soft bg) */}
        <section className="bg-blue-50 px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1E3A8A]">Cẩm nang nghề nghiệp</h2>
            <span className="text-sm text-[#3AB4E6] font-medium cursor-pointer">
              Xem tất cả ›
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {guide.map((p, index) => (
              <GridArticleCard
                key={`${p.id}-${index}`}
                slug={p.slug}
                title={p.title}
                category={p.category || "Cẩm nang"}
                image={p.thumbnailUrl || `https://ui-avatars.com/api/?name=${p.category || 'Blog'}&background=3AB4E6&color=fff&size=400`}
              />
            ))}
          </div>
        </section>

        {/* BLOCK 5: Trends grid (dark bg) */}
        <section className="bg-[#1E3A8A] px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">
              Xu hướng nghề nghiệp
            </h2>
            <span className="text-sm text-white/80 font-medium cursor-pointer">
              Xem tất cả ›
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trends.map((p, index) => (
              <GridArticleCard
                key={`${p.id}-${index}`}
                slug={p.slug}
                title={p.title}
                category={p.category || "Xu hướng"}
                image={p.thumbnailUrl || `https://ui-avatars.com/api/?name=${p.category || 'Blog'}&background=1E3A8A&color=fff&size=400`}
              />
            ))}
          </div>
        </section>

        {/* BLOCK 6: SEO content */}
        <section className="px-4 py-8 bg-white border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 mb-2 uppercase">
            Về iTing Blog
          </h2>
          <div className="text-xs text-gray-500 leading-relaxed text-justify space-y-3">
            <p>
              Trang thông tin tuyển dụng iTing cung cấp các bí quyết viết CV, kinh nghiệm
              phỏng vấn và định hướng nghề nghiệp hàng đầu cho người Việt. Chúng tôi đồng
              hành cùng bạn trên mọi chặng đường sự nghiệp.
            </p>
            <p>
              Hàng ngàn bài viết chất lượng được cập nhật mỗi ngày bởi các chuyên gia nhân
              sự, giúp bạn tự tin chinh phục mọi nhà tuyển dụng và đạt được mức đãi ngộ
              xứng đáng với năng lực của mình.
            </p>
          </div>
        </section>

        {/* BLOCK 7: Footer & app download */}
        <footer className="bg-gray-100 px-4 py-8">
          <div className="flex gap-4 justify-center mb-6">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2">
              App Store
            </button>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2">
              Google Play
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-6 text-center">
            <ul className="space-y-2">
              <li className="cursor-pointer hover:underline">Về chúng tôi</li>
              <li className="cursor-pointer hover:underline">Liên hệ</li>
            </ul>
            <ul className="space-y-2">
              <li className="cursor-pointer hover:underline">Điều khoản sử dụng</li>
              <li className="cursor-pointer hover:underline">Chính sách bảo mật</li>
            </ul>
          </div>
          <p className="text-center text-[10px] text-gray-400">
            © 2026 iTing Corporation. All rights reserved.
          </p>
        </footer>
      </main>

      {/* BLOCK 8: Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-2 z-50">
        <Link to="/jobs" className="flex-1 bg-[#3AB4E6] text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
          <Briefcase className="h-4 w-4" />
          Tìm việc ngay
        </Link>
        <button className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <FileText className="h-4 w-4" />
          Tạo CV
        </button>
      </div>
    </div>
  );
}

export default BlogPage;
