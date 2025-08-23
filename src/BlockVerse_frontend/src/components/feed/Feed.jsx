import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Feed = () => {
    const { actor, principal } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadFeed();
    }, [actor, principal]);

    const loadFeed = async (pageNum = 0) => {
        if (!actor || !principal) return;

        try {
            setLoading(true);
            const limit = 10;
            const offset = pageNum * limit;

            const feedPosts = await actor.get_feed(principal, limit, offset);

            if (pageNum === 0) {
                setPosts(feedPosts);
            } else {
                setPosts(prev => [...prev, ...feedPosts]);
            }

            setHasMore(feedPosts.length === limit);
        } catch (error) {
            console.error('Error loading feed:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    const handleNewPost = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === updatedPost.id ? updatedPost : post
            )
        );
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <CreatePost onPostCreated={handleNewPost} />

            <div className="mt-6 space-y-6">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onUpdate={handlePostUpdate}
                    />
                ))}

                {posts.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">No posts in your feed yet</p>
                        <p className="text-gray-500">
                            Follow some users or create your first post to get started!
                        </p>
                    </div>
                )}

                {hasMore && posts.length > 0 && (
                    <div className="text-center py-6">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;