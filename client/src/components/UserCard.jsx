import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

const UserCard = ({ user: targetUser, onFollowToggle }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const isOwnCard = currentUser && currentUser._id === targetUser._id;

  const [isFollowing, setIsFollowing] = useState(Boolean(targetUser.isFollowing));
  const [followersCount, setFollowersCount] = useState(targetUser.followersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow users.');
      return;
    }
    if (loading || isOwnCard) return;

    setLoading(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await userService.followUser(targetUser._id);
      } else {
        await userService.unfollowUser(targetUser._id);
      }
      if (onFollowToggle) {
        onFollowToggle(targetUser._id, nextState);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
      // Revert on error
      setIsFollowing(!nextState);
      setFollowersCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Link
            to={`/profile/${targetUser._id || targetUser.username}`}
            className="flex-shrink-0"
          >
            {targetUser.profilePicture ? (
              <img
                src={targetUser.profilePicture}
                alt={targetUser.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center border border-blue-200">
                {targetUser.name ? targetUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${targetUser._id || targetUser.username}`}
              className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate block"
            >
              {targetUser.name}
            </Link>
            <p className="text-xs text-slate-500 truncate">@{targetUser.username}</p>
          </div>
        </div>

        {targetUser.bio ? (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {targetUser.bio}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-4">No bio yet.</p>
        )}
      </div>

      <div>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1 py-2 mb-3 bg-slate-50 rounded-lg text-center text-xs">
          <div>
            <span className="font-bold text-slate-800">{targetUser.postsCount || 0}</span>
            <span className="block text-[10px] text-slate-500">Posts</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">{followersCount}</span>
            <span className="block text-[10px] text-slate-500">Followers</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">
              {targetUser.followingCount || 0}
            </span>
            <span className="block text-[10px] text-slate-500">Following</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${targetUser._id || targetUser.username}`}
            className="flex-1 text-center py-1.5 px-3 border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            View Profile
          </Link>

          {!isOwnCard && isAuthenticated && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                isFollowing
                  ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
