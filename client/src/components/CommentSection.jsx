import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services/api';
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react';

const CommentSection = ({
  postId,
  postAuthorId,
  initialComments = [],
  onCommentCountChange,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments when opened if initial comments were not loaded or need refresh
  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await commentService.getPostComments(postId);
        if (isMounted && res.data.success) {
          setComments(res.data.comments);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await commentService.addComment(postId, newCommentText.trim());
      if (res.data.success) {
        const addedComment = res.data.comment;
        const updated = [...comments, addedComment];
        setComments(updated);
        setNewCommentText('');
        if (onCommentCountChange) {
          onCommentCountChange(updated.length);
        }
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await commentService.deleteComment(commentId);
      if (res.data.success) {
        const updated = comments.filter((c) => c._id !== commentId);
        setComments(updated);
        if (onCommentCountChange) {
          onCommentCountChange(updated.length);
        }
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pt-3 mt-3 border-t border-gray-100 space-y-3">
      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-4 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
          <span className="text-xs">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-slate-400 text-xs flex flex-col items-center gap-1">
          <MessageSquare className="w-5 h-5 text-slate-300" />
          <span>No comments yet. Be the first to share your thoughts!</span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const commentUser = comment.user || {};
            const isOwner = user && (user._id === commentUser._id || user._id === comment.user);
            const isPostAuthor = user && user._id === postAuthorId;
            const canDelete = isOwner || isPostAuthor;

            return (
              <div
                key={comment._id}
                className="flex items-start gap-2.5 group text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100"
              >
                <Link
                  to={`/profile/${commentUser._id || commentUser.username || ''}`}
                  className="flex-shrink-0"
                >
                  {commentUser.profilePicture ? (
                    <img
                      src={commentUser.profilePicture}
                      alt={commentUser.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-[10px]">
                      {commentUser.name ? commentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/profile/${commentUser._id || commentUser.username || ''}`}
                        className="font-semibold text-slate-800 hover:text-blue-600 truncate"
                      >
                        {commentUser.name || commentUser.username || 'Anonymous'}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        @{commentUser.username || 'user'}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={submitting}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-800 placeholder-gray-400 rounded-lg border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !newCommentText.trim()}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Comment</span>
          </button>
        </form>
      ) : (
        <p className="text-center text-xs text-slate-500 py-2 bg-slate-50 rounded-lg">
          Please{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            log in
          </Link>{' '}
          to leave a comment.
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default CommentSection;
