import React from 'react';
import LoginButton from './LoginButton';

const AuthGuard = ({ children }) => {
    return (
        <div className="flex flex-col items-center space-y-6">
            <LoginButton />
            {children}
        </div>
    );
};

export default AuthGuard;