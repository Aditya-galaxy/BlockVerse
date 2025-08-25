import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginButton = () => {
    const { login, logout, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await login();
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="small" />;
    }

    if (isAuthenticated) {
        return (
            <div className="user-menu">
                <span className="username">@{user?.username || 'User'}</span>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        );
    }

    return (
        <button onClick={handleLogin} className="login-btn">
            Connect with Internet Identity
        </button>
    );
};

export default LoginButton;