import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Building2, MapPin, Users, Globe, Star, 
  ExternalLink, BadgeCheck, Briefcase, 
  Calendar, CheckCircle2, ChevronRight,
  ArrowLeft, Heart
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import companyService from "../../services/companyService";
import jobService from "../../services/jobService";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { CompanyLogo } from "../../components/common";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useModalEscape } from "../../hooks/useModalEscape";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const isAuthenticated = !!currentUser;
  const user = currentUser;
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useModalEscape(showReviewModal ? () => setShowReviewModal(false) : null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [compRes, statsRes, reviewsRes] = await Promise.all([
          companyService.getCompanyDetail(id),
          companyService.getCompanyRatingStats(id),
          companyService.getCompanyReviews(id)
        ]);
        
        setCompany(compRes.data || compRes); // Handle possible data wrapper variations
        setRatingStats(statsRes.data || statsRes);
        setReviews(reviewsRes.data || reviewsRes);

        if (isAuthenticated && user?.role === 'CANDIDATE') {
          const followRes = await companyService.checkFollowing(id);
          setIsFollowing(followRes.data?.isFollowing ?? followRes.data ?? followRes);
        }

        // Fetch jobs separately to not block main content
        fetchCompanyJobs();
      } catch (error) {
        console.error("Error fetching company data:", error);
        toast.error("Không thể tải thông tin công ty");
        navigate("/companies");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const fetchCompanyJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const response = await jobService.getJobs({ companyId: id, size: 5 });
      setJobs(response.content || response.data?.content || []);
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để theo dõi công ty");
      navigate("/login");
      return;
    }

    if (user?.role !== 'CANDIDATE') {
      toast.error("Chỉ ứng viên mới có thể theo dõi công ty");
      return;
    }

    try {
      setIsProcessingFollow(true);
      if (isFollowing) {
        await companyService.unfollowCompany(id);
        setIsFollowing(false);
        setCompany(prev => ({ ...prev, followerCount: Math.max(0, (prev.followerCount || 0) - 1) }));
        toast.info(`Đã bỏ theo dõi ${company?.name}`);
      } else {
        await companyService.followCompany(id);
        setIsFollowing(true);
        setCompany(prev => ({ ...prev, followerCount: (prev.followerCount || 0) + 1 }));
        toast.success(`Đang theo dõi ${company?.name}`);
      }
    } catch (error) {
      console.error("Follow action failed:", error);
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessingFollow(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const response = await companyService.postCompanyReview(id, {
        rating: reviewRating,
        content: reviewContent
      });

      toast.success("Cảm ơn bạn đã đánh giá công ty!");
      setShowReviewModal(false);
      setReviewContent("");
      setReviewRating(5);

      // Refresh reviews and stats
      const [statsRes, reviewsRes] = await Promise.all([
        companyService.getCompanyRatingStats(id),
        companyService.getCompanyReviews(id)
      ]);
      setRatingStats(statsRes.data || statsRes);
      setReviews(reviewsRes.data || reviewsRes);
    } catch (error) {
      console.error("Review submission failed:", error);
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3AB4E6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Hero Banner Area */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#3AB4E6] via-[#2A9DCB] to-[#1E3A8A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3AB4E6] rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-12 relative z-10">
           <button 
              onClick={() => navigate(-1)}
              className="absolute top-8 left-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors group px-4 py-2 bg-black/10 backdrop-blur-md rounded-full text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>
        </div>
      </div>

      {/* Profile Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-6 md:p-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Logo with sophisticated styling */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white p-6 shadow-2xl shadow-blue-500/10 border border-gray-50 flex items-center justify-center shrink-0 -mt-16 md:-mt-24 ring-8 ring-white">
              <CompanyLogo 
                logoUrl={company.logoUrl} 
                companyName={company.name} 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3 pt-2 md:pt-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {company.name}
                </h1>
                <div className="p-1 bg-blue-50 rounded-full">
                  <BadgeCheck className="w-7 h-7 text-[#3AB4E6] fill-blue-50" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black border border-green-100 tracking-wider">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   ĐANG TUYỂN DỤNG
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
                <div className="flex items-center gap-2 hover:text-[#3AB4E6] transition-colors cursor-pointer group">
                  <Globe className="w-4 h-4 text-[#3AB4E6]" />
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-bold truncate max-w-[200px]">
                    {company.website?.replace(/^https?:\/\//, '') || "N/A"}
                  </a>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3AB4E6]" />
                  <span className="text-sm font-bold">{company.address || "Việt Nam"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3AB4E6]" />
                  <span className="text-sm font-bold">{company.companySize || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-3">
                 <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-black text-yellow-700">
                      {ratingStats.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-[10px] text-yellow-600 font-bold ml-1">
                      ({ratingStats.reviewCount || 0} đánh giá)
                    </span>
                 </div>
                 <div className="h-4 w-px bg-gray-200"></div>
                 <div className="text-sm font-bold text-gray-900 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100/50">
                    {company.followerCount || 0} <span className="font-medium text-[#3AB4E6]">người theo dõi</span>
                 </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto shrink-0 self-stretch md:self-center">
              <button 
                onClick={handleFollowToggle}
                disabled={isProcessingFollow}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 h-14 px-8 rounded-2xl font-black text-sm transition-all duration-300 ${
                  isFollowing 
                  ? "bg-[#2fa0cf] text-white shadow-xl shadow-blue-100" 
                  : "bg-[#3AB4E6] text-white hover:bg-[#2A9DCB] shadow-xl shadow-blue-200 hover:-translate-y-1 active:scale-95"
                }`}
              >
                {isFollowing ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Đang theo dõi
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Theo dõi công ty
                  </>
                )}
              </button>
              <button 
                onClick={handleFollowToggle}
                disabled={isProcessingFollow}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 border-2 ${
                  isFollowing 
                  ? "border-red-100 bg-red-50 text-red-500 shadow-inner" 
                  : "border-gray-100 bg-white text-gray-400 hover:border-[#3AB4E6] hover:text-[#3AB4E6] hover:-translate-y-1"
                }`}
              >
                <Heart className={`w-6 h-6 ${isFollowing ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* About Section */}
            <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-20 bg-[#3AB4E6] rounded-full translate-y-12"></div>
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                <Building2 className="w-7 h-7 text-[#3AB4E6]" />
                Giới thiệu công ty
              </h2>
              <div className="text-gray-600 leading-loose text-lg whitespace-pre-line font-medium italic border-l-4 border-gray-50 pl-8 ml-3">
                {company.description || "Công ty chưa cập nhật thông tin giới thiệu chi tiết."}
              </div>
            </article>

            {/* Stats/Highlight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tech Stack Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:shadow-[#3AB4E6]/5 transition-all duration-500">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#3AB4E6]" />
                  </div>
                  Công nghệ sử dụng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.techStack && company.techStack.length > 0 ? (
                    company.techStack.map((tech, idx) => (
                      <span key={idx} className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-50 text-gray-600 border border-gray-100 hover:border-[#3AB4E6] hover:text-[#3AB4E6] hover:bg-blue-50/30 cursor-default transition-all">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm font-medium">Chưa có thông tin công nghệ chính.</p>
                  )}
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  Phúc lợi dành cho bạn
                </h3>
                <div className="space-y-4">
                  {company.benefits && company.benefits.length > 0 ? (
                    company.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-4 group">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-[#3AB4E6] group-hover:scale-150 transition-transform"></div>
                        <span className="text-sm text-gray-700 font-bold leading-relaxed">{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm font-medium">Chưa có thông tin phúc lợi công khai.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Jobs Listing Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-[#3AB4E6]" />
                    </div>
                    Tuyển dụng ({company.activeJobCount || jobs.length})
                 </h2>
                 {(company.activeJobCount > jobs.length || jobs.length > 5) && (
                   <button 
                     onClick={() => navigate(`/jobs?companyId=${id}`)}
                     className="px-6 py-2.5 bg-gray-50 text-[#3AB4E6] rounded-full font-black text-xs hover:bg-[#3AB4E6] hover:text-white transition-all flex items-center gap-2 group"
                   >
                      Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                 )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {isLoadingJobs ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#3AB4E6] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="group p-6 rounded-3xl border border-gray-50 hover:border-[#3AB4E6]/20 hover:bg-blue-50/10 hover:shadow-xl hover:shadow-[#3AB4E6]/5 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-6"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black text-gray-900 group-hover:text-[#3AB4E6] transition-colors line-clamp-1">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                          <span className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-[#3AB4E6]" /> {job.location}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-[#3AB4E6] font-black bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                             {(job.minSalary && job.maxSalary) ? `${(job.minSalary/1000000).toFixed(0)}-${(job.maxSalary/1000000).toFixed(0)}Tr` : "Thỏa thuận"}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                            <Calendar className="w-3.5 h-3.5" /> {formatDistanceToNowStrict(parseISO(job.createdAt), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-4 w-full sm:w-auto">
                        <div className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:bg-blue-100 group-hover:text-[#3AB4E6] transition-all">
                          {job.jobType?.toLowerCase()?.replace('_', ' ')}
                        </div>
                        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-[#3AB4E6] group-hover:bg-[#3AB4E6] transition-all duration-300">
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-bold text-lg mb-2">Chưa có vị trí trống</p>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Theo dõi công ty để nhận thông báo ngay khi có tin tuyển dụng mới.</p>
                      <button 
                        onClick={() => navigate(`/jobs`)}
                        className="text-[#3AB4E6] font-black text-sm hover:underline"
                      >
                        Khám phá công việc khác
                      </button>
                   </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/50 mt-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                    <Star className="w-7 h-7 text-yellow-500 fill-current" />
                  </div>
                  Đánh giá từ cộng đồng
                </h2>
                {isAuthenticated && user?.role === 'CANDIDATE' && (
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-2.5 bg-[#3AB4E6] text-white rounded-full font-black text-xs hover:bg-[#2A9DCB] transition-all shadow-lg shadow-blue-200"
                  >
                    Viết đánh giá
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gray-50 rounded-3xl p-8 text-center flex flex-col justify-center border border-gray-100">
                   <div className="text-5xl font-black text-gray-900 mb-2">
                     {ratingStats.averageRating?.toFixed(1) || "0.0"}
                   </div>
                   <div className="flex justify-center gap-1 mb-3">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <Star 
                         key={s} 
                         className={`w-5 h-5 ${s <= Math.round(ratingStats.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                       />
                     ))}
                   </div>
                   <div className="text-sm font-bold text-gray-400">
                     Dựa trên {ratingStats.reviewCount || 0} đánh giá
                   </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                   {[5, 4, 3, 2, 1].map((star) => {
                     const count = reviews.filter(r => r.rating === star).length;
                     const percentage = ratingStats.reviewCount > 0 ? (count / ratingStats.reviewCount) * 100 : 0;
                     return (
                       <div key={star} className="flex items-center gap-4">
                          <span className="text-sm font-black text-gray-600 w-4">{star}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-400 w-8">{percentage.toFixed(0)}%</span>
                       </div>
                     );
                   })}
                </div>
              </div>

              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm group-hover:border-[#3AB4E6]/30 transition-all">
                            {review.authorAvatar ? (
                              <img src={review.authorAvatar} alt={review.authorName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#3AB4E6] font-black text-xl bg-blue-50">
                                {review.authorName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 group-hover:text-[#3AB4E6] transition-colors">{review.authorName}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              {formatDistanceToNowStrict(parseISO(review.createdAt), { addSuffix: true, locale: vi })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-100'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed font-medium pl-16">
                        {review.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50/30 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold italic">Chưa có đánh giá nào cho công ty này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* General Info Box */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100/50 sticky top-24">
              <h3 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">Thông tin doanh nghiệp</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Calendar className="w-6 h-6 text-[#3AB4E6]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">Năm thành lập</p>
                    <p className="text-base font-black text-gray-800">{company.foundedYear || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">Quy mô nhân sự</p>
                    <p className="text-base font-black text-gray-800">{company.companySize || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <Building2 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">Lĩnh vực chính</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.industries?.map((ind, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50/50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-lg uppercase tracking-wider">
                          {ind.toString().replace('_', ' ')}
                        </span>
                      )) || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action Sidebar Card */}
              <div className="mt-12 p-8 bg-gradient-to-br from-[#3AB4E6] to-[#1E3A8A] rounded-[2rem] text-white text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                 <h4 className="font-black text-xl mb-3 relative z-10">Bật thông báo?</h4>
                 <p className="text-white/80 text-sm mb-8 relative z-10 leading-relaxed">
                   Chúng tôi sẽ báo cho bạn ngay khi {company.name} có tin mới.
                 </p>
                 <button 
                   onClick={handleFollowToggle}
                   disabled={isProcessingFollow}
                   className={`w-full h-14 rounded-2xl font-black transition-all relative z-10 shadow-xl ${
                     isFollowing
                     ? "bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-md"
                     : "bg-white !text-[#3AB4E6] !opacity-100 hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                   }`}
                 >
                   {isFollowing ? "Đang nhận tin" : "Theo dõi ngay"}
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowReviewModal(false)}
          ></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Đánh giá công ty</h3>
              <p className="text-gray-500 text-sm font-medium mb-8">Chia sẻ trải nghiệm của bạn về {company.name}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Mức độ hài lòng</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition-transform active:scale-90 hover:scale-110"
                      >
                        <Star 
                          className={`w-10 h-10 ${star <= reviewRating ? "text-yellow-400 fill-current" : "text-gray-100"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nội dung đánh giá</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Hãy chia sẻ những điều bạn ấn tượng hoặc cần cải thiện tại đây..."
                    className="w-full h-32 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#3AB4E6] focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-gray-100 text-gray-500 font-black text-sm hover:bg-gray-200 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 h-14 rounded-2xl bg-[#3AB4E6] text-white font-black text-sm shadow-xl shadow-blue-200 hover:bg-[#2A9DCB] disabled:opacity-50 transition-all"
                  >
                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPage;
