// index.js
import { combineReducers } from 'redux';
import authStateReducer from './authStateReducer';


const rootReducer = combineReducers({
    authState: authStateReducer
});

export default rootReducer;
