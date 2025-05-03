import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCompress, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const InstagramReels = ({ reels = [] }) => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const [processedReels, setProcessedReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const videoRefs = useRef({});
  const sliderRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Process reels to ensure URLs are properly formatted
  useEffect(() => {
    if (!reels || reels.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const apiBaseUrl = "http://localhost:5003";
    
    const processed = reels.map(reel => {
      let videoUrl = reel.videoUrl;
      let thumbnail = reel.thumbnail;
      
      // Process video URL
      if (videoUrl) {
        // Remove leading slash if present
        if (videoUrl.startsWith('/')) {
          videoUrl = videoUrl.substring(1);
        }
        
        // Add API base URL if it's a relative path
        if (!videoUrl.startsWith('http')) {
          videoUrl = `${apiBaseUrl}/${videoUrl}`;
        }
        
        console.log('Processed video URL:', {
          original: reel.videoUrl,
          processed: videoUrl
        });
      }
      
      // Process thumbnail URL
      if (thumbnail) {
        // Remove leading slash if present
        if (thumbnail.startsWith('/')) {
          thumbnail = thumbnail.substring(1);
        }
        
        // Add API base URL if it's a relative path
        if (!thumbnail.startsWith('http')) {
          thumbnail = `${apiBaseUrl}/${thumbnail}`;
        }
      }
      
      return {
        ...reel,
        videoUrl,
        thumbnail
      };
    });
    
    setProcessedReels(processed);
    console.log('Processed reels:', processed);
    setIsLoading(false);
  }, [reels]);

  // Handle video errors
  const handleVideoError = (e, index, reel) => {
    console.error('Video error:', {
      element: e.target,
      src: e.target.src,
      error: e.target.error,
      reel,
      videoUrl: reel.videoUrl
    });
  };

  // Toggle play/pause for a specific reel
  const togglePlayPause = (index) => {
    const video = videoRefs.current[index];
    if (!video) {
      console.error('Video element not found for index:', index);
      return;
    }
    
    console.log('Attempting to play/pause video:', {
      index,
      src: video.src,
      currentTime: video.currentTime,
      paused: video.paused
    });
    
    if (video.paused) {
      video.play()
        .then(() => {
          console.log('Video started playing successfully');
          setIsPlaying(prev => ({ ...prev, [index]: true }));
        })
        .catch(error => {
          console.error('Error playing video:', error);
        });
    } else {
      video.pause();
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    }
  };

  // Toggle mute for all videos
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = newMutedState;
      }
    });
  };

  // Toggle like for a reel
  const toggleLike = (reelId) => {
    setLikedReels(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  // Toggle save for a reel
  const toggleSave = (reelId) => {
    setSavedReels(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  // Toggle fullscreen mode
  const toggleFullscreen = (index) => {
    console.log('Toggling fullscreen for index:', index);
    
    // First set the active reel index
    setActiveReelIndex(index);
    
    // Then enter fullscreen mode
    setIsFullscreen(true);
  };

  // Close fullscreen
  const closeFullscreen = () => {
    // Pause the active video
    if (activeReelIndex !== null) {
      const video = videoRefs.current[activeReelIndex];
      if (video) {
        video.pause();
        setIsPlaying(prev => ({ ...prev, [activeReelIndex]: false }));
      }
    }
    
    setIsFullscreen(false);
  };

  // Navigate to the next reel
  const nextReel = () => {
    if (processedReels.length === 0) return;
    
    setActiveReelIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % processedReels.length;
      return newIndex;
    });
  };

  // Navigate to the previous reel
  const prevReel = () => {
    if (processedReels.length === 0) return;
    
    setActiveReelIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + processedReels.length) % processedReels.length;
      return newIndex;
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e, info) => {
    setIsDragging(false);
    if (info.offset.x > 100) {
      prevReel();
    } else if (info.offset.x < -100) {
      nextReel();
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">Loading reels...</p>
      </div>
    );
  }

  if (!processedReels || processedReels.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">No reels available</p>
      </div>
    );
  }

  return (
    <div className="relative py-6 md:py-10">
      {/* Global title and description moved to Home.js, removing this section */}
      
      {/* Fullscreen Reel */}
      <AnimatePresence>
        {isFullscreen && activeReelIndex !== null && processedReels[activeReelIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                key={`fullscreen-${processedReels[activeReelIndex].id}`}
                ref={el => {
                  if (el) videoRefs.current[activeReelIndex] = el;
                }}
                src={processedReels[activeReelIndex].videoUrl}
                className="w-full h-full bg-black"
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                controls
                autoPlay
                onError={(e) => handleVideoError(e, activeReelIndex, processedReels[activeReelIndex])}
                onLoadedData={() => {
                  console.log('Fullscreen video loaded successfully:', {
                    index: activeReelIndex,
                    src: processedReels[activeReelIndex].videoUrl
                  });
                  // Try to play the video when it's loaded
                  const video = videoRefs.current[activeReelIndex];
                  if (video) {
                    video.play()
                      .then(() => {
                        console.log('Video started playing after load');
                        setIsPlaying(prev => ({ ...prev, [activeReelIndex]: true }));
                      })
                      .catch(err => console.error('Error playing video after load:', err));
                  }
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
              
              {/* Fullscreen Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <button
                      onClick={() => togglePlayPause(activeReelIndex)}
                      className="text-white text-lg md:text-xl hover:text-pastel-pink-400 transition-colors"
                    >
                      {isPlaying[activeReelIndex] ? <FaPause /> : <FaPlay />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="text-white text-lg md:text-xl hover:text-pastel-pink-400 transition-colors"
                    >
                      {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <button
                      onClick={() => toggleLike(processedReels[activeReelIndex].id)}
                      className={`text-lg md:text-xl transition-colors ${likedReels[processedReels[activeReelIndex].id] ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                    >
                      {likedReels[processedReels[activeReelIndex].id] ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button
                      onClick={() => toggleSave(processedReels[activeReelIndex].id)}
                      className={`text-lg md:text-xl transition-colors ${savedReels[processedReels[activeReelIndex].id] ? 'text-yellow-500' : 'text-white hover:text-yellow-500'}`}
                    >
                      {savedReels[processedReels[activeReelIndex].id] ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                    <button
                      onClick={closeFullscreen}
                      className="text-white text-lg md:text-xl hover:text-pastel-pink-400 transition-colors"
                    >
                      <FaCompress />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-white text-base md:text-lg font-medium mt-1 md:mt-2">
                  {processedReels[activeReelIndex].title}
                </h3>
              </div>
              
              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="absolute top-2 md:top-4 right-2 md:right-4 text-white text-lg md:text-xl hover:text-pastel-pink-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 3D Carousel Slider showing multiple reels */}
      <div className="relative h-[350px] sm:h-[400px] md:h-[500px] overflow-hidden mx-auto max-w-5xl rounded-lg md:rounded-xl shadow-md" 
           style={{ 
             perspective: '1000px'
           }}>
        <div className="relative w-full h-full flex items-center justify-center" ref={sliderRef}>
          <motion.div
            className="absolute h-full"
            style={{ width: '100%' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {processedReels.map((reel, index) => {
              // Calculate position for a multi-card display
              const isActive = index === activeReelIndex;
              const cardWidth = windowWidth < 640 ? 160 : windowWidth < 768 ? 200 : 280; // Responsive widths
              const cardGap = windowWidth < 640 ? 8 : windowWidth < 768 ? 12 : 20; // Responsive gaps
              
              // Position cards in a side-by-side arrangement
              // Center the active card and show others to left and right
              let xPosition = (index - activeReelIndex) * (cardWidth + cardGap);
              let zPosition = isActive ? 0 : -100;
              let scale = isActive ? 1 : 0.9;
              let rotateY = (index - activeReelIndex) * 5; // slight rotation
              let opacity = 1;
              
              // Adjust visibility for cards too far from active
              if (Math.abs(index - activeReelIndex) > 2) {
                opacity = 0.7;
              }
              
              return (
                <motion.div
                  key={reel.id}
                  className="absolute reel-item aspect-[9/16] w-[160px] sm:w-[200px] md:w-[280px] bg-dark-600 rounded-md sm:rounded-lg overflow-hidden shadow-lg md:shadow-2xl"
                  initial={false}
                  animate={{
                    x: xPosition,
                    z: zPosition,
                    scale: scale,
                    opacity: opacity,
                    rotateY: rotateY,
                    zIndex: processedReels.length - Math.abs(index - activeReelIndex)
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  onClick={() => {
                    if (isActive && !isDragging) {
                      toggleFullscreen(index);
                    } else if (!isDragging) {
                      setActiveReelIndex(index);
                    }
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: isActive 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
                      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-full">
                    <img
                      src={reel.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5ObyBUaHVtYm5haWw8L3RleHQ+PC9zdmc+'}
                      alt={reel.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 cursor-pointer transition-all">
                      <div className={`rounded-full p-2 sm:p-3 hover:scale-110 transition-all ${isActive ? 'bg-gray-800/80' : 'bg-white/30'}`}>
                        <FaPlay className="text-white text-base sm:text-xl" />
                      </div>
                    </div>
                    
                    {/* Reel Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <h3 className="text-white text-sm sm:text-base md:text-lg font-medium truncate">{reel.title}</h3>
                      {isActive && <div className="h-1 w-8 md:w-12 bg-gray-200 mt-1 md:mt-2 rounded-full"></div>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Navigation Arrows */}
          <button 
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-gray-800/70 hover:bg-gray-800/90 text-white rounded-full p-2 md:p-3 transition-all shadow-lg"
            onClick={prevReel}
          >
            <FaChevronLeft className="text-sm md:text-xl" />
          </button>
          
          <button 
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-gray-800/70 hover:bg-gray-800/90 text-white rounded-full p-2 md:p-3 transition-all shadow-lg"
            onClick={nextReel}
          >
            <FaChevronRight className="text-sm md:text-xl" />
          </button>
        </div>
      </div>
      
      {/* Pagination Indicators */}
      <div className="flex justify-center mt-4 md:mt-8 space-x-1 md:space-x-2">
        {processedReels.map((_, index) => (
          <button
            key={index}
            className={`h-2 md:h-3 rounded-full transition-all ${
              index === activeReelIndex ? 'bg-gray-800 w-6 md:w-8' : 'bg-gray-300 hover:bg-gray-400 w-2 md:w-3'
            }`}
            onClick={() => setActiveReelIndex(index)}
            aria-label={`Go to reel ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Global Controls */}
      <div className="fixed bottom-4 right-4 z-40 bg-gray-800/80 hover:bg-gray-800 p-2 md:p-3 rounded-full shadow-lg transition-all">
        <button
          onClick={toggleMute}
          className="text-white text-base md:text-xl"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>
    </div>
  );
};

export default InstagramReels; 