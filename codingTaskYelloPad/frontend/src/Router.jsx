import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoutes from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Loading from './components/shared/Loading/Loading';
import ScrollToTop from './components/shared/ScrollToTop';


const Layout = React.lazy(() => import('./components/layouts/PublicLayout'));
const LogInPage = React.lazy(() => import('./components/auth/preAuth/Login'));
const NotAuthorized = React.lazy(() => import('./components/NotAuthorized/NotAuthorized'));
const Register = React.lazy(() => import('./components/auth/preAuth/Register'));
const History = React.lazy(() => import('./components/pages/history/History'));
const Upload = React.lazy(() => import('./components/pages/uploadFile/Upload'));

export default function Routing() {

    return (
        <AuthProvider>
            <ErrorBoundary>
                <Suspense fallback={<Loading />}>
                    <ScrollToTop />
                    <Routes>
                        <Route path='/401' element={<NotAuthorized />} />
                        <Route path='/' element={<LogInPage />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/dashboard' element={<ProtectedRoutes />} >
                            <Route path='' element={<Layout />} >
                                <Route path='upload' element={<Upload />} />
                                <Route path='history' element={<History />} />
                            </Route>
                        </Route>
                        <Route path='*' element={<Navigate replace to='/dashboard' />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </AuthProvider >
    );
};