import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginButton = () => {
    const { login } = useAuth();
    const [isLogging, setIsLogging] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLogging(true);
            await login();
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <button
            onClick={handleLogin}
            disabled={isLogging}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLogging ? (
                <LoadingSpinner size="sm" />
            ) : (
                <LogIn className="w-5 h-5" />
            )}
            <span>{isLogging ? 'Connecting...' : 'Login with Internet Identity'}</span>
        </button>
    );
};

export default LoginButton;