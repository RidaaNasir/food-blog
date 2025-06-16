import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaImage, FaUpload, FaCheck, FaVideo, FaTrash, FaPlus, FaSpinner } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get user info for author field
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setAuthor(user.username || "");
    }
  }, []);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit of 7
    if (mediaFiles.length + files.length > 7) {
      setError(`You can only upload up to 7 media files. You've selected ${mediaFiles.length + files.length}.`);
      return;
    }
    
    // Process each file
    const newMediaFiles = [...mediaFiles];
    
    files.forEach(file => {
      // Check if file is an image or video
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage || isVideo) {
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          newMediaFiles.push({
            file,
            preview: reader.result,
            type: isImage ? 'image' : 'video',
            caption: ''
          });
          setMediaFiles([...newMediaFiles]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCaptionChange = (index, caption) => {
    const updatedMediaFiles = [...mediaFiles];
    updatedMediaFiles[index].caption = caption;
    setMediaFiles(updatedMediaFiles);
  };

  const handleRemoveMedia = (index) => {
    const updatedMediaFiles = [...mediaFiles];
    updatedMediaFiles.splice(index, 1);
    setMediaFiles(updatedMediaFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (!title || !content || !author) {
      setError("Please fill in all required fields");
      return;
    }

    if (mediaFiles.length === 0) {
      setError("Please upload at least one image or video for your blog");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", author);
    
    // Append all media files
    mediaFiles.forEach((mediaItem, index) => {
      formData.append("media", mediaItem.file);
      formData.append("caption", mediaItem.caption);

    });

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(
        "/blogs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Navigate to the blog details page
      navigate(`/blogs/${response.data._id}`);
    } catch (error) {
      console.error(
        "Error creating blog:",
        error.response ? error.response.data : error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to create blog. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-400 rounded-xl p-6 shadow-lg border border-pastel-pink-500/20"
      >
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Create New <span className="text-pastel-pink-400">Blog Post</span>
        </h1>
        <p className="text-pastel-pink-200 mb-6">
          Share your delicious recipe with the world
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              placeholder="Enter an eye-catching title"
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Media ({mediaFiles.length}/7)
            </label>
            
            {/* Media Gallery */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="bg-dark-300 rounded-lg overflow-hidden border border-dark-200">
                    <div className="relative aspect-square">
                      {media.type === 'image' ? (
                        <img 
                          src={media.preview} 
                          alt={`Preview ${index}`} 
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
            )}

            {/* Upload Button */}
            {mediaFiles.length < 7 && (
              <div 
                className="bg-dark-300 border border-dashed border-pastel-pink-400/50 rounded-lg p-4 cursor-pointer"
                onClick={() => fileInputRef.current.click()}
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
                    onChange={handleMediaChange}
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-pastel-pink-200 mb-2 font-medium">
              Blog Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="10"
              className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              placeholder="Share your recipe, cooking tips, or food story..."
            ></textarea>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-pastel-pink-200 mb-2 font-medium">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-pastel-pink-500 text-dark-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-pastel-pink-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FaCheck />
                  <span>Publish Blog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateBlog; 