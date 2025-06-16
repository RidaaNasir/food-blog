import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaComment, FaCalendarAlt, FaSearch, FaFilter } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance"; // Import your Axios instance

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  

  // Fetch blogs with optional filters
  const fetchBlogs = async (filters = {}) => {
    setLoading(true);
    try {
      const params = { ...filters };
      
      console.log("Fetching blogs with params:", params);
      
      const response = await axiosInstance.get("/blogs", { params });
      console.log("Blogs data received:", response.data);
      
      // Log the first blog's image URL if available
      if (response.data.length > 0) {
        console.log("First blog image URL:", response.data[0].image);
      }
      
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    fetchBlogs(filters);
  };
  
  // Handle date filter changes
  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };
  
  // Apply date filters
  const applyDateFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    fetchBlogs(filters);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    fetchBlogs({});
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Explore Our <span className="text-pastel-pink-400">Food Blog</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover a world of culinary delights with our collection of restaurant reviews and recipes
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Search
            </button>
            <button 
              type="button" 
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </form>

          {/* Filters */}
          <motion.div 
            className="bg-dark-400 rounded-lg p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showFilters ? "auto" : 0,
              opacity: showFilters ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-pastel-pink-200 mb-2 text-sm">From Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-pastel-pink-200 mb-2 text-sm">To Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button 
                onClick={applyDateFilters}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
              <button 
                onClick={resetFilters}
                className="btn btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {blogs.map((blog) => (
              <motion.div 
                key={blog._id} 
                className="card group cursor-pointer"
                variants={itemVariants}
                onClick={() => navigate(`/blogs/${blog._id}`)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {blog.image ? (
                    <img
                      src={blog.image.startsWith('http') ? blog.image : `http://localhost:5003/${blog.image.replace(/^\/+/, '')}`}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        console.error("Failed to load image:", blog.image);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; // Inline fallback image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-300 flex items-center justify-center">
                      <span className="text-pastel-pink-300 opacity-50">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-700/90 to-transparent"></div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-display font-semibold text-white mb-2 group-hover:text-pastel-pink-300 transition-colors duration-300 truncate">
                    {blog.title}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4 h-10 overflow-hidden">
                    {blog.content.substring(0, 120)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-pastel-pink-200">
                      By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center text-pastel-pink-300 text-sm">
                        <FaHeart className="mr-1" /> {blog.likes.length}
                      </span>
                      <span className="flex items-center text-pastel-pink-300 text-sm">
                        <FaComment className="mr-1" /> {blog.comments.length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-pastel-pink-200 mb-4">No blogs found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
