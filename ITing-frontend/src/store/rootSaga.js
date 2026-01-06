import { all, fork } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import jobSaga from './job/jobSaga'; // Import jobSaga

export default function* rootSaga() {
    yield all([
        authSaga(),
        jobSaga(), // Đăng ký jobSaga
    ]);
}