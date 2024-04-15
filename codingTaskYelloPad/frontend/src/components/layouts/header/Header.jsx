import React from 'react';
import './Header.scss';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthenticationStatus, setUser } from '../../../redux/actions/authActions';
import FilerUploadLogo from '../../../assets/upload.jpeg';


const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = localStorage.getItem('username');


    const handleLogOut = () => {
        // Clear user data from Redux store and local storage
        dispatch(setAuthenticationStatus(false));
        dispatch(setUser(''));
        localStorage.removeItem("accessToken");

        // Navigate to the home page after logout
        navigate('/');
    }

    const handeleWelcomeText = () => {
        if (user) {
            return `Welcome to the Filler Manager ${user}`;
        }
        return 'Welcome to the Filler Manager';
    }

    return (
        <header className="header">
            <div className="logo-container left">
                {/* Left logo placeholder */}
                <img src={FilerUploadLogo} alt="Left Logo" className="logo" />
            </div>
            <div className="title-container">
                <h1 className="title">{handeleWelcomeText()}</h1>
                {/* You can add more information or content here */}
            </div>
            <button className='log-in-btn' onClick={handleLogOut}>Log Out</button>
        </header>
    );
};

export default Header;
