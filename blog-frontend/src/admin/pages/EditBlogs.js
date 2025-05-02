import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaImage, FaUpload, FaCheck, FaSpinner, FaArrowLeft, FaVideo, FaTrash } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const EditBlogs = () => {
  const { id } = useParams(); // Get blog ID from URL
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Fetch the blog details
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await axiosInstance.get(`/blogs/${id}`);
        console.log("Fetched Blog Details:", response.data);

        setBlogData({
          title: response.data.title,
          content: response.data.content,
          author: response.data.author,
        });

        // Process media files
        if (response.data.media && response.data.media.length > 0) {
          // Convert server media to our format
          const processedMedia = response.data.media.map(media => ({
            id: media._id,
            type: media.type,
            url: media.url,
            caption: media.caption || '',
            isExisting: true
          }));
          setMediaFiles(processedMedia);
        } 
        // Fallback for legacy blogs with only image field
        else if (response.data.image) {
          setMediaFiles([{
            id: 'legacy-image',
            type: 'image',
            url: response.data.image,
            caption: '',
            isExisting: true
          }]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Failed to fetch blog details.");
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNewMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit of 7
    if (mediaFiles.length + newMediaFiles.length + files.length > 7) {
      setError(`You can only have up to 7 media files. You've selected ${mediaFiles.length + newMediaFiles.length + files.length}.`);
      return;
    }
    
    // Process each file
    const updatedNewMediaFiles = [...newMediaFiles];
    
    files.forEach(file => {
      // Check if file is an image or video
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage || isVideo) {
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          updatedNewMediaFiles.push({
            file,
            preview: reader.result,
            type: isImage ? 'image' : 'video',
            caption: ''
          });
          setNewMediaFiles([...updatedNewMediaFiles]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCaptionChange = (index, caption, isNew = false) => {
    if (isNew) {
      const updated = [...newMediaFiles];
      updated[index].caption = caption;
      setNewMediaFiles(updated);
    } else {
      const updated = [...mediaFiles];
      updated[index].caption = caption;
      setMediaFiles(updated);
    }
  };

  const handleRemoveMedia = (index, isNew = false) => {
    if (isNew) {
      const updated = [...newMediaFiles];
      updated.splice(index, 1);
      setNewMediaFiles(updated);
    } else {
      const mediaToRemove = mediaFiles[index];
      if (mediaToRemove.isExisting && mediaToRemove.id) {
        setMediaToDelete([...mediaToDelete, mediaToRemove.id]);
      }
      
      const updated = [...mediaFiles];
      updated.splice(index, 1);
      setMediaFiles(updated);
    }
  };

  // Trigger file input click
  const handleMediaClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("content", blogData.content);
    
    // Add new media files
    newMediaFiles.forEach(mediaItem => {
      formData.append("media", mediaItem.file);
      formData.append(`caption_${mediaItem.file.name}`, mediaItem.caption);
    });
    
    // Add media IDs to delete
    if (mediaToDelete.length > 0) {
      mediaToDelete.forEach(id => {
        formData.append("deleteMedia[]", id);
      });
    }

    try {
      await axiosInstance.put(`/blogs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success message
      setSuccess("Blog updated successfully!");
      setSaving(false);
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/admin/manage-blogs");
      }, 1500);
    } catch (error) {
      console.error("Error updating blog:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to update the blog. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-3xl text-pastel-pink-400 mb-2" />
          <div className="text-pastel-pink-300">Loading blog details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-400 rounded-xl p-6 shadow-lg border border-pastel-pink-500/20"
      >
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/admin/manage-blogs")}
            className="mr-4 text-pastel-pink-300 hover:text-pastel-pink-400 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-3xl font-display font-bold text-white">
            Edit <span className="text-pastel-pink-400">Blog Post</span>
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blog Title */}
          <div>
            <label htmlFor="title" className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={blogData.title}
              onChange={handleInputChange}
              className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              required
            />
          </div>

          {/* Blog Media */}
          <div>
            <label className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Media ({mediaFiles.length + newMediaFiles.length}/7)
            </label>
            
            {/* Existing Media Gallery */}
            {mediaFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="text-pastel-pink-300 text-sm mb-2">Current Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="bg-dark-300 rounded-lg overflow-hidden border border-dark-200">
                      <div className="relative aspect-square">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Media ${index}`} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={media.url} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            controls
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={media.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          className="w-full bg-dark-400 border border-dark-200 rounded p-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Media Gallery */}
            {newMediaFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="text-pastel-pink-300 text-sm mb-2">New Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {newMediaFiles.map((media, index) => (
                    <div key={index} className="bg-dark-300 rounded-lg overflow-hidden border border-dark-200">
                      <div className="relative aspect-square">
                        {media.type === 'image' ? (
                          <img 
                            src={media.preview} 
                            alt={`New Media ${index}`} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={media.preview} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            controls
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index, true)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={media.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value, true)}
                          className="w-full bg-dark-400 border border-dark-200 rounded p-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {mediaFiles.length + newMediaFiles.length < 7 && (
              <div 
                className="bg-dark-300 border border-dashed border-pastel-pink-400/50 rounded-lg p-4 cursor-pointer"
                onClick={handleMediaClick}
              >
                <div className="flex flex-col items-center justify-center h-32">
                  <div className="flex space-x-4 mb-3">
                    <FaImage className="text-pastel-pink-400 text-3xl" />
                    <FaVideo className="text-pastel-pink-400 text-3xl" />
                  </div>
                  <span className="text-pastel-pink-200 mb-2">
                    Click to upload images or videos
                  </span>
                  <span className="text-pastel-pink-300/50 text-sm">
                    JPG, PNG, GIF or MP4 (Max 50MB)
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    onChange={handleNewMediaChange}
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div>
            <label htmlFor="content" className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Content
            </label>
            <textarea
              id="content"
              name="content"
              value={blogData.content}
              onChange={handleInputChange}
              className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              rows="12"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`bg-pastel-pink-500 text-dark-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                saving
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-pastel-pink-600 hover:shadow-lg"
              }`}
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaCheck />
                  <span>Update Blog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditBlogs;
