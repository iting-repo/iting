import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FaEnvelope, FaArrowRight, FaUser, FaTimes } from 'react-icons/fa';
import SEO from '../../components/common/SEO';
import hrPipelineService from '../../services/hrPipelineService';
import companyService from '../../services/companyService';

/**
 * Kanban-style HR hiring pipeline view.
 *
 * 5 stages (+REJECTED): SCREENING → PHONE_SCREEN → INTERVIEW → OFFER → HIRED.
 * HR can pick a job (URL param ?jobId=N) then drag/click candidates between columns.
 */
const STAGE_LABELS = {
  SCREENING: { title: 'Lọc CV', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  PHONE_SCREEN: { title: 'Phỏng vấn sơ bộ', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  INTERVIEW: { title: 'Phỏng vấn', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  OFFER: { title: 'Đã offer', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  HIRED: { title: 'Đã tuyển', color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
  REJECTED: { title: 'Từ chối', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

const VALID_NEXT_STAGES = ['SCREENING', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

const PipelineKanbanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moveDialog, setMoveDialog] = useState(null);   // {app, toStage}
  const [templates, setTemplates] = useState([]);

  // Load HR's jobs once on mount
  useEffect(() => {
    companyService.getMyJobs?.(0, 200).then((resp) => {
      const items = resp?.data?.content || resp?.content || resp?.data || [];
      setJobs(items);
      if (!jobId && items.length > 0) {
        setSearchParams({ jobId: String(items[0].id) });
      }
    }).catch(() => {});
    hrPipelineService.listTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload board when job changes
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    hrPipelineService.kanban(jobId)
      .then(setBoard)
      .catch(() => toast.error('Không tải được danh sách ứng viên'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const confirmMove = async () => {
    if (!moveDialog) return;
    const { app, toStage, templateId, note, sendEmail } = moveDialog;
    try {
      const r = await hrPipelineService.moveStage(
          app.applyFormId, jobId, { toStage, templateId, note, sendEmail });
      toast.success(`Đã chuyển sang ${STAGE_LABELS[toStage]?.title}`
          + (r.emailSent ? ' + email đã gửi' : ''));
      setMoveDialog(null);
      // Reload board
      hrPipelineService.kanban(jobId).then(setBoard);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi chuyển stage');
    }
  };

  return (
    <>
      <SEO title="Pipeline ứng viên" noIndex />

      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pipeline ứng viên</h1>
            <p className="text-sm text-slate-500">Quản lý workflow tuyển dụng 5-stage</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Job:</label>
            <select
              value={jobId || ''}
              onChange={(e) => setSearchParams({ jobId: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-md bg-white text-sm min-w-64"
            >
              <option value="">-- Chọn job --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title || j.position} (#{j.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {!jobId ? (
          <div className="text-center py-20 text-slate-400">
            Chọn 1 job ở trên để xem pipeline ứng viên.
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-slate-400">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto">
            {Object.entries(STAGE_LABELS).map(([stage, meta]) => {
              const apps = board?.[stage] || [];
              return (
                <div key={stage} className="bg-slate-50 rounded-xl p-3 min-h-96">
                  <div className="flex items-center justify-between mb-3 sticky top-0 bg-slate-50 py-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                      <h3 className="font-semibold text-sm text-slate-800">{meta.title}</h3>
                    </div>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                      {apps.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {apps.map((app) => (
                      <CandidateCard
                        key={app.applyFormId}
                        app={app}
                        onMove={(toStage) => setMoveDialog({ app, toStage })}
                      />
                    ))}
                    {apps.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Chưa có ứng viên
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Move dialog */}
      {moveDialog && (
        <MoveStageDialog
          app={moveDialog.app}
          initialToStage={moveDialog.toStage}
          templates={templates}
          onClose={() => setMoveDialog(null)}
          onConfirm={(data) => {
            setMoveDialog((prev) => ({ ...prev, ...data }));
            // Immediately confirm
            const final = { ...moveDialog, ...data };
            confirmMoveWith(final);
          }}
        />
      )}
    </>
  );

  async function confirmMoveWith(args) {
    const { app, toStage, templateId, note, sendEmail } = args;
    try {
      const r = await hrPipelineService.moveStage(
          app.applyFormId, jobId, { toStage, templateId, note, sendEmail });
      toast.success(`Đã chuyển sang ${STAGE_LABELS[toStage]?.title}`
          + (r.emailSent ? ' + email đã gửi cho ứng viên' : ''));
      setMoveDialog(null);
      hrPipelineService.kanban(jobId).then(setBoard);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Lỗi chuyển stage');
    }
  }
};

// ─── Candidate card ───────────────────────────────────────────────

const CandidateCard = ({ app, onMove }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg p-3 ring-1 ring-slate-200 hover:shadow-md transition relative">
      <div className="flex items-center gap-2 mb-2">
        {app.candidateAvatar ? (
          <img src={app.candidateAvatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
            <FaUser className="text-xs" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">
            {app.candidateName || 'Ứng viên'}
          </div>
          <div className="text-xs text-slate-500 truncate">{app.candidateEmail}</div>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Apply: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : '-'}
      </div>

      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="mt-2 w-full px-2 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center gap-1"
      >
        <FaArrowRight className="w-2.5 h-2.5" /> Chuyển stage
      </button>

      {showMenu && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl ring-1 ring-slate-200 py-1">
          {VALID_NEXT_STAGES.filter((s) => s !== app.pipelineStage).map((s) => (
            <button
              key={s} type="button"
              onClick={() => { setShowMenu(false); onMove(s); }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${STAGE_LABELS[s]?.dot}`} />
              {STAGE_LABELS[s]?.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Move stage dialog ────────────────────────────────────────────

const MoveStageDialog = ({ app, initialToStage, templates, onClose, onConfirm }) => {
  const [templateId, setTemplateId] = useState('');
  const [note, setNote] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-700" aria-label="Đóng">
          <FaTimes />
        </button>

        <h3 className="text-lg font-bold mb-1">Chuyển ứng viên</h3>
        <p className="text-sm text-slate-600 mb-4">
          <strong>{app.candidateName}</strong> →{' '}
          <span className="text-blue-600">{STAGE_LABELS[initialToStage]?.title}</span>
        </p>

        <label className="block text-sm font-medium text-slate-700 mb-1.5">Ghi chú (nội bộ)</label>
        <textarea
          rows={2} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Skill khớp 80%, schedule phỏng vấn..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4"
        />

        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox" checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">
              <FaEnvelope className="inline mr-1" /> Gửi email cho ứng viên
            </span>
          </label>
          {sendEmail && (
            <select
              value={templateId} onChange={(e) => setTemplateId(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="">(Auto theo stage)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateType} — {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
          >Hủy</button>
          <button
            onClick={() => onConfirm({ toStage: initialToStage, templateId: templateId || null, note, sendEmail })}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >Xác nhận chuyển</button>
        </div>
      </div>
    </div>
  );
};

export default PipelineKanbanPage;
