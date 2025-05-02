import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaQuoteLeft, FaStar, FaSpinner, FaArrowLeft, FaArrowRight, FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import InstagramReels from '../components/InstagramReels';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef({});

  // Helper function to format URLs
  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Remove leading slash if present
    const cleanPath = url.replace(/^\/+/, '');
    // Add API base URL
    const apiBaseUrl = "http://localhost:5003";
    return `${apiBaseUrl}/${cleanPath}`;
  };

  useEffect(() => {
    // Test API connectivity
    const testApiConnection = async () => {
      try {
        const apiBaseUrl = "http://localhost:5003";
        console.log('Testing API connection to:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/test`);
        const data = await response.json();
        
        console.log('API Test Response:', data);
        
        if (data.message) {
          console.log('✅ Backend connection successful!');
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
      }
    };

    const fetchLandingPage = async () => {
      try {
        console.log('Fetching landing page data...');
        // Add timestamp parameter to prevent caching
        const timestamp = new Date().getTime();
        const response = await axiosInstance.get(`/landing-page?_=${timestamp}`);
        console.log('Landing page raw data received:', response.data);
        
        // Process the data to ensure media URLs are correct
        const data = { ...response.data };
        
        // Process hero images
        if (data.hero.images && data.hero.images.length > 0) {
          console.log('Processing hero images:', data.hero.images);
          data.hero.images = data.hero.images.map(img => formatUrl(img));
          console.log('Processed hero images:', data.hero.images);
        }
        
        // Process hero video
        if (data.hero.video) {
          console.log('Processing hero video:', data.hero.video);
          data.hero.video = formatUrl(data.hero.video);
          console.log('Processed hero video:', data.hero.video);
        }
        
        // Process featured content images
        if (data.featuredContent && data.featuredContent.items) {
          console.log('Processing featured content:', data.featuredContent.items.length, 'items');
          data.featuredContent.items = data.featuredContent.items.map(item => ({
            ...item,
            image: formatUrl(item.image)
          }));
        }
        
        // Process about image
        if (data.about && data.about.image) {
          console.log('Processing about image:', data.about.image);
          data.about.image = formatUrl(data.about.image);
        }
        
        // Process testimonial avatars
        if (data.testimonials && data.testimonials.length > 0) {
          console.log('Processing testimonials:', data.testimonials.length, 'items');
          data.testimonials = data.testimonials.map(testimonial => ({
            ...testimonial,
            avatar: formatUrl(testimonial.avatar)
          }));
        }
        
        // Process reels 
        if (data.reels && data.reels.items && data.reels.items.length > 0) {
          console.log('Processing reels:', data.reels.items.length, 'items');
        }
        
        console.log('Processed landing page data with formatted URLs');
        
        // Handle backward compatibility for hero.image to hero.images
        if (data.hero.image && !data.hero.images) {
          data.hero.images = data.hero.image ? [data.hero.image] : [];
        }
        
        console.log('Setting page data...');
        setPageData(data);
        console.log('Page data set successfully!');
      } catch (error) {
        console.error('Error fetching landing page:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError('Failed to load content. Please try again.');
      } finally {
        console.log('Finishing landing page fetch, setting loading to false');
        setLoading(false);
      }
    };

    testApiConnection();
    fetchLandingPage();
  }, []);

  useEffect(() => {
    if (!pageData || !isPlaying) return;

    const mediaCount = (pageData.hero.images?.length || 0) + (pageData.hero.video ? 1 : 0);
    if (mediaCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [pageData, currentMediaIndex, isPlaying]);

  const handlePrevMedia = useCallback(() => {
    if (!pageData) return;
    
    const mediaCount = (pageData.hero.images?.length || 0) + (pageData.hero.video ? 1 : 0);
    if (mediaCount <= 1) return;
    
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + mediaCount) % mediaCount);
  }, [pageData]);

  const handleNextMedia = useCallback(() => {
    if (!pageData) return;
    
    const mediaCount = (pageData.hero.images?.length || 0) + (pageData.hero.video ? 1 : 0);
    if (mediaCount <= 1) return;
    
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaCount);
  }, [pageData]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Handle reel playback
  const handleReelClick = (index) => {
    if (activeReelIndex === index) {
      // If clicking the active reel, toggle play/pause
      const video = videoRefs.current[index];
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    } else {
      // If clicking a new reel, pause the current one and play the new one
      if (activeReelIndex !== null && videoRefs.current[activeReelIndex]) {
        videoRefs.current[activeReelIndex].pause();
      }
      
      setActiveReelIndex(index);
      
      // Play the new video after a short delay to allow state update
      setTimeout(() => {
        if (videoRefs.current[index]) {
          videoRefs.current[index].play();
        }
      }, 100);
    }
  };

  // Toggle mute for all videos
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Apply to all video refs
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = !isMuted;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-pastel-pink-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pageData) return null;

  const hasHeroImages = pageData.hero.images && Array.isArray(pageData.hero.images) && pageData.hero.images.length > 0;
  const hasHeroVideo = Boolean(pageData.hero.video);
  const hasHeroMedia = hasHeroImages || hasHeroVideo;
  
  console.log('Hero media check:', {
    hasHeroImages,
    hasHeroVideo, 
    hasHeroMedia,
    images: pageData.hero.images,
    video: pageData.hero.video
  });
  
  const showHeroControls = (hasHeroImages && pageData.hero.images.length > 1) || (hasHeroImages && hasHeroVideo);
  const currentMediaIsVideo = hasHeroVideo && currentMediaIndex >= (hasHeroImages ? pageData.hero.images.length : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-16"
    >
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:h-screen bg-dark-500 overflow-hidden">
        {/* Background Media */}
        {hasHeroMedia && (
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              {currentMediaIsVideo ? (
                <motion.video
                  key="hero-video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  src={pageData.hero.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) =>
                    console.error(
                      "Hero video error:",
                      e.target.error,
                      pageData.hero.video
                    )
                  }
                  onLoadedData={() =>
                    console.log(
                      "Hero video loaded successfully:",
                      pageData.hero.video
                    )
                  }
                />
              ) : (
                <motion.img
                  key={`hero-image-${currentMediaIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  src={pageData.hero.images[currentMediaIndex]}
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) =>
                    console.error(
                      "Hero image error:",
                      e.target.error,
                      pageData.hero.images[currentMediaIndex]
                    )
                  }
                  onLoad={() =>
                    console.log(
                      "Hero image loaded successfully:",
                      pageData.hero.images[currentMediaIndex]
                    )
                  }
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-dark-700/70 to-dark-700/90"></div>
          </div>
        )}

        {/* Hero Controls */}
        {showHeroControls && (
          <div className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-10 flex items-center space-x-3 md:space-x-4">
            <motion.button
              onClick={togglePlayPause}
              className="bg-dark-500/50 hover:bg-dark-500/80 text-white p-1.5 md:p-2 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <FaPause className="text-xs md:text-base" />
              ) : (
                <FaPlay className="text-xs md:text-base" />
              )}
            </motion.button>
            <motion.button
              onClick={handlePrevMedia}
              className="bg-dark-500/50 hover:bg-dark-500/80 text-white p-1.5 md:p-2 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowLeft className="text-xs md:text-base" />
            </motion.button>
            <motion.button
              onClick={handleNextMedia}
              className="bg-dark-500/50 hover:bg-dark-500/80 text-white p-1.5 md:p-2 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowRight className="text-xs md:text-base" />
            </motion.button>
          </div>
        )}

        <div className="relative container mx-auto px-4 h-full flex items-start pt-32 md:items-center md:pt-0">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="gradient-text">{pageData.hero.title}</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg lg:text-xl text-gray-200 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {pageData.hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Link
                to={pageData.hero.ctaLink}
                className="inline-block px-6 py-2.5 md:px-8 md:py-3 bg-pastel-pink-500 text-white rounded-lg text-sm md:text-lg font-medium hover:bg-pastel-pink-600 transition-all duration-300 hover:shadow-lg btn-hover-glow"
              >
                {pageData.hero.ctaText}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reels Section */}
      {pageData.reels &&
        pageData.reels.items &&
        pageData.reels.items.length > 0 && (
          <section className="py-12 md:py-16 lg:py-20 bg-dark-500">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-6 md:mb-8 lg:mb-10 text-center"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">
                  <span className="gradient-text">
                    {pageData.reels.title || "Food Reels"}
                  </span>
                </h2>
                <p className="text-sm md:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
                  {pageData.reels.description ||
                    "Watch our latest food reels and get inspired"}
                </p>
              </motion.div>

              <InstagramReels
                reels={pageData.reels.items.map((reel) => ({
                  ...reel,
                  videoUrl: formatUrl(reel.videoUrl),
                  thumbnail: formatUrl(reel.thumbnail),
                }))}
              />
            </div>
          </section>
        )}

      {/* Featured Content Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-dark-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
              {pageData.featuredContent.title}
            </h2>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              {pageData.featuredContent.description}
            </p>
          </motion.div>

          {pageData.featuredContent.items &&
          pageData.featuredContent.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {pageData.featuredContent.items.map((item, index) => {
                return (
                  <motion.div
                    key={item.id || index}
                    className="bg-dark-400 rounded-lg md:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={item.link}>
                      <div className="relative aspect-video">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Featured content image failed to load:",
                              item.image
                            );
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-700/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 md:p-4 lg:p-6">
                          <h3 className="text-base md:text-lg lg:text-xl font-semibold text-white">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              No featured content available
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-dark-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {pageData.about.image && (
              <motion.div
                className="w-full lg:w-1/2 mb-8 lg:mb-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <img
                  src={pageData.about.image}
                  alt="About Us"
                  className="rounded-lg md:rounded-xl shadow-xl md:shadow-2xl w-full h-auto max-h-[500px] object-cover"
                  onError={(e) => {
                    console.error(
                      "About image failed to load:",
                      pageData.about.image
                    );
                    e.target.onerror = null;
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5BYm91dCBVczwvdGV4dD48L3N2Zz4=";
                  }}
                />
              </motion.div>
            )}

            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
                {pageData.about.title}
              </h2>
              <div
                className="text-gray-300 prose prose-sm md:prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: pageData.about.content }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {pageData.testimonials && pageData.testimonials.length > 0 && (
        <section className="py-12 md:py-16 lg:py-20 bg-dark-400">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12 lg:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              What Our Readers Say
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {pageData.testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id || index}
                  className="bg-dark-500 p-4 md:p-6 rounded-lg md:rounded-xl relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <FaQuoteLeft className="text-pastel-pink-400/20 text-3xl md:text-5xl absolute top-3 left-3 md:top-4 md:left-4" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      {testimonial.avatar && (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Testimonial avatar failed to load:",
                              testimonial.avatar
                            );
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjEyMTIxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNTU1Ij51c2VyPC90ZXh0Pjwvc3ZnPg==";
                          }}
                        />
                      )}
                      <div>
                        <h4 className="text-base md:text-lg font-semibold text-white">
                          {testimonial.name}
                        </h4>
                        <div className="flex text-pastel-pink-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`${
                                i < testimonial.rating
                                  ? "text-pastel-pink-400"
                                  : "text-gray-600"
                              } text-xs md:text-base`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300">
                      {testimonial.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Home;
