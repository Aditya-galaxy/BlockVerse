import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../feed/PostCard';
import FollowButton from './FollowButton';
import EditProfile from './EditProfile';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiMapPin, FiCalendar, FiEdit3 } from 'react-icons/fi';

const ProfilePage = () => {
    const { userId } = useParams();
    const { actor, principal } = useAuth();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');

    const isOwnProfile = principal?.toString() === userId;

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);

            const userResult = await actor.get_user(userId);
            if (userResult.length > 0) {
                setUser(userResult[0]);

                // Load user's posts
                const userPosts = await actor.get_user_posts(userId);
                setPosts(userPosts);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="profile-not-found">
                <h2>User not found</h2>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-cover">
                    {/* Cover image would go here */}
                </div>

                <div className="profile-info">
                    <div className="profile-avatar-container">
                        <img
                            src={user.avatar_url || '/default-avatar.png'}
                            alt="Profile avatar"
                            className="profile-avatar"
                        />
                    </div>

                    <div className="profile-details">
                        <div className="profile-actions">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditProfile(true)}
                                    className="edit-profile-btn"
                                >
                                    <FiEdit3 /> Edit Profile
                                </button>
                            ) : (
                                <FollowButton userId={userId} />
                            )}
                        </div>

                        <h1 className="profile-name">@{user.username}</h1>
                        <p className="profile-bio">{user.bio}</p>

                        <div className="profile-meta">
                            <span className="join-date">
                                <FiCalendar />
                                Joined {new Date(Number(user.created_at) / 1000000).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="profile-stats">
                            <div className="stat">
                                <span className="stat-value">{user.posts_count}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{user.following_count}</span>
                                <span className="stat-label">Following</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{user.followers_count}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                >
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('replies')}
                    className={`tab-btn ${activeTab === 'replies' ? 'active' : ''}`}
                >
                    Replies
                </button>
                <button
                    onClick={() => setActiveTab('likes')}
                    className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
                >
                    Likes
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'posts' && (
                    <div className="posts-list">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        {posts.length === 0 && (
                            <div className="no-posts">
                                <p>{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showEditProfile && (
                <EditProfile
                    user={user}
                    onClose={() => setShowEditProfile(false)}
                    onProfileUpdated={(updatedUser) => {
                        setUser(updatedUser);
                        setShowEditProfile(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProfilePage;