import { call, put, takeLatest, all } from 'redux-saga/effects';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import {
    fetchJobsRequest, fetchJobsSuccess, fetchJobsFailure,
    fetchJobDetailRequest, fetchJobDetailSuccess, fetchJobDetailFailure,
    fetchCompanyJobsRequest, fetchCompanyJobsSuccess, fetchCompanyJobsFailure
} from './jobSlice';

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
        const data = yield call(jobService.getJobDetail, id);
        yield put(fetchJobDetailSuccess(data));
    } catch (error) {
        yield put(fetchJobDetailFailure(message));
    }
}

// Worker: Lấy danh sách jobs của công ty
function* handleFetchCompanyJobs(action) {
    try {
        const { employerId, ...params } = action.payload; // Payload chứa employerId và các params khác
        if (!employerId) throw new Error("Missing employerId");

        const data = yield call(jobService.getCompanyJobs, employerId, params);

        // Fetch application counts for each job
        if (data && data.content && Array.isArray(data.content)) {
            const jobs = data.content;
            const applicationEffects = jobs.map(job =>
                call(applicationService.getJobApplications, job.id, employerId, { page: 0, size: 1 })
            );

            const applicationResponses = yield all(applicationEffects);

            const enrichedJobs = jobs.map((job, index) => {
                const appResponse = applicationResponses[index];
                // Check if response has totalElements (Page) or is an array
                const totalApps = appResponse?.totalElements !== undefined
                    ? appResponse.totalElements
                    : (Array.isArray(appResponse) ? appResponse.length : 0);

                return { ...job, applicationCount: totalApps };
            });

            data.content = enrichedJobs;
        }

        yield put(fetchCompanyJobsSuccess(data));
    } catch (error) {
        const message = error.message || "Failed to fetch company jobs";
        yield put(fetchCompanyJobsFailure(message));
    }
}

// Watcher
export default function* jobSaga() {
    yield takeLatest(fetchJobsRequest.type, handleFetchJobs);
    yield takeLatest(fetchJobDetailRequest.type, handleFetchJobDetail);
    yield takeLatest(fetchCompanyJobsRequest.type, handleFetchCompanyJobs);
}
