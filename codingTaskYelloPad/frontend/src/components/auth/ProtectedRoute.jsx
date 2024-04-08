// ProtectedRoute.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthenticationStatus } from '../../redux/actions/authActions';
import Loading from '../shared/Loading/Loading';

const ProtectedRoutes = () => {

    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.authState.isAuthenticated);
    const token = localStorage.getItem('accessToken') || '';

    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Check if the user is not authenticated but the token exists
        if (!isAuthenticated && token) {
            dispatch(setAuthenticationStatus(true));
        }

        // Simulate a loading delay (you can adjust the timeout duration)
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeout); // Cleanup the timeout on unmount

    }, [dispatch, isAuthenticated, token]);

    // Render content based on loading state
    return isLoading ? (
        <div><Loading /></div>
    ) : isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate replace to='/401' />
    );
}

export default ProtectedRoutes;