import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // serializableCheck: {
            //     ignoreActions: ['files/uploadAndSaveFile']
            // }
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);