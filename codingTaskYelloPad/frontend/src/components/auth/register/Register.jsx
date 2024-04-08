import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./Register.scss";
import { register } from "../../../axios/customAxios";

const RegistrationForm = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistrationError, setIsRegistrationError] = useState(false);
    const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
    const [registrationError, setRegistrationError] = useState('');

    useEffect(() => {
        // Check if passwords match whenever password or confirmPassword changes
        const doPasswordsMatch = password === confirmPassword;
        setIsRegistrationError(!doPasswordsMatch);
        setRegistrationError(doPasswordsMatch ? '' : 'Passwords do not match');
    }, [password, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if any field is empty
        if (!username || !email || !password || !confirmPassword) {
            setIsRegistrationError(true);
            setRegistrationError('All fields must be filled');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setIsRegistrationError(true);
            setRegistrationError('Passwords do not match');
            return;
        }

        try {
            const response = await register({
                username: username.toLowerCase(),
                email,
                password,
                userType: 'USER',
            });

            if (response?.status !== 200) {
                setIsRegistrationError(true);
                setRegistrationError(response.data.message || 'Registration failed. Please try again.');
                return;
            }

            setIsRegistrationError(false);
            setIsRegistrationSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/');
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setIsRegistrationSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Registration failed:', error);
            setIsRegistrationError(true);
            setRegistrationError('Registration failed. Please try again.');
        }
    };

    return (
        <form className={isRegistrationError ? 'error-visible' : ''} onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <div>
                <button type="submit">Register</button>
            </div>

            <div className={isRegistrationSuccess ? 'success-log' : 'error-log'}>
                {isRegistrationSuccess ? (
                    <div>
                        <p>User created successfully!</p>
                    </div>
                ) : (
                    <div>
                        <p>{registrationError}</p>
                    </div>
                )}
            </div>

            <div className="login-link">
                <p>Already have an account? <Link to="/">Login here</Link></p>
            </div>
        </form>
    );
};

export default RegistrationForm;
