import React, { useState, useRef } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Loader2, Save } from 'lucide-react';

const EditProfileModal = ({ user, onClose, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Profile picture must be under 10MB.');
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());

      if (avatarFile) {
        formData.append('profilePicture', avatarFile);
      }

      const res = await userService.updateProfile(formData);
      if (res.data.success) {
        updateUser(res.data.user);
        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Avatar upload & preview */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-2 border-blue-200">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">Change</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Upload New Photo
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Bio
              </label>
              <span className="text-[10px] text-slate-400">
                {bio.length}/200
              </span>
            </div>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Tell others a little about yourself..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
