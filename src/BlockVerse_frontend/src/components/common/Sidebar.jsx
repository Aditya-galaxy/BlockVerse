import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Hash, TrendingUp, Bookmark, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Hash, label: 'Explore', path: '/explore' },
        { icon: TrendingUp, label: 'Trending', path: '/trending' },
        { icon: MessageCircle, label: 'Messages', path: '/messages' },
        { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
        { icon: Users, label: 'Communities', path: '/communities' },
        { icon: User, label: 'Profile', path: `/profile/${user?.id}` },
    ];

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wide">
                        Suggested Users
                    </h3>
                    <div className="space-y-3">
                        {/* This would be populated with actual suggested users */}
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=suggested1"
                                alt="Suggested user"
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">crypto_dev</p>
                                <p className="text-gray-400 text-xs truncate">Building the future</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;