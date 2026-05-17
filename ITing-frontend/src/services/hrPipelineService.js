import axios from "../utils/axiosInstance";

const hrPipelineService = {
  getStages: () =>
    axios.get('/hr/pipeline/stages').then((r) => r.data),

  /** Kanban view: applications grouped by stage for one job. */
  kanban: (jobId) =>
    axios.get(`/hr/pipeline/jobs/${jobId}`).then((r) => r.data),

  /** Move a candidate to another stage. Optionally send templated email. */
  moveStage: (applyFormId, jobId, payload) =>
    axios.post(`/hr/pipeline/applications/${applyFormId}/${jobId}/move`, payload).then((r) => r.data),

  listTemplates: () =>
    axios.get('/hr/pipeline/templates').then((r) => r.data),

  createTemplate: (payload) =>
    axios.post('/hr/pipeline/templates', payload).then((r) => r.data),
};

export default hrPipelineService;
