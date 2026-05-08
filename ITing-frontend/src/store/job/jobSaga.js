import { call, put, takeLatest } from 'redux-saga/effects';
import jobService from '../../services/jobService';
import {
    fetchJobsRequest, fetchJobsSuccess, fetchJobsFailure,
    fetchLatestJobsRequest,
    fetchLatestJobsSuccess,
    fetchLatestJobsFailure,
    fetchJobDetailRequest, fetchJobDetailSuccess, fetchJobDetailFailure
} from './jobSlice';

// #region agent log
const __agentLog = (hypothesisId, message, data) => {
    try {
        fetch('http://127.0.0.1:7551/ingest/7a4fdce7-5a32-4f17-ae03-3125af2172e9', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Debug-Session-Id': '17ec69',
            },
            body: JSON.stringify({
                sessionId: '17ec69',
                runId: 'pre-fix-ux',
                hypothesisId,
                location: 'src/store/job/jobSaga.js:agent',
                message,
                data,
                timestamp: Date.now(),
            }),
        }).catch(() => { });
    } catch { }
};
// #endregion agent log

// Worker: Lấy danh sách jobs
function* handleFetchJobs(action) {
    try {
        // action.payload là params gửi vào (page, keyword...)
        const params = action.payload;
        const data = yield call(jobService.getJobs, params);

        // Dispatch success
        yield put(fetchJobsSuccess(data));
    } catch (error) {
        const message = error.message || "Failed to fetch jobs";
        yield put(fetchJobsFailure(message));
    }
}

// Worker: Lấy chi tiết job
function* handleFetchJobDetail(action) {
    try {
        const id = action.payload; // payload là job ID
        // #region agent log
        __agentLog('H3', 'job.detail.request', { id: String(id || '') });
        // #endregion agent log
        const data = yield call(jobService.getJobDetail, id);
        // #region agent log
        __agentLog('H3', 'job.detail.success', { id: String(id || ''), hasData: Boolean(data), dataId: String(data?.id || '') });
        // #endregion agent log
        yield put(fetchJobDetailSuccess(data));
    } catch (error) {
        const message = error.message || "Failed to fetch job detail";
        // #region agent log
        __agentLog('H4', 'job.detail.failure', {
            id: String(action?.payload || ''),
            message,
            errorType: String(error?.name || typeof error),
            status: error?.status || error?.statusCode || error?.code || undefined,
            apiMessage: error?.message || error?.error || undefined,
        });
        // #endregion agent log
        yield put(fetchJobDetailFailure(message));
    }
}

function* handleFetchLatestJobs(action) {
    try {
        const limit = action.payload || 10;
        const data = yield call(jobService.getLatestJobs, limit);
        yield put(fetchLatestJobsSuccess(data));
    } catch (error) {
        yield put(fetchLatestJobsFailure(error.response?.data?.message || error.message));
    }
}

// Watcher
export default function* jobSaga() {
    yield takeLatest(fetchJobsRequest.type, handleFetchJobs);
    yield takeLatest(fetchLatestJobsRequest.type, handleFetchLatestJobs);
    yield takeLatest(fetchJobDetailRequest.type, handleFetchJobDetail);
}
