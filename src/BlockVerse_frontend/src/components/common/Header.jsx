import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import WalletBalance from '../payments/WalletBalance';

const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">BV</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            BlockVerse
                        </span>
                    </Link>
                </div>

                <div className="flex-1 max-w-2xl mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users, posts..."
                            className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-full border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <WalletBalance />

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-3">
                        <Link
                            to={`/profile/${user?.id}`}
                            className="flex items-center space-x-2 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
                        >
                            <img
                                src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                alt={user?.username}
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-white font-medium">{user?.username}</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;