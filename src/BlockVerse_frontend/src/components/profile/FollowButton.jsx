import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const FollowButton = ({ userId }) => {
    const { actor, user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [checkingFollow, setCheckingFollow] = useState(true);

    useEffect(() => {
        checkFollowStatus();
    }, [userId, user]);

    const checkFollowStatus = async () => {
        if (!actor || !user || user.id === userId) {
            setCheckingFollow(false);
            return;
        }

        try {
            const following = await actor.get_user_following(user.id);
            setIsFollowing(following.includes(userId));
        } catch (error) {
            console.error('Error checking follow status:', error);
        } finally {
            setCheckingFollow(false);
        }
    };

    const handleFollow = async () => {
        if (!actor || user.id === userId) return;

        try {
            setIsLoading(true);
            const result = isFollowing
                ? await actor.unfollow_user(userId)
                : await actor.follow_user(userId);

            if ('Ok' in result) {
                setIsFollowing(!isFollowing);
                toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully');
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
            toast.error('Failed to update follow status');
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingFollow) {
        return <LoadingSpinner size="sm" />;
    }

    if (user?.id === userId) {
        return null;
    }

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 ${isFollowing
                ? 'bg-gray-700 hover:bg-red-600 text-white border border-gray-600 hover:border-red-600'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
        >
            {isLoading ? (
                <LoadingSpinner size="sm" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="w-4 h-4" />
                    <span>Unfollow</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                </>
            )}
        </button>
    );
};

export default FollowButton;