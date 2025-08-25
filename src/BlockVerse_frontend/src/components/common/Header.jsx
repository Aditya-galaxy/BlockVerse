import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LoginButton from '../auth/LoginButton';
import { FiSearch, FiSun, FiMoon, FiBell } from 'react-icons/fi';

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <h1>BlockVerse</h1>
                </Link>

                {isAuthenticated && (
                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="search-input-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search users and posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </form>
                )}

                <div className="header-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>

                    {isAuthenticated && (
                        <>
                            <button className="notifications-btn">
                                <FiBell />
                                <span className="notification-badge">3</span>
                            </button>

                            <Link to={`/profile/${user?.id}`} className="profile-link">
                                <img
                                    src={user?.avatar_url || '/default-avatar.png'}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                            </Link>
                        </>
                    )}

                    <LoginButton />
                </div>
            </div>
        </header>
    );
};

export default Header;