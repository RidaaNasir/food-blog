import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSpinner, FaVideo, FaImage, FaUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';

const ManageReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reelTitle, setReelTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingSectionInfo, setIsEditingSectionInfo] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch landing page data
  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const response = await axiosInstance.get('/landing-page');
        if (response.data && response.data.reels && response.data.reels.items) {
          setReels(response.data.reels.items);
          setSectionTitle(response.data.reels.title || 'Food Reels');
          setSectionDescription(response.data.reels.description || 'Watch our latest food reels and get inspired');
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
        setError('Failed to load reels data');
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPage();
  }, []);

  // Handle video file selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('video/')) {
        alert('Please select a valid video file');
        return;
      }
      setVideoFile(file);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('image/')) {
        alert('Please select a valid image file for the thumbnail');
        return;
      }
      setThumbnailFile(file);
    }
  };

  // Add new reel
  const handleAddReel = async (e) => {
    e.preventDefault();
    
    if (!reelTitle.trim()) {
      alert('Please enter a title for the reel');
      return;
    }
    
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (videoFile.size > maxSize) {
      alert('Video file is too large. Maximum size is 50MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('title', reelTitle.trim());
      formData.append('media', videoFile);
      
      if (thumbnailFile) {
        formData.append('media', thumbnailFile);
      }
      
      console.log('Sending reel data:', { 
        title: reelTitle, 
        videoFile: {
          name: videoFile.name,
          type: videoFile.type,
          size: videoFile.size
        }, 
        thumbnailFile: thumbnailFile ? {
          name: thumbnailFile.name,
          type: thumbnailFile.type,
          size: thumbnailFile.size
        } : null
      });
      
      const response = await axiosInstance.post('/landing-page/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      
      setReels(prevReels => [...prevReels, response.data]);
      setReelTitle('');
      setVideoFile(null);
      setThumbnailFile(null);
      
      // Reset file input fields
      document.getElementById('video-upload').value = '';
      document.getElementById('thumbnail-upload').value = '';
      
      alert('Reel added successfully');
    } catch (error) {
      console.error('Error adding reel:', error);
      
      let errorMessage = 'Failed to add reel';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - please try again with a smaller file or check your connection';
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Delete reel
  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/landing-page/reels/${reelId}`);
      setReels(prevReels => prevReels.filter(reel => reel.id !== reelId));
      alert('Reel deleted successfully');
    } catch (error) {
      console.error('Error deleting reel:', error);
      setError('Failed to delete reel');
      alert('Failed to delete reel');
    }
  };

  // Update section info
  const handleUpdateSectionInfo = async (e) => {
    e.preventDefault();
    
    if (!sectionTitle.trim()) {
      alert('Section title cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.put('/landing-page/reels', {
        title: sectionTitle,
        description: sectionDescription
      });
      
      setReels(response.data.reels.items);
      setIsEditingSectionInfo(false);
      alert('Section information updated successfully');
    } catch (error) {
      console.error('Error updating section info:', error);
      setError('Failed to update section information');
      alert('Failed to update section information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Manage Reels</h1>
          <button
            onClick={() => setIsEditingSectionInfo(!isEditingSectionInfo)}
            className="btn btn-secondary"
          >
            <FaEdit className="mr-2" /> {isEditingSectionInfo ? 'Cancel' : 'Edit Section Info'}
          </button>
        </div>

        {isEditingSectionInfo ? (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-400 p-6 rounded-lg mb-8"
            onSubmit={handleUpdateSectionInfo}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Edit Section Information</h2>
            <div className="mb-4">
              <label className="block text-pastel-pink-200 mb-2">Section Title</label>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="input-field w-full"
                placeholder="Food Reels"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-pastel-pink-200 mb-2">Section Description</label>
              <textarea
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                className="input-field w-full h-24"
                placeholder="Watch our latest food reels and get inspired"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaEdit className="mr-2" />}
                Update Section Info
              </button>
            </div>
          </motion.form>
        ) : (
          <div className="bg-dark-400 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">{sectionTitle}</h2>
            <p className="text-gray-300">{sectionDescription}</p>
          </div>
        )}
      </div>

      {/* Add New Reel Form */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Reel</h2>
        <form onSubmit={handleAddReel}>
          <div className="mb-4">
            <label className="block text-pastel-pink-200 mb-2">Reel Title</label>
            <input
              type="text"
              value={reelTitle}
              onChange={(e) => setReelTitle(e.target.value)}
              className="input-field w-full"
              placeholder="Enter reel title"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-pastel-pink-200 mb-2">Video File</label>
              <div className="flex items-center">
                <label className="flex-1 cursor-pointer bg-dark-500 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center">
                  <FaVideo className="mr-2" />
                  {videoFile ? videoFile.name : 'Select Video File'}
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
              {videoFile && (
                <p className="text-xs text-gray-400 mt-2">
                  Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Thumbnail (Optional)</label>
              <div className="flex items-center">
                <label className="flex-1 cursor-pointer bg-dark-500 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center">
                  <FaImage className="mr-2" />
                  {thumbnailFile ? thumbnailFile.name : 'Select Thumbnail'}
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
              {thumbnailFile && (
                <p className="text-xs text-gray-400 mt-2">
                  Size: {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`btn btn-primary ${uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-pastel-pink-500 hover:bg-pastel-pink-600'}`}
              disabled={uploading}
            >
              {uploading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              {uploading ? 'Uploading...' : 'Add Reel'}
            </button>
          </div>
        </form>
      </div>

      {/* Reels List */}
      <div className="bg-dark-400 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Existing Reels</h2>
        
        {reels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <motion.div
                key={reel.id}
                className="bg-dark-500 rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative aspect-video">
                  {reel.thumbnail ? (
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={reel.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-700/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="text-lg font-semibold text-white truncate">{reel.title}</h3>
                    <p className="text-xs text-gray-300">
                      {new Date(reel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex justify-end">
                  <button
                    onClick={() => handleDeleteReel(reel.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No reels added yet</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ManageReels; 