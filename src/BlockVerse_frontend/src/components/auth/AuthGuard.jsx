import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginButton from './LoginButton';
import LoadingSpinner from '../common/LoadingSpinner';

const AuthGuard = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return (
            <div className="auth-guard">
                <div className="auth-prompt">
                    <h2>Welcome to BlockVerse</h2>
                    <p>Connect with Internet Identity to get started</p>
                    <LoginButton />
                </div>
            </div>
        );
    }

    return children;
};

export default AuthGuard;