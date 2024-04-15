// NotAuthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotAuthorized.scss'; // Import your custom styles

function NotAuthorized() {
    return (
        <div className="not-authorized-container">
            <div className="not-authorized-content">
                <h2 className="not-authorized-title">Access Denied</h2>
                <p className="not-authorized-message">
                    Sorry, you do not have the necessary permissions to access this page.
                </p>
                <Link to="/" className="not-authorized-link">
                    Go to Home
                </Link>
            </div>
        </div>
    );
}

export default NotAuthorized;
