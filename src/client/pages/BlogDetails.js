import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; // Import your Axios instance
import { motion } from "framer-motion";
import { FaHeart, FaComment, FaVideo, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Helper function to format media URLs
const formatMediaUrl = (url) => {
  if (!url) return "";

  // If the URL already starts with http or https, return it as is
  if (url.startsWith("http")) return url;

  // Remove leading slash if present
  const cleanPath = url.replace(/^\/+/, "");

  // Use environment variable
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5003";
  return `${apiBaseUrl}/${cleanPath}`;
};


const MediaGallery = ({ media }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadErrors, setLoadErrors] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [slideDirection, setSlideDirection] = useState(null); // For transition direction
  
  console.log("MediaGallery received media:", media);
  
  
  // Format media URLs
  const formattedMedia = media ? media.map(item => ({
    ...item,
    url: formatMediaUrl(item.url)
  })) : [];
  
  const handleImageError = (url, index) => {
    console.error(`Image failed to load: ${url} (index: ${index})`);
    setLoadErrors(prev => ({...prev, [index]: true}));
  };

  const goToPrevious = () => {
    if (formattedMedia.length <= 1) return;
    setSlideDirection('right');
    setActiveIndex(prevIndex => 
      prevIndex === 0 ? formattedMedia.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    if (formattedMedia.length <= 1) return;
    setSlideDirection('left');
    setActiveIndex(prevIndex => 
      prevIndex === formattedMedia.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Handle touch events for swiping
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart && e.targetTouches[0].clientX) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (distance > 30) {
        setSwipeDirection('left');
      } else if (distance < -30) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    setSwipeDirection(null);
  };
  
  // Reset animation after each slide
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlideDirection(null);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [activeIndex]);
  
  // Add keyboard navigation - moved to top level
  useEffect(() => {
    // Only add keyboard listeners if we have multiple media items
    if (formattedMedia.length > 1) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [formattedMedia.length, goToPrevious, goToNext]); // Add all dependencies
  
  // If there's no media or only one item, just render it directly
  if (!formattedMedia || formattedMedia.length === 0) {
    return <div className="text-center text-gray-500">No media available</div>;
  }
  
  if (formattedMedia.length === 1) {
    const item = formattedMedia[0];
    console.log("Rendering single media item:", item);
    return (
      <div className="overflow-hidden relative">
        {item.type === 'image' ? (
          loadErrors[0] ? (
            <div className="bg-gray-200 w-full h-64 flex items-center justify-center text-gray-500">
              <p>Image could not be loaded</p>
            </div>
          ) : (
            <>
              <img 
                src={item.url} 
                alt={item.caption || "Blog image"} 
                className="w-full aspect-square object-cover max-w-2xl mx-auto rounded-xl shadow-md"
                onError={(e) => {
                  console.error("Image failed to load:", item.url);
                  handleImageError(item.url, 0);
                }}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  display: 'block',
                  margin: '0 auto 1rem'
                }}
              />
            </>
          )
        ) : (
          <video 
            src={item.url} 
            controls 
            className="w-full h-auto" 
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5WaWRlbzwvdGV4dD48L3N2Zz4="
            onError={(e) => {
              console.error("Video failed to load:", item.url);
              setLoadErrors(prev => ({...prev, [0]: true}));
            }}
          />
        )}
        {item.caption && (
          <p className="text-sm text-gray-500 mt-2 italic">{item.caption}</p>
        )}
      </div>
    );
  }
  
  // For multiple media items, create a gallery with thumbnails
  console.log("Rendering media gallery with", formattedMedia.length, "items");
  return (
    <div className="space-y-4">
      {/* Main display */}
      <div 
        className="overflow-hidden bg-dark-300 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {formattedMedia[activeIndex].type === 'image' ? (
          loadErrors[activeIndex] ? (
            <div className="bg-gray-200 w-full h-64 flex items-center justify-center text-gray-500">
              <p>Image could not be loaded</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 1, x: 0 }}
                animate={{ 
                  opacity: 1,
                  x: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
                key={`image-${activeIndex}`}
              >
                <motion.img 
                  src={formattedMedia[activeIndex].url} 
                  alt={formattedMedia[activeIndex].caption || `Media ${activeIndex + 1}`} 
                  className="w-full aspect-square object-cover max-w-2xl mx-auto rounded-xl shadow-md cursor-pointer"
                  onClick={goToNext}
                  onError={(e) => {
                    console.error("Image failed to load:", formattedMedia[activeIndex].url);
                    handleImageError(formattedMedia[activeIndex].url, activeIndex);
                  }}
                  draggable="false"
                  initial={{ 
                    opacity: 0,
                    x: slideDirection === 'left' ? 100 : slideDirection === 'right' ? -100 : 0 
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    display: 'block',
                    margin: '0 auto 1rem'
                  }}
                />
              </motion.div>

              {/* Swipe indicator - left */}
              {swipeDirection === 'right' && (
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-4 rounded-full">
                  <FaChevronLeft size={24} />
                </div>
              )}

              {/* Swipe indicator - right */}
              {swipeDirection === 'left' && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-4 rounded-full">
                  <FaChevronRight size={24} />
                </div>
              )}
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {activeIndex + 1} / {formattedMedia.length}
              </div>
              
              {/* Previous button */}
              <button 
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none transition-all"
                aria-label="Previous image"
              >
                <FaChevronLeft size={20} />
              </button>
              
              {/* Next button */}
              <button 
                onClick={goToNext}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none transition-all"
                aria-label="Next image"
              >
                <FaChevronRight size={20} />
              </button>
            </>
          )
        ) : (
          <video 
            src={formattedMedia[activeIndex].url} 
            controls 
            className="w-full h-auto" 
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5WaWRlbzwvdGV4dD48L3N2Zz4="
            onError={(e) => {
              console.error("Video failed to load:", formattedMedia[activeIndex].url);
              setLoadErrors(prev => ({...prev, [activeIndex]: true}));
            }}
          />
        )}
        {formattedMedia[activeIndex].caption && (
          <p className="text-sm text-pastel-pink-200 p-2 italic">{formattedMedia[activeIndex].caption}</p>
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {formattedMedia.map((item, index) => (
          <div 
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`cursor-pointer rounded-md overflow-hidden flex-shrink-0 border-2 ${
              index === activeIndex ? 'border-pastel-pink-500' : 'border-transparent'
            }`}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-16 object-cover"
                onError={(e) => {
                  console.error("Thumbnail failed to load:", item.url);
                  // Replace with a placeholder
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2FhYSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-dark-400 flex items-center justify-center">
                <FaVideo className="text-pastel-pink-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState({});
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Get user details from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if the user has already liked this blog
        if (blog.likes && blog.likes.includes(parsedUser.id)) {
          setIsLiked(true);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [blog.likes]);

  // Fetch the blog data from the backend
  const fetchBlogDetails = async () => {
    try {
      const response = await axiosInstance.get(`/blogs/${id}`);
      console.log("Blog data response:", response.data);
      
      // Process the blog data to ensure media URLs are correct
      const blogData = response.data;
      
      // If the blog has media items, make sure they have full URLs
      if (blogData.media && blogData.media.length > 0) {
        console.log("Blog has media array with", blogData.media.length, "items");
        blogData.media = blogData.media.map((item, index) => {
          const fullUrl = formatMediaUrl(item.url);
          console.log(`Media item ${index}: ${item.type}, Original URL: ${item.url}, Full URL: ${fullUrl}`);
          return {
            ...item,
            url: fullUrl
          };
        });
        console.log("Processed media:", blogData.media);
      } 
      // If the blog has a single image (legacy format), ensure it has a full URL
      else if (blogData.image) {
        console.log("Blog has single image:", blogData.image);
        const fullImageUrl = formatMediaUrl(blogData.image);
        blogData.image = fullImageUrl;
        console.log("Processed image URL:", fullImageUrl);
        
        // Create a media array with the single image for compatibility
        blogData.media = [{
          type: 'image',
          url: fullImageUrl,
          caption: blogData.title
        }];
        console.log("Created media from image:", blogData.media);
      } else {
        console.log("Blog has no media or images");
      }
      
      setBlog(blogData);
      setLikes(blogData.likes.length); // Set initial likes count
      setComments(blogData.comments || []); // Ensure the comments are included in the response
      
      // Check if the current user has liked this blog
      if (user && blogData.likes.includes(user.id)) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Failed to load blog details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Call fetchBlogDetails when the component mounts
  useEffect(() => {
    fetchBlogDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle like button click
  const handleLike = async () => {
    console.log("Like button clicked");
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found - user must be logged in to like posts");
      alert("Please log in to like this post");
      return;
    }

    try {
      console.log(`Sending like request to /blogs/${id}/like with token`);
      const response = await axiosInstance.post(
        `/blogs/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Like response:", response.data);
      setIsLiked(true);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error liking the blog:", error);
      // Check for specific error responses
      if (error.response && error.response.status === 401) {
        alert("Please log in to like this post");
      } else if (error.response && error.response.status === 400) {
        // Already liked
        setIsLiked(true);
      } else {
        alert("Error liking the post. Please try again.");
      }
    }
  };

  // Handle unlike button click
  const handleUnlike = async () => {
    console.log("Unlike button clicked");
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found - user must be logged in to unlike posts");
      alert("Please log in to unlike this post");
      return;
    }
    
    try {
      console.log(`Sending unlike request to /blogs/${id}/unlike with token`);
      const response = await axiosInstance.delete(
        `/blogs/${id}/unlike`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Unlike response:", response.data);
      setIsLiked(false);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error unliking the blog:", error);
      // Check for specific error responses
      if (error.response && error.response.status === 401) {
        alert("Please log in to unlike this post");
      } else if (error.response && error.response.status === 400) {
        // Not liked yet
        setIsLiked(false);
      } else {
        alert("Error unliking the post. Please try again.");
      }
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to log in to comment.");
      return;
    }

    // Make sure the comment data matches the expected format on the server
    const newCommentData = { 
      text: commentText,  // Server expects 'text' which it maps to 'comment' in the schema
      author: user.username 
    };

    try {
      setIsSubmitting(true);
      console.log("Submitting comment:", {
        blogId: id,
        comment: newCommentData,
        token: token ? "Token exists" : "No token"
      });
      
      const response = await axiosInstance.post(
        `/blogs/${id}/comment`,
        { comment: newCommentData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Comment submission response:", response.data);
      
      // Update comments with the response data
      setComments(response.data.comments || []); 
      setCommentText(""); // Clear input field
      setIsSubmitting(false);
      
      // Update the blog object with the new comments
      setBlog({
        ...blog,
        comments: response.data.comments || []
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      console.error("Error details:", error.response?.data);
      setIsSubmitting(false);
      alert(error.response?.data?.message || "Failed to post comment. Please try again.");
    }
  };

  // Handle comment unlike/delete
  const handleUnlikeComment = async (commentId) => {
    if (!user) {
      alert("Please log in to unlike a comment.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to log in to unlike a comment.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/blogs/${id}/comment/${commentId}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update comments with the response data
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error unliking comment:", error);
      alert(error.response?.data?.message || "Error unliking comment");
    }
  };

  // Sort the comments from newest to oldest
  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // Limit the comments to 4 for initial view
  const displayedComments = showAllComments
    ? sortedComments
    : sortedComments.slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading delicious things...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="text-center">
          <p className="text-pastel-pink-400 text-xl mb-4">Oops!</p>
          <p className="text-white mb-6">{error}</p>
          <Link to="/blogs" className="btn btn-primary">
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="text-center">
          <p className="text-pastel-pink-400 text-xl mb-4">Recipe Not Found</p>
          <p className="text-white mb-6">The restaurant you're looking for doesn't exist or has been removed.</p>
          <Link to="/blogs" className="btn btn-primary">
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  const isValidDate = (date) => {
    if (!date) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-pastel-pink-200">Loading ...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-pastel-pink-400 text-center p-8 bg-dark-200 rounded-lg shadow-lg">
          <p className="text-xl mb-4">Oops! Something went wrong</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link to="/blogs" className="bg-pastel-pink-500 text-white px-4 py-2 rounded hover:bg-pastel-pink-600">
            Back to Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content - Takes up 2/3 of the space on medium screens and up */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-pastel-pink-500">
              {blog.title}
            </h1>
            
            <div className="flex items-center text-gray-500 space-x-4">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            
            {/* Media Gallery */}
            <div className="flex justify-center">
              {blog.media && blog.media.length > 0 ? (
                <MediaGallery media={blog.media} />
              ) : blog.image ? (
                // Fallback for legacy blogs with only image field
                <div className="overflow-hidden relative">
                  <motion.div
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ 
                      opacity: 1,
                      x: 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative"
                  >
                    <img 
                      src={blog.image} 
            alt={blog.title}
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        display: 'block',
                        margin: '0 auto 1rem'
                      }}
                    />
                  </motion.div>
                  
                  {/* Add navigation buttons for visual consistency even if there's only one image */}
                  <button 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none cursor-default opacity-50"
                    aria-label="Previous image"
                    disabled
                  >
                    <FaChevronLeft size={20} />
                  </button>
                  
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none cursor-default opacity-50"
                    aria-label="Next image"
                    disabled
                  >
                    <FaChevronRight size={20} />
                  </button>
                </div>
              ) : null}
            </div>
            
            <div className="prose prose-lg max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={isLiked ? handleUnlike : handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isLiked ? 'bg-pastel-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaHeart />
                <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <button 
                onClick={() => setShowCommentForm(!showCommentForm)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  showCommentForm ? 'bg-pastel-pink-500 text-white' : 'bg-dark-200 text-pastel-pink-400 hover:bg-dark-300'
                }`}
              >
                <FaComment />
                <span>Comment</span>
          </button>
        </div>

          {/* Comment Form */}
            {showCommentForm && (
              <div className="bg-dark-200 p-4 rounded-lg border border-pastel-pink-300 border-opacity-20">
                <h3 className="text-lg font-semibold mb-2 text-pastel-pink-400">Leave a Comment</h3>
            <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded mb-2 bg-dark-100 text-gray-200"
              rows="3"
                  placeholder="Write your comment here..."
                ></textarea>
            <button
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting}
                  className="bg-pastel-pink-500 text-white px-4 py-2 rounded hover:bg-pastel-pink-600"
            >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
              </div>
            )}
          </div>
          
          {/* Comments Section - Takes up 1/3 of the space on medium screens and up */}
          <div className="bg-dark-100 p-6 rounded-lg h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold mb-4 text-pastel-pink-500">
              Comments ({blog.comments?.length || 0})
            </h2>
            
            {blog.comments && blog.comments.length > 0 ? (
              <div className="space-y-4">
                {blog.comments.map((comment, index) => (
                  <div key={index} className="bg-dark-200 p-4 rounded-lg shadow-sm border border-pastel-pink-200 border-opacity-20">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-pastel-pink-400">{comment.author}</div>
                      <div className="text-xs text-gray-400">
                  {isValidDate(comment.createdAt)
                          ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "Unknown Date"}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-300">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default BlogDetails;
