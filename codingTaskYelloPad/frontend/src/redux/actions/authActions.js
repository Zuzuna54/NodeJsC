// authActions.js
export const login = () => ({
    type: 'LOGIN',
});

export const logout = () => ({
    type: 'LOGOUT',
});

export const setAuthenticationStatus = (isAuthenticated) => ({
    type: 'SET_AUTHENTICATION_STATUS',
    payload: isAuthenticated,
});

export const setUser = (user) => ({
    type: 'SET_USER',
    payload: user,
});

export const setAccessToken = (accessToken) => ({
    type: 'SET_ACCESS_TOKEN',
    payload: accessToken,
});

export const setRefreshToken = (refreshToken) => ({
    type: 'SET_REFRESH_TOKEN',
    payload: refreshToken,
});