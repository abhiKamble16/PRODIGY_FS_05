import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import {
  User,
  Edit3,
  UserPlus,
  UserCheck,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if viewing current user's profile
  const isOwnProfile = Boolean(
    currentUser &&
      profileUser &&
      (currentUser._id === profileUser._id || currentUser.username === profileUser.username)
  );

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // If no ID passed in URL, default to current user
      const targetId = id || currentUser?._id || currentUser?.username;
      if (!targetId) {
        navigate('/login');
        return;
      }

      const res = await userService.getUserById(targetId);
      if (res.data.success) {
        setProfileUser(res.data.user);
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'User profile not found.');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser, navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow this user.');
      return;
    }
    if (followLoading || !profileUser) return;

    setFollowLoading(true);
    const nextState = !profileUser.isFollowing;

    // Optimistic UI update
    setProfileUser((prev) => ({
      ...prev,
      isFollowing: nextState,
      followersCount: nextState
        ? prev.followersCount + 1
        : Math.max(0, prev.followersCount - 1),
    }));

    try {
      if (nextState) {
        await userService.followUser(profileUser._id);
      } else {
        await userService.unfollowUser(profileUser._id);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      // Revert on error
      setProfileUser((prev) => ({
        ...prev,
        isFollowing: !nextState,
        followersCount: nextState
          ? Math.max(0, prev.followersCount - 1)
          : prev.followersCount + 1,
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdated = (updated) => {
    setProfileUser((prev) => ({ ...prev, ...updated }));
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    setProfileUser((prev) => ({
      ...prev,
      postsCount: Math.max(0, (prev.postsCount || 1) - 1),
    }));
  };

  const handleTagClick = (tag) => {
    const clean = tag.replace(/^#/, '');
    navigate(`/?tag=${clean}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span className="text-sm">Loading profile...</span>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">User Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'This profile does not exist.'}</p>
        <button
          onClick={() => navigate('/users')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
        >
          Browse All Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
          {/* Large Avatar */}
          <div className="relative flex-shrink-0">
            {profileUser.profilePicture ? (
              <img
                src={profileUser.profilePicture}
                alt={profileUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-100 text-blue-700 font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md ring-2 ring-blue-500/20">
                {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {profileUser.name}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  @{profileUser.username}
                </p>
              </div>

              {/* Action: Edit Profile or Follow/Unfollow */}
              <div>
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit Profile</span>
                  </button>
                ) : isAuthenticated ? (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                      profileUser.isFollowing
                        ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-gray-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : profileUser.isFollowing ? (
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
                ) : null}
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio ? (
              <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                {profileUser.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mb-4">
                No bio provided yet.
              </p>
            )}

            {/* Email and Join Date */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mb-5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profileUser.email}</span>
              </span>
              {profileUser.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Joined{' '}
                    {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              )}
            </div>

            {/* Stats: Posts, Followers, Following */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100 text-center">
              <div>
                <span className="block text-base sm:text-lg font-bold text-slate-900">
                  {profileUser.postsCount !== undefined ? profileUser.postsCount : posts.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">Posts</span>
              </div>
              <div>
                <span className="block text-base sm:text-lg font-bold text-slate-900">
                  {profileUser.followersCount || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">Followers</span>
              </div>
              <div>
                <span className="block text-base sm:text-lg font-bold text-slate-900">
                  {profileUser.followingCount || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <FileText className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            {isOwnProfile ? 'My Posts' : `${profileUser.name}'s Posts`} ({posts.length})
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
            <p className="text-sm font-medium text-slate-600 mb-1">
              No posts published yet
            </p>
            <p className="text-xs text-slate-400">
              {isOwnProfile
                ? 'Head over to the home feed to create your very first post!'
                : `${profileUser.name} has not shared any posts yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default Profile;
