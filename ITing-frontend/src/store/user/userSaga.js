import { call, put, takeLatest } from 'redux-saga/effects';
import userService from '../../services/userService';
import {
    fetchProfileRequest,
    fetchProfileSuccess,
    fetchProfileFailure
} from './userSlice';

function* fetchProfileSaga(action) {
    try {
        const { userId } = action.payload || {};
        console.log('[DEBUG] fetchProfileSaga userId:', userId);
        const response = yield call(userService.getProfile, userId);
        console.log('[DEBUG] fetchProfileSaga response:', response);
        yield put(fetchProfileSuccess(response));
    } catch (error) {
        console.error('[DEBUG] fetchProfileSaga error:', error);
        yield put(fetchProfileFailure(error.message || 'Failed to fetch profile'));
    }
}

export default function* userSaga() {
    yield takeLatest(fetchProfileRequest.type, fetchProfileSaga);
}
