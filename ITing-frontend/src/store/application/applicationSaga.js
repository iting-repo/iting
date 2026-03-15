import { call, put, takeLatest } from 'redux-saga/effects';
import applicationService from '../../services/applicationService';
import {
    fetchApplicationsRequest, fetchApplicationsSuccess, fetchApplicationsFailure
} from './applicationSlice';

// Worker: Lấy danh sách ứng viên
function* handleFetchApplications(action) {
    try {
        const { jobId, employerId, ...params } = action.payload;
        if (!jobId || !employerId) throw new Error("Missing jobId or employerId");

        const data = yield call(applicationService.getJobApplications, jobId, employerId, params);
        yield put(fetchApplicationsSuccess(data));
    } catch (error) {
        const message = error.message || "Failed to fetch applications";
        yield put(fetchApplicationsFailure(message));
    }
}

// Watcher
export default function* applicationSaga() {
    yield takeLatest(fetchApplicationsRequest.type, handleFetchApplications);
}
