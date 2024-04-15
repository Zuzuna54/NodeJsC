import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticationStatus, setUser } from '../../../redux/actions/authActions';
import { useNavigate, Link } from 'react-router-dom';
import './Login.scss';
import { login } from "../../../axios/customAxios";

const LoginForm = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginError, setIsLoginError] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if username is empty
        if (!username) {
            setIsLoginError(true);
            setLoginError('Username cannot be empty');
            return;
        }

        // Check if password is empty
        if (!password) {
            setIsLoginError(true);
            setLoginError('Password cannot be empty');
            return;
        }

        try {

            const requestBody = { username, password };
            await login(requestBody).then((response) => {

                if (response?.status !== 200) {
                    // If the login is unsuccessful
                    setIsLoginError(true);
                    setLoginError(response?.data.message || 'Login failed. Please check your credentials.');
                    return;
                }

                // If the login is successful
                setIsLoginError(false);
                setLoginError('');
                dispatch(setAuthenticationStatus(true));

                // You can dispatch setUser if needed
                dispatch(setUser(username));
                localStorage.setItem("accessToken", response?.data.accessToken);
                localStorage.setItem("refreshToken", response?.data.refreshToken);
                localStorage.setItem("username", username);
                // Redirect to the dashboard or any other route
                navigate('/dashboard/upload');

            }).catch((error) => {

                console.error('Login failed. Please check your credentials.', error);
                setIsLoginError(true);
                setLoginError('Login failed. Please check your credentials.');

            });

        } catch (error) {

            console.error('Login failed. Please check your credentials.', error);
            setIsLoginError(true);
            setLoginError('Login failed. Please check your credentials.');

        }
    };


    return (
        <form className={isLoginError ? 'error-visible' : ''} onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </div>
            <div>
                <button type="submit">Login</button>
            </div>
            <div className="error-log">
                {isLoginError && (
                    <div>
                        <p>{loginError}</p>
                    </div>
                )}
            </div>
            <div>
                <p>
                    Not registered? <Link to="/register">Register here</Link>.
                </p>
            </div>
        </form>
    );
};

export default LoginForm;
