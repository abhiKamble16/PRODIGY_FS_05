import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import CommentSection from './CommentSection';
import {
  Heart,
  MessageCircle,
  Trash2,
  Share2,
  Clock,
  MoreVertical,
  Check,
} from 'lucide-react';

const PostCard = ({ post, onDelete, onTagClick }) => {
  const { user, isAuthenticated } = useAuth();
  const author = post.author || {};

  // Check if current user liked the post
  const currentUserId = user?._id;
  const initialLiked = Boolean(
    currentUserId &&
      post.likes &&
      post.likes.some((id) => (id._id || id).toString() === currentUserId.toString())
  );

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(
    post.likeCount !== undefined ? post.likeCount : post.likes?.length || 0
  );
  const [commentCount, setCommentCount] = useState(
    post.commentCount !== undefined ? post.commentCount : post.comments?.length || 0
  );
  const [showComments, setShowComments] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAuthor = Boolean(
    currentUserId && author._id && author._id.toString() === currentUserId.toString()
  );

  // Format relative timestamp
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like posts.');
      return;
    }
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    // Optimistic UI update
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextLiked) {
        await postService.likePost(post._id);
      } else {
        await postService.unlikePost(post._id);
      }
    } catch (err) {
      console.error('Like action failed:', err);
      // Revert optimistic update on failure
      setIsLiked(!nextLiked);
      setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#post-${post._id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article
      id={`post-${post._id}`}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs mb-4 transition-all hover:border-gray-300"
    >
      {/* Header: Author info & options */}
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/profile/${author._id || author.username || ''}`}
          className="flex items-center gap-3 group"
        >
          {author.profilePicture ? (
            <img
              src={author.profilePicture}
              alt={author.name || 'User'}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center border border-blue-200">
              {author.name ? author.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {author.name || 'Anonymous User'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>@{author.username || 'user'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </Link>

        {/* Post Options (Delete for author) */}
        <div className="flex items-center gap-1">
          {isAuthor && (
            <button
              onClick={handleDeletePost}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Caption */}
      {post.caption && (
        <p className="text-sm text-slate-800 leading-relaxed mb-3 whitespace-pre-wrap">
          {post.caption}
        </p>
      )}

      {/* Media Display (Image or Video) */}
      {post.mediaUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-slate-950 flex items-center justify-center max-h-[500px]">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-[500px] object-contain rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post media"
              loading="lazy"
              className="w-full max-h-[500px] object-contain rounded-lg bg-slate-900"
            />
          )}
        </div>
      )}

      {/* Hashtags display */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/60 px-2 py-0.5 rounded cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart
              className={`w-3.5 h-3.5 ${
                likeCount > 0 ? 'text-red-500 fill-red-500' : 'text-slate-400'
              }`}
            />
            <span>
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          title="Share post link"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons: Like & Comment */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={handleLikeToggle}
          disabled={isLikeLoading}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            isLiked
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiked ? 'fill-red-600 text-red-600 scale-110' : 'text-slate-500'
            }`}
          />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            showComments
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comments ({commentCount})</span>
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          postAuthorId={author._id}
          initialComments={post.comments || []}
          onCommentCountChange={(count) => setCommentCount(count)}
        />
      )}
    </article>
  );
};

export default PostCard;
