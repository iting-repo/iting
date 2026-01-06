import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import authReducer from './auth/authSlice'; // Import reducer thật
import jobReducer from './job/jobSlice'; // Import reducer job
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        auth: authReducer,
        job: jobReducer, // Đăng ký job reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
            serializableCheck: {
                // Bỏ qua kiểm tra tính serializable cho các action này
                // auth/loginRequest là tên action type (bạn có thể check trong Redux DevTools)
                ignoredActions: ['auth/loginRequest', 'auth/registerRequest'],
                // Hoặc bỏ qua kiểm tra cho mọi field có tên là "navigate" hoặc "onSuccess" trong payload
                ignoredActionPaths: ['payload.navigate', 'payload.onSuccess'],

            },
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store;