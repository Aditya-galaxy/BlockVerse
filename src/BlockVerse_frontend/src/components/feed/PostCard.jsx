import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import TipButton from '../payments/TipButton';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
    const { actor, user } = useAuth();
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        try {
            setIsLiking(true);
            const result = post.likes?.has?.(user?.id)
                ? await actor.unlike_post(post.id)
                : await actor.like_post(post.id);

            if ('Ok' in result) {
                // Update post locally
                const updatedPost = { ...post };
                if (post.likes?.has?.(user?.id)) {
                    updatedPost.likes_count -= 1;
                    updatedPost.likes?.delete?.(user?.id);
                } else {
                    updatedPost.likes_count += 1;
                    updatedPost.likes?.add?.(user?.id);
                }
                onUpdate(updatedPost);
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Failed to like post');
        } finally {
            setIsLiking(false);
        }
    };

    const handleShare = async () => {
        try {
            const result = await actor.share_post(post.id, []);
            if ('Ok' in result) {
                toast.success('Post shared successfully!');
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            toast.error('Failed to share post');
        }
    };

    const formatTime = (timestamp) => {
        return formatDistanceToNow(new Date(Number(timestamp) / 1000000), { addSuffix: true });
    };

    const isLiked = post.likes?.has?.(user?.id) || false;

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex space-x-4">
                <Link to={`/profile/${post.author}`}>
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                        alt="Author"
                        className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <Link
                            to={`/profile/${post.author}`}
                            className="font-semibold text-white hover:text-purple-400 transition-colors"
                        >
                            @{post.author.toString().slice(-8)}
                        </Link>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                            {formatTime(post.created_at)}
                        </span>
                        <div className="ml-auto">
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {post.is_shared && post.original_post_id && (
                        <div className="mb-3 text-gray-400 text-sm">
                            <Repeat className="w-4 h-4 inline mr-1" />
                            Shared a post
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>

                        {post.media_url && (
                            <div className="mt-3">
                                <img
                                    src={post.media_url}
                                    alt="Post media"
                                    className="rounded-lg max-w-full h-auto border border-gray-600"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-gray-400">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`flex items-center space-x-2 hover:text-red-400 transition-colors ${isLiked ? 'text-red-500' : ''
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likes_count}</span>
                            </button>

                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments_count}</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 hover:text-green-400 transition-colors"
                            >
                                <Repeat className="w-5 h-5" />
                                <span>{post.shares_count}</span>
                            </button>

                            <button className="flex items-center space-x-2 hover:text-purple-400 transition-colors">
                                <Share className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <TipButton userId={post.author} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;