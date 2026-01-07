import { all, fork } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import jobSaga from './job/jobSaga'; // Import jobSaga
import userSaga from './user/userSaga'; // Import userSaga
import companySaga from './company/companySaga'; // Import companySaga
import applicationSaga from './application/applicationSaga'; // Import applicationSaga

export default function* rootSaga() {
    yield all([
        authSaga(),
        jobSaga(), // Đăng ký jobSaga
        userSaga(), // Đăng ký userSaga
        companySaga(), // Đăng ký companySaga
        applicationSaga(), // Đăng ký applicationSaga
    ]);
}