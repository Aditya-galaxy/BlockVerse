import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import PostCard from '../feed/PostCard';
import FollowButton from './FollowButton';
import EditProfile from './EditProfile';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { userId } = useParams();
    const { actor, user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        loadUserProfile();
    }, [userId, actor]);

    const loadUserProfile = async () => {
        if (!actor || !userId) return;

        try {
            setLoading(true);

            // Load user data
            const userData = await actor.get_user(userId);
            if (userData && userData.length > 0) {
                setUser(userData[0]);

                // Load user posts
                const userPosts = await actor.get_user_posts(userId);
                setPosts(userPosts);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };


    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const formatJoinDate = (timestamp) => {
        return formatDistanceToNow(new Date(Number(timestamp) / 1000000), { addSuffix: true });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">User not found</p>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Profile Header */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                {/* Cover Photo */}
                <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600"></div>

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between -mt-16">
                        <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.username}
                            className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-800"
                        />

                        <div className="mt-16">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <FollowButton userId={user.id} />
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                        <p className="text-gray-400">@{user.id.toString().slice(-8)}</p>
                    </div>

                    {user.bio && (
                        <p className="mt-3 text-white">{user.bio}</p>
                    )}

                    <div className="flex items-center space-x-4 mt-4 text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Joined {formatJoinDate(user.created_at)}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{user.posts_count}</div>
                            <div className="text-gray-400 text-sm">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{user.following_count}</div>
                            <div className="text-gray-400 text-sm">Following</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{user.followers_count}</div>
                            <div className="text-gray-400 text-sm">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{(user.balance / 100000000).toFixed(2)} ICP</div>
                            <div className="text-gray-400 text-sm">Balance</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-6">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-8">
                        {['posts', 'likes', 'media'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                    ? 'border-purple-500 text-purple-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onUpdate={handlePostUpdate}
                            />
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg">No posts yet</p>
                                {isOwnProfile && (
                                    <p className="text-gray-500 mt-2">Share your first post to get started!</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfile
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default ProfilePage;