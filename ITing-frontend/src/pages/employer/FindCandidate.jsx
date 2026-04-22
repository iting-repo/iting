import React, { useEffect, useRef, useState } from "react";
import { Search, Filter, MapPin, GraduationCap, Briefcase, ChevronDown, ChevronUp, X, User } from "lucide-react";
import { Button, Badge } from "../../components/common";
// Note: Using standard HTML inputs for complex Shadcn-like components not in common
import { toast } from "sonner";
import { employerCandidateService } from "../../services/employerCandidateService";

const POSITIONS = ["Frontend Developer", "Backend Developer", "Fullstack Developer", "Mobile Developer", "DevOps Engineer"];
const WORK_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "FREELANCE"];
const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const LEVEL_OPTIONS = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "MID_LEVEL", "SENIOR", "LEAD", "EXPERT", "MANAGER"];
const DEGREE_OPTIONS = ["Trung cấp", "Cao đẳng", "Đại học", "Trên đại học"];
const PROGRAMMING_SKILLS = ["ReactJS", "NodeJS", "Java", "Python", "TypeScript", "React Native", "VueJS", "Angular", "Docker", "AWS"];

const EXPERIENCE_RANGES = [
  { value: "0", label: "Chưa có kinh nghiệm" },
  { value: "0-1", label: "Dưới 1 năm" },
  { value: "1-3", label: "1–3 năm" },
  { value: "3-5", label: "3–5 năm" },
  { value: "5-10", label: "5–10 năm" },
  { value: "10+", label: "Trên 10 năm" },
];

const SALARY_RANGES = [
  { value: "0-10", label: "Dưới 10 triệu" },
  { value: "10-20", label: "10–20 triệu" },
  { value: "20-30", label: "20–30 triệu" },
  { value: "30-50", label: "30–50 triệu" },
  { value: "50+", label: "Trên 50 triệu" },
];

const ITEMS_PER_PAGE = 6;

const FindCandidate = () => {
  const reqIdRef = useRef(0);
  const [keyword, setKeyword] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedWorkType, setSelectedWorkType] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [selectedSalary, setSelectedSalary] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setViewCandidate] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const resetFilters = () => {
    setKeyword("");
    setSelectedPosition("all");
    setSelectedLevel("all");
    setSelectedLocation("all");
    setSelectedWorkType("all");
    setSelectedExperience("all");
    setSelectedDegree("all");
    setSelectedSalary("all");
    setSelectedSkills([]);
    setOnlyAvailable(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    const reqId = ++reqIdRef.current;
    const hasKeyword = keyword.trim().length > 0;
    const debounceMs = hasKeyword ? 400 : 0;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await employerCandidateService.search({
          keyword,
          position: selectedPosition,
          level: selectedLevel,
          location: selectedLocation,
          workType: selectedWorkType,
          experience: selectedExperience,
          degree: selectedDegree,
          salary: selectedSalary,
          skills: selectedSkills,
          onlyAvailable,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
        });

        if (reqId !== reqIdRef.current) return;
        setCandidates(res?.content || []);
        setTotalElements(res?.totalElements ?? 0);
        setTotalPages(res?.totalPages ?? 1);
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setCandidates([]);
        setTotalElements(0);
        setTotalPages(1);
        toast.error(err?.message || "Không thể tải danh sách ứng viên");
      } finally {
        if (reqId === reqIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [
    keyword,
    selectedPosition,
    selectedLevel,
    selectedLocation,
    selectedWorkType,
    selectedExperience,
    selectedDegree,
    selectedSalary,
    selectedSkills,
    onlyAvailable,
    currentPage,
  ]);

  const activeFilterCount = [
    selectedPosition !== "all",
    selectedLevel !== "all",
    selectedLocation !== "all",
    selectedWorkType !== "all",
    selectedExperience !== "all",
    selectedDegree !== "all",
    selectedSalary !== "all",
    selectedSkills.length > 0,
    onlyAvailable,
  ].filter(Boolean).length;

  const filteredSkillOptions = PROGRAMMING_SKILLS.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  ).slice(0, 12);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm ứng viên</h1>
          <p className="text-gray-500 text-sm mt-1">Khám phá và kết nối với những tài năng hàng đầu</p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={resetFilters} className="text-gray-500 h-9 px-3 text-xs">
            <X className="w-3.5 h-3.5 mr-1" /> Xóa bộ lọc ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Tìm theo tên, vị trí, kỹ năng..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#3AB4E6] focus:ring-2 focus:ring-[#3AB4E6]/10 outline-none transition-all text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0 h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            Bộ lọc nâng cao
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Basic select filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Position Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedPosition} 
             onChange={(e) => { setSelectedPosition(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả vị trí</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
           </select>

           {/* Level Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedLevel} 
             onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả cấp bậc</option>
              {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
           </select>

           {/* Location Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedLocation} 
             onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả địa điểm</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
           </select>

           {/* WorkType Select */}
           <select 
             className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:border-[#3AB4E6] outline-none transition-all cursor-pointer"
             value={selectedWorkType} 
             onChange={(e) => { setSelectedWorkType(e.target.value); setCurrentPage(1); }}
           >
              <option value="all">Tất cả hình thức</option>
              {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
           </select>
        </div>

        {/* Advanced Filters Area */}
        {showAdvanced && (
          <div className="pt-6 border-t border-gray-50 space-y-6 animate-scale-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedExperience} 
                onChange={(e) => { setSelectedExperience(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả kinh nghiệm</option>
                {EXPERIENCE_RANGES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>

              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedDegree} 
                onChange={(e) => { setSelectedDegree(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả bằng cấp</option>
                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm outline-none cursor-pointer"
                value={selectedSalary} 
                onChange={(e) => { setSelectedSalary(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">Tất cả mức lương</option>
                {SALARY_RANGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Skills selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Kỹ năng</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(s => (
                  <Badge key={s} variant="info" className="gap-1.5 py-1.5 bg-blue-50 text-blue-700 font-bold">
                    {s} <X className="w-3 h-3 cursor-pointer" onClick={() => { setSelectedSkills(p => p.filter(x => x !== s)); setCurrentPage(1); }} />
                  </Badge>
                ))}
              </div>
              
              <div className="max-w-md">
                <input
                  placeholder="Tìm kỹ năng..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#3AB4E6] outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredSkillOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSkills(p => [...p, s]); setSkillSearch(""); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-500 hover:border-[#3AB4E6] hover:text-[#3AB4E6] transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="available"
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => { setOnlyAvailable(e.target.checked); setCurrentPage(1); }}
                className="w-5 h-5 rounded border-gray-300 text-[#3AB4E6] focus:ring-[#3AB4E6] cursor-pointer"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-600 cursor-pointer">
                Chỉ hiện ứng viên đang tìm việc
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="flex justify-between items-center py-2">
        <p className="text-sm text-gray-500">
          {loading ? (
            <span>Đang tải...</span>
          ) : (
            <>
              Tìm thấy <span className="font-bold text-gray-900">{totalElements}</span> ứng viên
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setViewCandidate(candidate)}
          >
            {/* Status Badge */}
            <div className="absolute top-0 right-0 p-4">
               {candidate.isAvailable ? (
                 <span className="text-[10px] uppercase tracking-tighter bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-bold border border-green-100">Đang tìm việc</span>
               ) : (
                 <span className="text-[10px] uppercase tracking-tighter bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full font-bold">Không sẵn sàng</span>
               )}
            </div>

            <div className="flex flex-col h-full">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                 <User className="w-8 h-8 text-[#3AB4E6]" />
               </div>

               <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1967D2] transition-colors">{candidate.name}</h3>
               <p className="text-sm font-bold text-[#3AB4E6] mb-4">{candidate.title} · {candidate.level}</p>

               <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {candidate.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {candidate.experience} năm kinh nghiệm
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {candidate.degree} - {candidate.education}
                  </div>
               </div>

               <div className="flex flex-wrap gap-1.5 mt-auto">
                 {candidate.skills.slice(0, 3).map(s => (
                   <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">{s}</span>
                 ))}
                 {candidate.skills.length > 3 && (
                   <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">+{candidate.skills.length - 3}</span>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && candidates.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-bold text-gray-800">Không tìm thấy ứng viên phù hợp</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.</p>
            <Button variant="outline" className="mt-6 rounded-xl" onClick={resetFilters}>Xóa tất cả bộ lọc</Button>
          </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="w-10 h-10 p-0 rounded-full"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                currentPage === p ? "bg-[#1967D2] text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 p-0 rounded-full"
          >
             <ChevronDown className="w-4 h-4 -rotate-90" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FindCandidate;
