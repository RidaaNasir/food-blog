import React, { useState, useEffect } from "react";
import { FaSpinner, FaSave, FaImage, FaPlus, FaTrash, FaEdit, FaVideo, FaArrowLeft, FaArrowRight, FaFilm } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const ManageLandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [landingPageData, setLandingPageData] = useState({
    hero: {
      title: "Welcome to Delicious Bites",
      subtitle: "Discover amazing recipes and cooking tips",
      images: [],
      video: "",
      ctaText: "Explore Recipes",
      ctaLink: "/blogs"
    },
    featuredContent: {
      title: "Featured Recipes",
      description: "Our most popular and delicious recipes",
      items: []
    },
    about: {
      title: "About Delicious Bites",
      content: "A food blog dedicated to sharing delicious recipes and cooking tips from around the world.",
      image: ""
    },
    testimonials: []
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [blogs, setBlogs] = useState([]);

  // Fetch landing page data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch landing page data
        const response = await axiosInstance.get("/landing-page");
        if (response.data) {
          // Handle backward compatibility for hero.image to hero.images
          if (response.data.hero && response.data.hero.image && !response.data.hero.images) {
            response.data.hero.images = response.data.hero.image ? [response.data.hero.image] : [];
          }
          setLandingPageData(response.data);
        }
        
        // Fetch blogs for featured content selection
        const blogsResponse = await axiosInstance.get("/blogs");
        if (blogsResponse.data) {
          setBlogs(blogsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
        setError("Failed to load landing page data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle hero section changes
  const handleHeroChange = (field, value) => {
    setLandingPageData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  // Handle about section changes
  const handleAboutChange = (field, value) => {
    setLandingPageData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
  };

  // Handle featured content changes
  const handleFeaturedContentChange = (field, value) => {
    setLandingPageData(prev => ({
      ...prev,
      featuredContent: {
        ...prev.featuredContent,
        [field]: value
      }
    }));
  };

  // Add blog to featured content
  const addFeaturedBlog = (blogId) => {
    const blog = blogs.find(b => b._id === blogId);
    if (!blog) return;
    
    const newFeaturedItem = {
      id: blog._id,
      title: blog.title,
      image: blog.image,
      link: `/blogs/${blog._id}`
    };
    
    setLandingPageData(prev => ({
      ...prev,
      featuredContent: {
        ...prev.featuredContent,
        items: [...prev.featuredContent.items, newFeaturedItem]
      }
    }));
  };

  // Remove blog from featured content
  const removeFeaturedBlog = (itemId) => {
    setLandingPageData(prev => ({
      ...prev,
      featuredContent: {
        ...prev.featuredContent,
        items: prev.featuredContent.items.filter(item => item.id !== itemId)
      }
    }));
  };

  // Add testimonial
  const addTestimonial = () => {
    const newTestimonial = {
      id: `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      role: "",
      content: "",
      rating: 5,
      avatar: ""
    };
    
    setLandingPageData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
  };

  // Update testimonial
  const updateTestimonial = (id, field, value) => {
    setLandingPageData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(testimonial => 
        testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
      )
    }));
  };

  // Remove testimonial
  const removeTestimonial = (id) => {
    setLandingPageData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(testimonial => testimonial.id !== id)
    }));
  };

  // Handle hero image upload
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);

      setSaving(true);
      setError(null);
      const response = await axiosInstance.post("/landing-page/hero/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.files) {
        // Update landing page data with new data from the server
        setLandingPageData(response.data.landingPage);
        setSuccess("Hero image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading hero media:", error);
      setError(error.response?.data?.message || "Failed to upload media. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle hero video upload
  const handleHeroVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);

      setSaving(true);
      setError(null);
      const response = await axiosInstance.post("/landing-page/hero/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.files) {
        // Update landing page data with new data from the server
        setLandingPageData(response.data.landingPage);
        setSuccess("Hero video uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading hero video:", error);
      setError(error.response?.data?.message || "Failed to upload video. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Remove hero image
  const removeHeroImage = (index) => {
    const updatedImages = [...landingPageData.hero.images];
    updatedImages.splice(index, 1);
    handleHeroChange("images", updatedImages);
  };

  // Remove hero video
  const removeHeroVideo = () => {
    handleHeroChange("video", "");
  };

  // Handle about image upload
  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);

      setSaving(true);
      setError(null);
      const response = await axiosInstance.post("/landing-page/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.files && response.data.files.length > 0) {
        handleAboutChange("image", response.data.files[0]);
        setSuccess("About image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading about image:", error);
      setError(error.response?.data?.message || "Failed to upload about image. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle testimonial avatar upload
  const handleTestimonialAvatarUpload = async (testimonialId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);

      setSaving(true);
      setError(null);
      const response = await axiosInstance.post("/landing-page/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.files && response.data.files.length > 0) {
        updateTestimonial(testimonialId, "avatar", response.data.files[0]);
        setSuccess("Testimonial avatar uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading testimonial avatar:", error);
      setError(error.response?.data?.message || "Failed to upload avatar. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Save landing page data
  const saveLandingPage = async () => {
    try {
      setSaving(true);
      await axiosInstance.put("/landing-page", landingPageData);
      setSuccess("Landing page updated successfully!");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error saving landing page:", error);
      setError("Failed to save landing page. Please try again.");
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading landing page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-white mb-8">Manage Landing Page</h1>
      
      {/* Hero Section */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Hero Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-pastel-pink-200 mb-2">Title</label>
              <input
                type="text"
                value={landingPageData.hero.title}
                onChange={(e) => handleHeroChange("title", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter hero title"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Subtitle</label>
              <input
                type="text"
                value={landingPageData.hero.subtitle}
                onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter hero subtitle"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">CTA Text</label>
              <input
                type="text"
                value={landingPageData.hero.ctaText}
                onChange={(e) => handleHeroChange("ctaText", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter call-to-action text"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">CTA Link</label>
              <input
                type="text"
                value={landingPageData.hero.ctaLink}
                onChange={(e) => handleHeroChange("ctaLink", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter call-to-action link"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-pastel-pink-200 mb-2">Hero Images</label>
            <div className="border-2 border-dashed border-pastel-pink-500/30 rounded-lg p-4 text-center">
              {landingPageData.hero.images.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="flex flex-wrap gap-4">
                    {landingPageData.hero.images.map((image, index) => (
                      <div key={index} className="w-24 h-24 relative">
                        <img
                          src={`http://localhost:5003${image}`}
                          alt={`Hero Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeHeroImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-pastel-pink-200 mt-4 mb-2">Add more images (up to 7)</p>
                  {landingPageData.hero.images.length < 7 && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="hero-image-upload"
                        onChange={handleHeroImageUpload}
                      />
                      <label
                        htmlFor="hero-image-upload"
                        className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pastel-pink-600 transition-colors"
                      >
                        Add Image
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <FaImage className="text-pastel-pink-500/50 text-5xl mb-2" />
                  <p className="text-pastel-pink-200 mb-4">Upload hero images</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="hero-image-upload"
                    onChange={handleHeroImageUpload}
                  />
                  <label
                    htmlFor="hero-image-upload"
                    className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pastel-pink-600 transition-colors"
                  >
                    Select Images
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-pastel-pink-200 mb-2">Hero Video</label>
            <div className="border-2 border-dashed border-pastel-pink-500/30 rounded-lg p-4 text-center">
              {landingPageData.hero.video ? (
                <div className="relative">
                  <video
                    src={`http://localhost:5003${landingPageData.hero.video}`}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                  <button
                    onClick={removeHeroVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <FaVideo className="text-pastel-pink-500/50 text-5xl mb-2" />
                  <p className="text-pastel-pink-200 mb-4">Upload hero video</p>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="hero-video-upload"
                    onChange={handleHeroVideoUpload}
                  />
                  <label
                    htmlFor="hero-video-upload"
                    className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pastel-pink-600 transition-colors"
                  >
                    Select Video
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-pastel-pink-200 mb-2">Carousel Settings</p>
            <div className="bg-dark-400 p-4 rounded-lg">
              <p className="text-white">Images will automatically rotate every 5 seconds.</p>
              <p className="text-white mt-2">If a video is uploaded, it will be shown after all images.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Content Section */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Featured Content</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-pastel-pink-200 mb-2">Section Title</label>
            <input
              type="text"
              value={landingPageData.featuredContent.title}
              onChange={(e) => handleFeaturedContentChange("title", e.target.value)}
              className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
              placeholder="Enter featured content title"
            />
          </div>
          
          <div>
            <label className="block text-pastel-pink-200 mb-2">Section Description</label>
            <input
              type="text"
              value={landingPageData.featuredContent.description}
              onChange={(e) => handleFeaturedContentChange("description", e.target.value)}
              className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
              placeholder="Enter featured content description"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium text-pastel-pink-200 mb-2">Featured Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {landingPageData.featuredContent.items.map((item) => (
              <div key={item.id} className="bg-dark-500 rounded-lg overflow-hidden">
                {item.image && (
                  <img
                    src={`http://localhost:5003${item.image}`}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h4 className="text-white font-medium mb-2">{item.title}</h4>
                  <button
                    onClick={() => removeFeaturedBlog(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-dark-500 p-4 rounded-lg">
            <h4 className="text-pastel-pink-200 mb-2">Add Featured Blog</h4>
            <select
              className="w-full bg-dark-400 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white mb-2"
              onChange={(e) => e.target.value && addFeaturedBlog(e.target.value)}
              value=""
            >
              <option value="">Select a blog to feature</option>
              {blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Reels Section */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Reels Section</h2>
          <Link 
            to="/admin/manage-reels" 
            className="flex items-center gap-2 bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaFilm />
            Manage Reels
          </Link>
        </div>
        
        <div className="bg-dark-500 p-4 rounded-lg mb-4">
          <p className="text-gray-300">
            Manage your Instagram-style food reels in the dedicated Reels Management page. 
            You can add new reels, delete existing ones, and update the section information.
          </p>
          
          {landingPageData.reels && landingPageData.reels.items && (
            <div className="mt-4">
              <p className="text-white">
                <span className="font-semibold">Current Reels:</span> {landingPageData.reels.items.length}
              </p>
              <p className="text-white">
                <span className="font-semibold">Section Title:</span> {landingPageData.reels.title || "Food Reels"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* About Section */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">About Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-pastel-pink-200 mb-2">Title</label>
              <input
                type="text"
                value={landingPageData.about.title}
                onChange={(e) => handleAboutChange("title", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter about section title"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Content</label>
              <textarea
                value={landingPageData.about.content}
                onChange={(e) => handleAboutChange("content", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter about section content"
                rows="5"
              ></textarea>
            </div>
          </div>
          
          <div>
            <label className="block text-pastel-pink-200 mb-2">About Image</label>
            <div className="border-2 border-dashed border-pastel-pink-500/30 rounded-lg p-4 text-center">
              {landingPageData.about.image ? (
                <div className="relative">
                  <img
                    src={`http://localhost:5003${landingPageData.about.image}`}
                    alt="About"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleAboutChange("image", "")}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <FaImage className="text-pastel-pink-500/50 text-5xl mb-2" />
                  <p className="text-pastel-pink-200 mb-4">Upload about image</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="about-image-upload"
                    onChange={handleAboutImageUpload}
                  />
                  <label
                    htmlFor="about-image-upload"
                    className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pastel-pink-600 transition-colors"
                  >
                    Select Image
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-dark-400 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Testimonials</h2>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={addTestimonial}
            className="bg-pastel-pink-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 hover:bg-pastel-pink-600 transition-colors"
          >
            <FaPlus size={14} />
            <span>Add Testimonial</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {landingPageData.testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-dark-500 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-pastel-pink-500/20 rounded-full flex items-center justify-center">
                    {testimonial.avatar ? (
                      <img
                        src={`http://localhost:5003${testimonial.avatar}`}
                        alt={testimonial.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaImage className="text-pastel-pink-500/50" />
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(testimonial.id, "name", e.target.value)}
                      className="bg-dark-400 border border-pastel-pink-500/30 rounded px-2 py-1 text-white text-sm mb-1"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={testimonial.role}
                      onChange={(e) => updateTestimonial(testimonial.id, "role", e.target.value)}
                      className="bg-dark-400 border border-pastel-pink-500/30 rounded px-2 py-1 text-white text-sm"
                      placeholder="Role/Title"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
              
              <textarea
                value={testimonial.content}
                onChange={(e) => updateTestimonial(testimonial.id, "content", e.target.value)}
                className="w-full bg-dark-400 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Testimonial content"
                rows="3"
              ></textarea>
              
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`testimonial-avatar-${testimonial.id}`}
                  onChange={(e) => handleTestimonialAvatarUpload(testimonial.id, e)}
                />
                <label
                  htmlFor={`testimonial-avatar-${testimonial.id}`}
                  className="text-pastel-pink-400 text-sm cursor-pointer hover:text-pastel-pink-300 flex items-center"
                >
                  <FaImage className="mr-1" size={14} />
                  {testimonial.avatar ? "Change Avatar" : "Add Avatar"}
                </label>
              </div>
            </div>
          ))}
          
          {landingPageData.testimonials.length === 0 && (
            <div className="text-center py-8 text-pastel-pink-200">
              No testimonials added yet. Click "Add Testimonial" to create one.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={saveLandingPage}
          disabled={saving}
          className="flex items-center gap-2 bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FaSave />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManageLandingPage; 