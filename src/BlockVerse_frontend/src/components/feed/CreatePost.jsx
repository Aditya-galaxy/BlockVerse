import React, { useState } from 'react';
import { Image, Video, Smile, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
    const { actor, user } = useAuth();
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showMediaInput, setShowMediaInput] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && !mediaUrl.trim()) {
            toast.error('Post cannot be empty');
            return;
        }

        try {
            setIsPosting(true);
            const result = await actor.create_post(
                content.trim(),
                mediaUrl.trim() ? [mediaUrl.trim()] : []
            );

            if ('Ok' in result) {
                setContent('');
                setMediaUrl('');
                setShowMediaInput(false);
                onPostCreated(result.Ok);
                toast.success('Post created successfully!');
            } else {
                toast.error(result.Err);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex space-x-4">
                <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    alt={user?.username}
                    className="w-12 h-12 rounded-full"
                />

                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening in the BlockVerse?"
                            className="w-full bg-transparent text-white placeholder-gray-400 text-lg resize-none border-none focus:outline-none"
                            rows={3}
                            maxLength={280}
                        />

                        {showMediaInput && (
                            <div className="mt-4">
                                <input
                                    type="url"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    placeholder="Enter image or video URL"
                                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMediaInput(!showMediaInput)}
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <Image className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <Video className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`text-sm ${content.length > 250 ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                    {280 - content.length}
                                </span>

                                <button
                                    type="submit"
                                    disabled={isPosting || (!content.trim() && !mediaUrl.trim())}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center space-x-2"
                                >
                                    {isPosting ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Post</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;