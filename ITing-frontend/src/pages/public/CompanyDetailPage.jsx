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
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const isAuthenticated = !!currentUser;
  const user = currentUser;
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);

  useEffect(() => {
    fetchCompanyDetail();
    fetchCompanyJobs();
    if (isAuthenticated && user?.role === 'CANDIDATE') {
      checkFollowStatus();
    }
  }, [id, isAuthenticated, user]);

  const fetchCompanyDetail = async () => {
    try {
      setIsLoading(true);
      const response = await companyService.getCompanyDetail(id);
      setCompany(response);
    } catch (error) {
      console.error("Failed to fetch company detail:", error);
      toast.error("Không thể tải thông tin công ty");
      navigate("/companies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const response = await jobService.getJobs({ companyId: id, size: 5 });
      setJobs(response.content || []);
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await companyService.checkFollowing(id);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header / Cover Area */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#3AB4E6] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Quay lại</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-32 h-32 rounded-3xl border border-gray-100 p-4 bg-white shadow-xl shadow-gray-100 flex items-center justify-center shrink-0">
              <img 
                src={company.logoUrl || "https://via.placeholder.com/150?text=Company"} 
                alt={company.name} 
                className="w-full h-full object-contain"
                onError={(e) => e.target.src = "https://via.placeholder.com/150?text=Company"}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {company.name}
                </h1>
                <BadgeCheck className="w-8 h-8 text-[#3AB4E6]" />
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   ĐANG TUYỂN DỤNG
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-[#3AB4E6] transition-colors flex items-center gap-1">
                    {company.website?.replace(/^https?:\/\//, '') || "N/A"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{company.address || "Việt Nam"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{company.companySize || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                 <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-sm font-bold text-gray-900 ml-1">5.0</span>
                 </div>
                 <div className="h-4 w-px bg-gray-200"></div>
                 <div className="text-sm font-bold text-gray-900">
                    {company.followerCount || 0} <span className="font-medium text-gray-500">người theo dõi</span>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
              <Button 
                onClick={handleFollowToggle}
                disabled={isProcessingFollow}
                className={`font-bold h-12 px-8 rounded-xl shadow-lg transition-all ${
                  isFollowing 
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-none border border-gray-200" 
                  : "bg-[#3AB4E6] hover:bg-[#2fa0cf] text-white shadow-[#3AB4E6]/20"
                }`}
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleFollowToggle}
                disabled={isProcessingFollow}
                className={`border-gray-200 font-bold h-12 px-6 rounded-xl hover:bg-gray-50 ${isFollowing ? "text-red-500 bg-red-50/50 border-red-100 shadow-inner" : "text-gray-700"}`}
              >
                <Heart className={`w-5 h-5 mr-0 ${isFollowing ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scale-in-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Detail Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Section */}
            <article className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#3AB4E6]" />
                Giới thiệu công ty
              </h2>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                {company.description || "Công ty chưa cập nhật thông tin giới thiệu."}
              </div>
            </article>

            {/* Tech Stack & Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tech Stack */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#3AB4E6]" />
                  Công nghệ sử dụng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.techStack && company.techStack.length > 0 ? (
                    company.techStack.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm rounded-lg border-gray-200 text-gray-600 bg-gray-50 font-medium hover:border-[#3AB4E6] hover:text-[#3AB4E6] cursor-default transition-colors">
                        {tech}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">Chưa có thông tin công nghệ.</p>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  Phúc lợi dành cho bạn
                </h3>
                <div className="space-y-3">
                  {company.benefits && company.benefits.length > 0 ? (
                    company.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#3AB4E6] shrink-0"></div>
                        <span className="text-sm text-gray-600 font-medium leading-relaxed">{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">Chưa có thông tin phúc lợi.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-[#3AB4E6]" />
                    Việc làm đang tuyển ({company.activeJobCount || jobs.length})
                 </h2>
                 {(company.activeJobCount > jobs.length || jobs.length > 5) && (
                   <button 
                     onClick={() => navigate(`/jobs?companyId=${id}`)}
                     className="text-[#3AB4E6] font-bold text-sm hover:underline flex items-center gap-1 group"
                   >
                      Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                 )}
              </div>
              
              <div className="space-y-4">
                {isLoadingJobs ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-3 border-[#3AB4E6] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="group p-5 rounded-2xl border border-gray-50 hover:border-[#3AB4E6]/30 hover:bg-gray-50/50 transition-all cursor-pointer flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 group-hover:text-[#3AB4E6] transition-colors truncate">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#3AB4E6] font-bold">
                            <Star className="w-3.5 h-3.5" /> {(job.minSalary && job.maxSalary) ? `${(job.minSalary/1000000).toFixed(0)}-${(job.maxSalary/1000000).toFixed(0)}Tr` : "Thỏa thuận"}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> {formatDistanceToNowStrict(parseISO(job.createdAt), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <Badge variant="outline" className="hidden sm:inline-flex bg-white capitalize">
                          {job.jobType?.toLowerCase()?.replace('_', ' ')}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#3AB4E6] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                      <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">Hiện tại chưa có công việc nào đang tuyển dụng.</p>
                      <Button 
                        variant="link" 
                        className="text-[#3AB4E6] mt-2 font-bold"
                        onClick={() => navigate(`/jobs`)}
                      >
                        Khám phá các công việc khác
                      </Button>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Thông tin chung</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Năm thành lập</p>
                    <p className="text-sm font-bold text-gray-800">{company.foundedYear || "—"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Quy mô nhân sự</p>
                    <p className="text-sm font-bold text-gray-800">{company.companySize || "—"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Lĩnh vực</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {company.industries?.map((ind, i) => (
                        <Badge key={i} className="bg-sky-50 text-[#3AB4E6] border-sky-100 text-[10px] font-bold">
                          {ind.toString().replace('_', ' ')}
                        </Badge>
                      )) || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                 <p className="text-xs text-center text-gray-400 font-medium">
                    Mã số thuế: {company.taxCode || "N/A"}
                 </p>
              </div>
            </div>

            {/* QR or Contact Section */}
            <div className="bg-gradient-to-br from-[#3AB4E6] to-[#2fa0cf] rounded-3xl p-8 text-white text-center shadow-xl shadow-[#3AB4E6]/20">
               <h4 className="font-bold text-lg mb-2">Quan tâm đến {company.name}?</h4>
               <p className="text-white/80 text-sm mb-6">
                 Đừng bỏ lỡ bất kỳ cơ hội nghề nghiệp nào từ công ty này.
               </p>
               <Button 
                 onClick={handleFollowToggle}
                 disabled={isProcessingFollow}
                 className={`w-full font-bold h-12 rounded-xl transition-all ${
                   isFollowing
                   ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-none"
                   : "bg-white text-[#3AB4E6] hover:bg-gray-50 shadow-lg"
                 }`}
               >
                 {isFollowing ? "Bỏ theo dõi" : "Theo dõi công ty"}
               </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
