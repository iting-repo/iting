import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBriefcase, FaDollarSign, FaEnvelope, FaMapMarkerAlt, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'sonner';
import { fetchJobDetailRequest } from '../../store/job/jobSlice';
import { buildJobDetailPath, getJobTitle, normalizeJobKey, slugify } from '../../utils/jobUrl';
import messageService from '../../services/messageService';
import axiosInstance from '../../utils/axiosInstance';
import { storage } from '../../utils/storage';
import { JobApplyModal, JobCard } from '../../components';

const toLines = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);

  return String(value)
    .split(/\n|\.|;/)
    .map((v) => v.trim())
    .filter(Boolean);
};

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thoa thuan';
  const f = (v) => Number(v).toLocaleString('vi-VN') + ' VND';
  if (min && max) return `${f(min)} - ${f(max)}`;
  if (min) return `Tu ${f(min)}`;
  return `Den ${f(max)}`;
};

const JobDetailPage = () => {
  const { slug, jobKey } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentJob, isLoading } = useSelector((state) => state.job || {});
  const { currentUser } = useSelector((state) => state.auth || {});

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const normalizedJobId = normalizeJobKey(jobKey);

  useEffect(() => {
    if (normalizedJobId) {
      dispatch(fetchJobDetailRequest(normalizedJobId));
    }
  }, [dispatch, normalizedJobId]);

  useEffect(() => {
    if (!currentJob) return;
    const expectedSlug = slugify(getJobTitle(currentJob)) || 'chi-tiet-viec-lam';
    if (slug !== expectedSlug) {
      navigate(buildJobDetailPath(currentJob), { replace: true });
    }
  }, [currentJob, slug, navigate]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!currentJob?.id || !storage.getToken()) {
        setIsSaved(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/candidates/saved-jobs/${currentJob.id}/check`);
        setIsSaved(Boolean(res?.saved));
      } catch {
        setIsSaved(false);
      }
    };

    checkSaved();
  }, [currentJob?.id]);

  useEffect(() => {
    const loadRelatedJobs = async () => {
      if (!currentJob?.id) {
        setRelatedJobs([]);
        return;
      }

      setRelatedLoading(true);
      try {
        const primaryKeyword = currentJob.position || currentJob.title || '';
        const byKeyword = await axiosInstance.get('/jobs/search', {
          params: {
            keyword: primaryKeyword,
            page: 0,
            size: 5,
            sortBy: 'lastUpdate',
            sortOrder: 'desc',
          },
        });

        let candidates = Array.isArray(byKeyword?.content) ? byKeyword.content : [];
        candidates = candidates.filter((job) => Number(job.id) !== Number(currentJob.id));

        if (candidates.length < 3 && currentJob.companyId) {
          const byCompany = await axiosInstance.get('/jobs/search', {
            params: {
              companyId: currentJob.companyId,
              page: 0,
              size: 5,
              sortBy: 'lastUpdate',
              sortOrder: 'desc',
            },
          });

          const companyJobs = (Array.isArray(byCompany?.content) ? byCompany.content : [])
            .filter((job) => Number(job.id) !== Number(currentJob.id));

          const mergeMap = new Map();
          [...candidates, ...companyJobs].forEach((job) => {
            if (!mergeMap.has(job.id)) mergeMap.set(job.id, job);
          });
          candidates = [...mergeMap.values()];
        }

        setRelatedJobs(candidates.slice(0, 3));
      } catch {
        setRelatedJobs([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelatedJobs();
  }, [currentJob?.id, currentJob?.companyId, currentJob?.position, currentJob?.title]);

  const handleToggleSave = async () => {
    if (!storage.getToken()) {
      toast.error('Vui long dang nhap de luu cong viec.');
      return;
    }
    if (!currentJob?.id || isSaving) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        await axiosInstance.delete(`/candidates/saved-jobs/${currentJob.id}`);
        setIsSaved(false);
        toast.success('Da bo luu cong viec.');
      } else {
        await axiosInstance.post(`/candidates/saved-jobs/${currentJob.id}`);
        setIsSaved(true);
        toast.success('Da luu cong viec.');
      }
    } catch (error) {
      toast.error(error?.message || 'Khong the cap nhat trang thai luu job.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactCompany = async () => {
    const token = storage.getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    if (currentUser?.role !== 'CANDIDATE') {
      toast.error('Chi ung vien moi co the nhan tin voi nha tuyen dung.');
      return;
    }

    const content = contactMessage.trim();
    if (!content) {
      toast.error('Vui long nhap noi dung tin nhan.');
      return;
    }

    if (!currentJob?.companyId) {
      toast.error('Khong xac dinh duoc nha tuyen dung.');
      return;
    }

    setSendingContact(true);
    try {
      const sent = await messageService.sendMessage({
        receiverId: currentJob.companyId,
        receiverType: 'COMPANY',
        senderType: 'USER',
        content,
      });
      setContactMessage('');
      toast.success('Da gui tin nhan.');
      navigate(`/messages?conversationId=${sent.conversationId}`);
    } catch (error) {
      toast.error(error?.message || 'Khong the gui tin nhan luc nay.');
    } finally {
      setSendingContact(false);
    }
  };

  const requirements = useMemo(
    () => toLines(currentJob?.requirements || currentJob?.techRequired),
    [currentJob?.requirements, currentJob?.techRequired]
  );
  const responsibilities = useMemo(() => toLines(currentJob?.responsibilities), [currentJob?.responsibilities]);
  const benefits = useMemo(() => toLines(currentJob?.benefits), [currentJob?.benefits]);
  const description = useMemo(() => toLines(currentJob?.description), [currentJob?.description]);
  const mapQuery = useMemo(() => {
    const pieces = [currentJob?.address, currentJob?.ward, currentJob?.province, currentJob?.location]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    return pieces.length > 0 ? pieces.join(', ') : 'Viet Nam';
  }, [currentJob?.address, currentJob?.ward, currentJob?.province, currentJob?.location]);
  const encodedMapQuery = encodeURIComponent(mapQuery);
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
  const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodedMapQuery}&output=embed`;

  const mapJobToCard = (job) => ({
    id: job.id,
    title: job.title || job.position || 'Vi tri tuyen dung',
    company: job.companyName || 'Cong ty',
    logo: job.companyLogo || 'https://via.placeholder.com/80',
    category: (job.techRequired && job.techRequired[0]) || (job.experienceLevel || 'IT'),
    type: job.jobType || 'FULL_TIME',
    salary: formatSalary(job.minSalary, job.maxSalary),
    location: job.location || job.province || 'Viet Nam',
    timePosted: job.lastUpdate || job.createdAt ? new Date(job.lastUpdate || job.createdAt).toLocaleDateString('vi-VN') : 'Moi dang',
  });

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-100 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-40 bg-gray-100 rounded-xl" />
            <div className="h-36 bg-gray-100 rounded-xl" />
          </section>
          <aside className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-24 bg-gray-100 rounded-xl mb-3" />
            <div className="h-11 bg-gray-200 rounded-xl" />
          </aside>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return <div className="text-center py-20 font-bold text-red-500">Khong tim thay cong viec.</div>;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <JobApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobTitle={currentJob.position || currentJob.title}
        jobId={currentJob.id}
      />

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 p-2">
              <img src={currentJob.companyLogo || 'https://via.placeholder.com/80'} alt={currentJob.companyName || 'Company'} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-gray-900">{currentJob.position || currentJob.title}</h1>
              <p className="text-gray-500 mt-1">{currentJob.companyName || 'Cong ty'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 inline-flex items-center gap-2"><FaDollarSign />{formatSalary(currentJob.minSalary, currentJob.maxSalary)}</div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 inline-flex items-center gap-2"><FaMapMarkerAlt />{currentJob.location || currentJob.province || 'Viet Nam'}</div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 inline-flex items-center gap-2"><FaBriefcase />{currentJob.jobType || 'FULL_TIME'}</div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-900 inline-flex items-center gap-2">Han nop: {currentJob.dueDate || 'N/A'}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsApplyModalOpen(true)} className="h-11 px-6 rounded-xl bg-[#00B4D8] text-white font-bold hover:bg-[#0096b4]">Ung tuyen ngay</button>
            <button onClick={handleToggleSave} disabled={isSaving} className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-60">
              <FaRegBookmark /> {isSaved ? 'Da luu' : 'Luu tin'}
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Mo ta cong viec</h2>
            {description.length ? <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{description.map((d, i) => <li key={i}>{d}</li>)}</ul> : <p className="text-sm text-gray-500">Chua cap nhat.</p>}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Trach nhiem</h2>
            {responsibilities.length ? <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{responsibilities.map((d, i) => <li key={i}>{d}</li>)}</ul> : <p className="text-sm text-gray-500">Chua cap nhat.</p>}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Yeu cau</h2>
            {requirements.length ? <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{requirements.map((d, i) => <li key={i}>{d}</li>)}</ul> : <p className="text-sm text-gray-500">Chua cap nhat.</p>}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Quyen loi</h2>
            {benefits.length ? <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{benefits.map((d, i) => <li key={i}>{d}</li>)}</ul> : <p className="text-sm text-gray-500">Chua cap nhat.</p>}
          </div>
        </section>

        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit space-y-4">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-40 w-full bg-gray-100">
              <iframe
                title="Job location map"
                src={googleMapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3 text-sm font-semibold text-[#1967D2] hover:bg-blue-50 border-t border-gray-100 inline-flex items-center gap-2 w-full"
            >
              <FaMapMarkerAlt /> Xem tren Google Maps
            </a>
          </div>

          <h3 className="font-bold text-gray-900">Nhan tin voi nha tuyen dung</h3>
          <p className="text-sm text-gray-500">Gui cau hoi ve cong viec nay, sau do tiep tuc trao doi tai trang nhan tin.</p>
          <textarea
            rows={5}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Nhap noi dung tin nhan..."
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#3AB4E6] outline-none"
          />
          <button
            onClick={handleContactCompany}
            disabled={sendingContact}
            className="w-full h-11 rounded-xl bg-[#1967D2] text-white font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <FaEnvelope /> {sendingContact ? 'Dang gui...' : 'Gui tin nhan'}
          </button>
        </aside>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-black text-gray-900 mb-4">Viec lam lien quan</h2>
        {relatedLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : relatedJobs.length > 0 ? (
          <div className="space-y-4">
            {relatedJobs.map((job) => (
              <JobCard key={job.id} job={mapJobToCard(job)} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-sm text-gray-500">
            Hien chua co viec lam lien quan phu hop.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
