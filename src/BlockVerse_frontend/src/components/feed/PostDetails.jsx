import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

const PostDetails = () => {
    const { postId } = useParams();
    const { actor } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPostDetails();
    }, [postId]);

    const loadPostDetails = async () => {
        try {
            setLoading(true);

            const [postResult, commentsResult] = await Promise.all([
                actor.get_post(postId),
                actor.get_post_comments(postId)
            ]);

            if (postResult.length > 0) {
                setPost(postResult[0]);
            }

            setComments(commentsResult);
        } catch (error) {
            console.error('Error loading post details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const result = await actor.create_comment(postId, newComment.trim());

            if (result.Ok) {
                setComments(prev => [...prev, result.Ok]);
                setNewComment('');

                // Update post comments count
                setPost(prev => ({
                    ...prev,
                    comments_count: prev.comments_count + 1
                }));
            }
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!post) {
        return (
            <div className="post-not-found">
                <h2>Post not found</h2>
                <Link to="/" className="back-link">
                    <FiArrowLeft /> Back to feed
                </Link>
            </div>
        );
    }

    return (
        <div className="post-details">
            <div className="post-details-header">
                <Link to="/" className="back-btn">
                    <FiArrowLeft />
                </Link>
                <h2>Post</h2>
            </div>

            <PostCard post={post} />

            <div className="comments-section">
                <h3>Comments ({comments.length})</h3>

                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="comment-input"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="submit-comment-btn"
                    >
                        {submitting ? <LoadingSpinner size="small" /> : <FiSend />}
                    </button>
                </form>

                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-card">
                            <Link to={`/profile/${comment.author}`} className="comment-author">
                                <img
                                    src={`/api/avatar/${comment.author}`}
                                    alt="Commenter avatar"
                                    className="comment-avatar"
                                />
                                <span className="comment-username">
                                    @{comment.author.toString().slice(0, 8)}...
                                </span>
                            </Link>

                            <p className="comment-content">{comment.content}</p>

                            <div className="comment-actions">
                                <span className="comment-time">
                                    {formatDistanceToNow(new Date(Number(comment.created_at) / 1000000))}
                                </span>
                                <button className="comment-like-btn">
                                    <FiHeart />
                                    <span>{comment.likes_count}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {comments.length === 0 && (
                    <div className="no-comments">
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetails;