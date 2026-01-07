import { call, put, takeLatest } from 'redux-saga/effects';
import companyService from '../../services/companyService';
import {
    fetchCompanyRequest,
    fetchCompanySuccess,
    fetchCompanyFailure
} from './companySlice';

function* fetchCompanySaga(action) {
    try {
        const { companyId } = action.payload;
        console.log('[DEBUG] fetchCompanySaga companyId:', companyId);
        const response = yield call(companyService.getCompanyProfile, companyId);
        console.log('[DEBUG] fetchCompanySaga response:', response);
        yield put(fetchCompanySuccess(response));
    } catch (error) {
        console.error('[DEBUG] fetchCompanySaga error:', error);
        yield put(fetchCompanyFailure(error.message || 'Failed to fetch company profile'));
    }
}

export default function* companySaga() {
    yield takeLatest(fetchCompanyRequest.type, fetchCompanySaga);
}
