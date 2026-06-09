import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

export default function ProfilePhotoModal({
  currentImage,
  onClose,
  onUpload,
  onRemove,
  uploading = false,
  userName = 'User'
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files (JPG, PNG, GIF, etc.)');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }
    await onUpload(selectedFile);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Profile Photo</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
            disabled={uploading}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current or Preview Image */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-6xl border-2 border-teal-400 shadow-lg overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : currentImage ? (
                <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
              ) : (
                '📷'
              )}
            </div>
            <p className="text-gray-400 text-sm mt-3">{userName}</p>
          </div>

          {/* File Selection */}
          {!selectedFile ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 bg-teal-500/20 border-2 border-dashed border-teal-500/50 text-teal-300 rounded-lg hover:bg-teal-500/30 transition font-medium disabled:opacity-50"
              >
                📁 Choose Image
              </button>
              <p className="text-gray-400 text-xs mt-2 text-center">
                JPG, PNG, GIF (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-4">
              <p className="text-cyan-300 text-sm font-medium">📁 Selected File:</p>
              <p className="text-cyan-200 text-sm mt-1 break-all">{selectedFile.name}</p>
              <p className="text-cyan-400 text-xs mt-2">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentImage && (
              <button
                onClick={onRemove}
                disabled={uploading || !!selectedFile}
                className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                🗑️ Remove
              </button>
            )}
            <button
              onClick={handleUploadClick}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition font-medium"
            >
              {uploading ? '⏳ Uploading...' : '✅ Upload'}
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={() => {
              if (!selectedFile) {
                onClose();
              } else {
                handleCancel();
              }
            }}
            disabled={uploading}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg transition font-medium"
          >
            {selectedFile ? 'Clear Selection' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
