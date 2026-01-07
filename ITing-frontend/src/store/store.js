import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';
import authReducer from './auth/authSlice'; // Import reducer thật
import jobReducer from './job/jobSlice'; // Import reducer job
import userReducer from './user/userSlice'; // Import reducer user
import companyReducer from './company/companySlice'; // Import reducer company
import applicationReducer from './application/applicationSlice'; // Import reducer application

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        auth: authReducer,
        job: jobReducer, // Đăng ký job reducer
        user: userReducer, // Đăng ký user reducer
        company: companyReducer, // Đăng ký company reducer
        application: applicationReducer, // Đăng ký application reducer
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