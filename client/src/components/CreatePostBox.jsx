import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import { Image, Video, Hash, X, Loader2, Send } from 'lucide-react';

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Extract hashtags dynamically for live preview
  const extractedTags = (caption.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.trim());

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Validation
    const maxSize = 60 * 1024 * 1024; // 60MB
    if (file.size > maxSize) {
      setError('File size too large. Please select a file smaller than 60MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !selectedFile) {
      setError('Please add a caption or upload an image/video.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('caption', caption.trim());

      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const response = await postService.createPost(formData);

      // Reset form
      setCaption('');
      handleRemoveMedia();
      setIsOpen(false);

      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      console.error('Create post failed:', err);
      setError(
        err.response?.data?.message || 'Failed to create post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setCaption('');
    handleRemoveMedia();
    setError('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs mb-6">
      {/* Collapsed top bar */}
      <div className="flex items-center gap-3">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center border border-blue-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full text-sm transition-colors cursor-pointer"
        >
          {caption.trim() || `What's on your mind, ${user?.name?.split(' ')[0] || 'friend'}?`}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="hidden sm:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Create Post
        </button>
      </div>

      {/* Expanded form / Modal */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-100">
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <textarea
            rows="3"
            placeholder="Share something with the community... Include #hashtags like #MERN #React"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 text-sm text-slate-800 placeholder-gray-400 bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
            autoFocus
          />

          {/* Extracted Tags Live Preview */}
          {extractedTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Tags detected:
              </span>
              {extractedTags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md border border-blue-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Media Preview Box */}
          {previewUrl && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center max-h-72">
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                title="Remove media"
              >
                <X className="w-4 h-4" />
              </button>

              {mediaType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-72 w-auto object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-72 w-full object-contain"
                />
              )}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  mediaType === 'image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Image className="w-4 h-4 text-emerald-600" />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4 text-purple-600" />
                <span>Upload Video</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (!caption.trim() && !selectedFile)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePostBox;
