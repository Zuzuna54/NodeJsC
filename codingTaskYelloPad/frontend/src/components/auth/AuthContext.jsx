// AuthContext.js
import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children, isAuthenticated, setIsAuthenticated }) => {

    const login = () => {
        // Perform your login logic (e.g., authentication API call)
        // Set isAuthenticated to true upon successful login
        setIsAuthenticated(true);
    };

    const logout = () => {
        // Perform your logout logic
        // Set isAuthenticated to false
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
