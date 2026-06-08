import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, MapPin, Users, Briefcase, Globe, Star, 
  ChevronDown, ChevronUp, X, ExternalLink, Building2, 
  Filter, BadgeCheck, Heart 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import companyService from "../../services/companyService";
import { Breadcrumb, CompanyLogo } from "../../components/common";
import { isCompanyVerified } from "../../utils/enumLabels";
import { encodeId } from "../../utils/idCodec";

// 34 tỉnh/thành VN sau sáp nhập 2025 (Nghị quyết 60-NQ/TW). Sắp theo
// thứ tự dân số/IT job density để các vùng IT hub lên đầu dropdown.
const PROVINCES = [
  // IT hubs trước
  "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế",
  // Vùng phụ cận hub
  "Đồng Nai", "Tây Ninh", "Hưng Yên", "Bắc Ninh", "Quảng Ninh",
  // Còn lại — alphabet
  "An Giang", "Cao Bằng", "Cà Mau", "Điện Biên", "Đắk Lắk", "Đồng Tháp",
  "Gia Lai", "Hà Tĩnh", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn",
  "Lào Cai", "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Trị",
  "Sơn La", "Thanh Hóa", "Thái Nguyên", "Tuyên Quang", "Vĩnh Long"
];

// Industries dùng đúng string value lưu trong DB (xem V2/V35/V91 migrations).
// Backend search dùng cb.equal() exact-match — không thể dùng enum key
// SOFTWARE_DEVELOPMENT vì DB lưu raw text "IT Outsourcing"/"Fintech"/etc.
const INDUSTRY_OPTIONS = [
  { value: "Technology", label: "Công nghệ" },
  { value: "IT Outsourcing", label: "Gia công CNTT (IT Outsourcing)" },
  { value: "Internet Services", label: "Dịch vụ Internet" },
  { value: "Telecommunications", label: "Viễn thông" },
  { value: "Fintech", label: "Công nghệ tài chính (Fintech)" },
  { value: "E-commerce", label: "Thương mại điện tử" },
  { value: "Multi-industry", label: "Đa ngành" },
  { value: "Software Development", label: "Phát triển phần mềm" },
  { value: "Mobile Development", label: "Phát triển ứng dụng di động" },
  { value: "Cloud Computing", label: "Điện toán đám mây" },
  { value: "DevOps", label: "Quản trị vận hành (DevOps)" },
  { value: "Data Science", label: "Khoa học dữ liệu" },
  { value: "AI / Machine Learning", label: "Trí tuệ nhân tạo (AI/ML)" },
  { value: "Cybersecurity", label: "An ninh mạng" },
  { value: "Blockchain", label: "Blockchain" },
  { value: "Game Development", label: "Phát triển Game" },
  { value: "QA / Testing", label: "Kiểm thử phần mềm (QA/QC)" },
];

// Sizes match exact string trong DB (Company_size column). Backend cb.equal().
// Phân nhóm: nhỏ vừa (range) → lớn (open ended với +).
const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 nhân viên" },
  { value: "11-50", label: "11-50 nhân viên" },
  { value: "51-100", label: "51-100 nhân viên" },
  { value: "100-500", label: "100-500 nhân viên" },
  { value: "500-1000", label: "500-1000 nhân viên" },
  { value: "1,000+", label: "1,000+ nhân viên" },
  { value: "2,000+", label: "2,000+ nhân viên" },
  { value: "3,000+", label: "3,000+ nhân viên" },
  { value: "5,000+", label: "5,000+ nhân viên" },
  { value: "10,000+", label: "10,000+ nhân viên" },
  { value: "20,000+", label: "20,000+ nhân viên" },
  { value: "30,000+", label: "30,000+ nhân viên" },
  { value: "50,000+", label: "50,000+ nhân viên" },
  { value: "100,000+", label: "100,000+ nhân viên" },
];

const CompaniesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const isAuthenticated = !!currentUser;
  const user = currentUser;
  
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const getResponsivePageSize = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 6;
    return 9;
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(getResponsivePageSize());

  useEffect(() => {
    const handleResize = () => {
        const newSize = getResponsivePageSize();
        if (pageSize !== newSize) {
            setPageSize(newSize);
            setCurrentPage(0);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageSize]);
  
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, selectedIndustry, selectedLocation, selectedSize]);

  // Load followed companies on mount (only for logged-in candidates)
  useEffect(() => {
    const fetchFollowedCompanies = async () => {
      if (isAuthenticated && user?.role === 'CANDIDATE') {
        try {
          const followedRes = await companyService.getMyFollowedCompanies(0, 200);
          const data = followedRes?.content || followedRes || [];
          if (Array.isArray(data)) {
            const ids = new Set(data.map(item => item.companyId || item.id));
            setFollowingIds(ids);
          }
        } catch (error) {
          console.error("Failed to load followed companies:", error);
        }
      }
    };
    fetchFollowedCompanies();
  }, [isAuthenticated, user]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const params = {
        keyword: keyword || undefined,
        industry: selectedIndustry !== "all" ? selectedIndustry : undefined,
        location: selectedLocation !== "all" ? selectedLocation : undefined,
        size: selectedSize !== "all" ? selectedSize : undefined,
        page: currentPage,
        size_page: pageSize
      };
      const response = await companyService.searchCompanies(params);
      setCompanies(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error("Không thể tải danh sách công ty");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchCompanies();
  };

  const handleFollow = async (e, companyId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi công ty");
      return;
    }
    if (user?.role !== 'CANDIDATE') {
      toast.error("Chỉ ứng viên mới có thể theo dõi công ty");
      return;
    }

    try {
      if (followingIds.has(companyId)) {
        await companyService.unfollowCompany(companyId);
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(companyId);
          return next;
        });
        toast.info("Đã bỏ theo dõi công ty");
      } else {
        await companyService.followCompany(companyId);
        setFollowingIds(prev => new Set(prev).add(companyId));
        toast.success("Đã theo dõi công ty thành công!");
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-200">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/company-page.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/70 to-gray-900/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb 
            items={[
              { label: 'Danh sách công ty' }
            ]} 
            variant="dark"
          />
          <div className="text-center pt-8 pb-12">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              Khám phá các <span className="text-[#3AB4E6]">Công ty IT</span> hàng đầu
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Tra cứu thông tin về môi trường làm việc, công nghệ và tìm kiếm cơ hội nghề nghiệp tại những công ty tốt nhất.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto pb-10">
            <div className="bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-2xl border border-white/20 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3AB4E6] transition-colors" />
                <input
                  type="text"
                  placeholder="Tên công ty, mô tả..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-[#3AB4E6]/20 bg-gray-50/50 text-gray-900 placeholder-gray-400 outline-none transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 md:w-auto">
                <select
                  className="px-4 py-4 md:py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-700 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all cursor-pointer flex-1 min-w-[160px]"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">📍 Tất cả địa điểm</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                  className="px-4 py-4 md:py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-700 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all cursor-pointer flex-1 min-w-[180px]"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="all">🏢 Tất cả lĩnh vực</option>
                  {INDUSTRY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>

                {/* Size filter: dùng ở dưới (separate widget) nhưng cũng add ở đây
                    cho dễ access. Tránh duplicate state — chỉ 1 dropdown gắn vào
                    selectedSize. */}
                <select
                  className="px-4 py-4 md:py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-700 outline-none hover:bg-gray-100 focus:ring-2 focus:ring-[#3AB4E6]/20 transition-all cursor-pointer flex-1 min-w-[170px]"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="all">👥 Mọi quy mô</option>
                  {COMPANY_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <button
                  type="submit"
                  className="bg-[#3AB4E6] hover:bg-[#2fa0cf] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#3AB4E6]/20 flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <Search className="w-5 h-5" /> Tìm kiếm
                </button>
              </div>
            </div>

            {/* Active filter chips + reset — chỉ hiện khi có filter nào active */}
            {(selectedLocation !== "all" || selectedIndustry !== "all" || selectedSize !== "all" || keyword) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Đang lọc:</span>
                {keyword && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    🔍 "{keyword}"
                    <button type="button" onClick={() => setKeyword("")} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedLocation !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    📍 {selectedLocation}
                    <button type="button" onClick={() => setSelectedLocation("all")} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedIndustry !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    🏢 {INDUSTRY_OPTIONS.find(o => o.value === selectedIndustry)?.label || selectedIndustry}
                    <button type="button" onClick={() => setSelectedIndustry("all")} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSize !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                    👥 {COMPANY_SIZES.find(s => s.value === selectedSize)?.label || selectedSize}
                    <button type="button" onClick={() => setSelectedSize("all")} className="hover:text-orange-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setKeyword(""); setSelectedLocation("all"); setSelectedIndustry("all"); setSelectedSize("all"); }}
                  className="ml-auto text-xs text-gray-500 hover:text-[#3AB4E6] font-medium underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Danh sách công ty</h2>
            <span className="text-sm text-gray-500">({totalElements} kết quả)</span>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
               className="bg-transparent border-none text-sm font-semibold text-gray-600 outline-none cursor-pointer hover:text-[#3AB4E6]"
               value={selectedSize}
               onChange={(e) => setSelectedSize(e.target.value)}
            >
               <option value="all">Mọi quy mô</option>
               {COMPANY_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Company Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => navigate(`/companies/${encodeId(company.id)}`)}
                className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#3AB4E6]/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden p-6"
              >
                {/* Header Info */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-2xl border border-gray-50 p-3 bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <CompanyLogo 
                      logoUrl={company.logoUrl} 
                      companyName={company.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button 
                    onClick={(e) => handleFollow(e, company.id)}
                    className={`p-2.5 rounded-xl transition-all ${
                      followingIds.has(company.id) 
                      ? 'bg-red-50 text-red-500' 
                      : 'bg-gray-50 text-gray-400 hover:bg-[#3AB4E6]/10 hover:text-[#3AB4E6]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${followingIds.has(company.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Body Info */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#3AB4E6] transition-colors">
                        {company.name}
                      </h3>
                      {isCompanyVerified(company.verificationLevel) && (
                        <span title="Công ty đã xác thực" className="shrink-0">
                          <BadgeCheck className="w-5 h-5 text-[#3AB4E6]" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed min-h-[40px]">
                      {company.description || "Công ty chưa cập nhật giới thiệu."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 py-2 border-y border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.address?.split(',').pop()?.trim() || "Việt Nam"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Users className="w-3.5 h-3.5" />
                      {company.companySize || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#3AB4E6]" />
                      <span className="text-sm font-bold text-[#3AB4E6]">
                        {company.activeJobCount || 0} việc làm
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Star className={`w-4 h-4 ${company.averageRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        <span className="text-sm font-bold text-gray-800">
                          {company.averageRating ? company.averageRating.toFixed(1) : '—'}
                        </span>
                        {company.reviewCount > 0 && (
                          <span className="text-xs text-gray-400">({company.reviewCount})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Action */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#3AB4E6] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && companies.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Building2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy công ty phù hợp</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Hãy thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm được nhiều kết quả hơn.
            </p>
            <button 
              onClick={() => { setKeyword(""); setSelectedIndustry("all"); setSelectedLocation("all"); }}
              className="mt-6 text-[#3AB4E6] font-bold hover:underline"
            >
              Thiết lập lại tìm kiếm
            </button>
          </div>
        )}

        {/* Pagination component */}
        {totalElements > pageSize && (() => {
            const totalPages = Math.ceil(totalElements / pageSize);
            const currentDisplayPage = currentPage + 1;
            
            const pages = [];
            const maxPages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
            let startPage = Math.max(1, currentDisplayPage - Math.floor(maxPages / 2));
            let endPage = Math.min(totalPages, startPage + maxPages - 1);

            if (endPage - startPage + 1 < maxPages) {
                startPage = Math.max(1, endPage - maxPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return (
               <div className="mt-12 flex justify-center items-center gap-1 md:gap-2">
                  <button 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>

                  {pages.map(pageNum => (
                      <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum - 1)}
                          className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-sm md:text-base font-bold transition-colors ${
                              pageNum === currentDisplayPage 
                                  ? 'bg-[#3AB4E6] text-white shadow-md' 
                                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                          {pageNum}
                      </button>
                  ))}

                  <button 
                    disabled={companies.length < pageSize}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
               </div>
            );
        })()}
      </div>
    </div>
  );
};

export default CompaniesPage;
