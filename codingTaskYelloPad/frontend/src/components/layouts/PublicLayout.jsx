import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './sideBar/Sidebar';
import Header from './header/Header';
import { setAuthenticationStatus, setAccessToken } from '../../redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from '../../axios/customAxios';
import './Layout.scss';
import { te } from 'date-fns/locale';

function PublicLayout() {

    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.authState.isAuthenticated);
    const token = localStorage.getItem('accessToken') || '';
    const refreshTokenSTR = localStorage.getItem('refreshToken') || '';

    useEffect(() => {

        console.log('PublicLayout useEffect');
        // Check if authentication status is not initialized yet
        if (isAuthenticated === null && token) {
            console.log('Setting authentication status to true');
            dispatch(setAuthenticationStatus(true));
        }

        console.log('Setting up token refresh interval...');
        console.log('Token:', refreshTokenSTR);

        // Set up token refresh every 20 minutes
        const refreshInterval = setInterval(async () => {
            console.log('Refreshing token...');
            try {

                // Call your refresh token function
                const requestBody = {
                    refreshToken: refreshTokenSTR,
                };
                await refreshToken(requestBody).then((response) => {

                    if (response?.status !== 200) {
                        // An error occurred, stop refreshing

                        console.error('Error refreshing token:', response);
                        clearInterval(refreshInterval);
                        return;
                    }
                    console.log('newToken:', response.data.accessToken);
                    console.log('oldToken:', token);
                    console.log(`before changing token in local storage: ${localStorage.getItem('accessToken')}`);
                    //Dispatch the action to update the authentication status
                    dispatch(setAuthenticationStatus(true));
                    // Save the new access token
                    localStorage.setItem('accessToken', response.data.accessToken);
                    dispatch(setAccessToken(response.data.accessToken));

                    console.log(`after changing token in local storage: ${localStorage.getItem('accessToken')}`);
                }).catch((error) => {

                    console.error('Error refreshing token:', error);
                    clearInterval(refreshInterval);
                });

            } catch (error) {

                console.error('Error refreshing token:', error);
                clearInterval(refreshInterval);
            }

        }, 10000) //1000 * 60 * 20)  // 20 minutes in milliseconds

        // Clear the interval on component unmount
        return () => clearInterval(refreshInterval);
    }, [dispatch, isAuthenticated, token, refreshTokenSTR]);


    return (

        <div className='main-page'>
            <Header />
            <div className='main-page-content'>

                <SideBar />
                <div className='mainPage-content-container'>
                    <Outlet />
                </div>
            </div>

        </div>

    );
}

export default PublicLayout;
