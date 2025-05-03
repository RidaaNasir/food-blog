import React, { useState, useEffect } from "react";
import { FaBlog, FaUsers, FaComments, FaHeart, FaSpinner } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    users: 0,
    comments: 0,
    likes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch actual stats from the API
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use Promise.allSettled to handle partial failures
        const [blogsResponse, usersResponse, commentsResponse, blogsWithLikesResponse] = await Promise.allSettled([
          axiosInstance.get('/blogs/count'),
          axiosInstance.get('/users/count'),
          axiosInstance.get('/blogs/comments/count'),
          axiosInstance.get('/blogs')
        ]);

        // Process blog count
        const blogsCount = blogsResponse.status === 'fulfilled' ? 
          blogsResponse.value.data.count || 0 : 0;
        
        // Process users count
        const usersCount = usersResponse.status === 'fulfilled' ? 
          usersResponse.value.data.count || 0 : 0;
        
        // Process comments count
        const commentsCount = commentsResponse.status === 'fulfilled' ? 
          commentsResponse.value.data.count || 0 : 0;
        
        // Process likes count
        let totalLikes = 0;
        if (blogsWithLikesResponse.status === 'fulfilled') {
          totalLikes = blogsWithLikesResponse.value.data.reduce((total, blog) => {
            return total + (blog.likes ? blog.likes.length : 0);
          }, 0);
        }

        setStats({
          blogs: blogsCount,
          users: usersCount,
          comments: commentsCount,
          likes: totalLikes
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to load dashboard statistics. Please try again later.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-3xl text-pastel-pink-400 mb-2" />
          <div className="text-pastel-pink-300">Loading dashboard statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-dark-400 rounded-xl p-6 shadow-lg border border-pastel-pink-500/20">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, <span className="text-pastel-pink-400">{user?.username || 'Admin'}</span>
        </h1>
        <p className="text-pastel-pink-200">
          Manage your food blog content, users, and more from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Blogs" 
          value={stats.blogs} 
          icon={<FaBlog />} 
          color="pastel-pink-400"
        />
        <StatCard 
          title="Registered Users" 
          value={stats.users} 
          icon={<FaUsers />} 
          color="pastel-pink-500"
        />
        <StatCard 
          title="Comments" 
          value={stats.comments} 
          icon={<FaComments />} 
          color="pastel-pink-600"
        />
        <StatCard 
          title="Total Likes" 
          value={stats.likes} 
          icon={<FaHeart />} 
          color="pastel-pink-700"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-400 rounded-xl p-6 shadow-lg border border-pastel-pink-500/20">
        <h2 className="text-xl font-display font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton 
            to="/admin/create-blog" 
            label="Create New Blog" 
            color="pastel-pink-500"
          />
          <QuickActionButton 
            to="/admin/manage-blogs" 
            label="Manage Blogs" 
            color="pastel-pink-600"
          />
          <QuickActionButton 
            to="/admin/manage-users" 
            label="Manage Users" 
            color="pastel-pink-700"
          />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-dark-400 rounded-xl p-6 shadow-lg border border-pastel-pink-500/20 transition-transform duration-300 hover:transform hover:scale-105">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-pastel-pink-200 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-display font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`text-${color} text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ to, label, color }) => {
  return (
    <a 
      href={to} 
      className={`bg-${color} text-dark-700 py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 hover:shadow-lg hover:opacity-90`}
    >
      {label}
    </a>
  );
};

export default AdminDashboard;
