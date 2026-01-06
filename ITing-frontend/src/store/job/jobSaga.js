import { call, put, takeLatest } from 'redux-saga/effects';
import jobService from '../../services/jobService';
import {
    fetchJobsRequest, fetchJobsSuccess, fetchJobsFailure,
    fetchJobDetailRequest, fetchJobDetailSuccess, fetchJobDetailFailure
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
        const message = error.message || "Failed to fetch job detail";
        yield put(fetchJobDetailFailure(message));
    }
}

// Watcher
export default function* jobSaga() {
    yield takeLatest(fetchJobsRequest.type, handleFetchJobs);
    yield takeLatest(fetchJobDetailRequest.type, handleFetchJobDetail);
}
