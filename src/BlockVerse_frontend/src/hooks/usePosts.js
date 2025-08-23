import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const usePosts = (userId = null) => {
  const { actor, principal } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async () => {
    if (!actor || !principal) return;

    try {
      setLoading(true);
      setError(null);
      
      let postsData;
      if (userId) {
        postsData = await actor.get_user_posts(userId);
      } else {
        postsData = await actor.get_feed(principal, 20, 0);
      }
      
      setPosts(postsData);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [actor, principal, userId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = async (content, mediaUrl = null) => {
    if (!actor) throw new Error('Not authenticated');

    try {
      const result = await actor.create_post(content, mediaUrl ? [mediaUrl] : []);
      if ('Ok' in result) {
        setPosts(prev => [result.Ok, ...prev]);
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      toast.error('Failed to create post');
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!actor) throw new Error('Not authenticated');

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likes?.has?.(principal);
      const result = isLiked 
        ? await actor.unlike_post(postId)
        : await actor.like_post(postId);
      
      if ('Ok' in result) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const updatedPost = { ...p };
            if (isLiked) {
              updatedPost.likes_count -= 1;
              updatedPost.likes?.delete?.(principal);
            } else {
              updatedPost.likes_count += 1;
              updatedPost.likes?.add?.(principal);
            }
            return updatedPost;
          }
          return p;
        }));
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      toast.error('Failed to like post');
      throw error;
    }
  };

  const sharePost = async (postId, comment = null) => {
    if (!actor) throw new Error('Not authenticated');

    try {
      const result = await actor.share_post(postId, comment ? [comment] : []);
      if ('Ok' in result) {
        setPosts(prev => [result.Ok, ...prev]);
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      toast.error('Failed to share post');
      throw error;
    }
  };

  return {
    posts,
    loading,
    error,
    refetch: loadPosts,
    createPost,
    likePost,
    sharePost,
  };
};