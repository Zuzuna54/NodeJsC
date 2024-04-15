// reducers.js

const initialState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: {}
};

const authStateReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_AUTHENTICATION_STATUS':
            return {
                ...state,
                isAuthenticated: action.payload,
            };
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            }
        case 'SET_ACCESS_TOKEN':
            return {
                ...state,
                accessToken: action.payload
            }
        case 'SET_REFRESH_TOKEN':
            return {
                ...state,
                refreshToken: action.payload
            }

        default:
            return state;
    }
};

export default authStateReducer;