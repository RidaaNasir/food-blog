import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaUser, FaCamera, FaKey, FaCheck, FaSpinner } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/users/profile");
        setUser(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        
        // Set profile image if exists
        if (response.data.profilePicture) {
          setImagePreview(`/uploads/profiles/${response.data.profilePicture}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate passwords if trying to change password
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    // Create form data for multipart/form-data (for image upload)
    const formData = new FormData();
    if (username !== user.username) formData.append("username", username);
    if (email !== user.email) formData.append("email", email);
    if (currentPassword) formData.append("currentPassword", currentPassword);
    if (newPassword) formData.append("newPassword", newPassword);
    if (profileImage) formData.append("profilePicture", profileImage);
    
    // Only proceed if there are changes
    if (formData.entries().next().done) {
      setError("No changes to save");
      return;
    }
    
    setSaving(true);
    try {
      const response = await axiosInstance.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update local storage with new user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...userData,
        username: response.data.username,
        email: response.data.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(response.data);
      setSuccess("Profile updated successfully!");
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-pastel-pink-400">Loading profile...</div>
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
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Profile <span className="text-pastel-pink-400">Settings</span>
        </h1>
        <p className="text-pastel-pink-200 mb-6">
          Manage your personal information and account settings
        </p>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group mb-4 border-2 border-pastel-pink-400"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-dark-300 flex items-center justify-center">
                  <FaUser className="text-pastel-pink-300 text-4xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-dark-700/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <FaCamera className="text-pastel-pink-300 text-2xl" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <p className="text-pastel-pink-200 text-sm">Click to change profile picture</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-pastel-pink-200 mb-2 font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-pastel-pink-200 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-dark-300 pt-6">
            <h2 className="text-xl font-display font-semibold text-white mb-4 flex items-center">
              <FaKey className="mr-2 text-pastel-pink-400" /> Change Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="currentPassword" className="block text-pastel-pink-200 mb-2 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-pastel-pink-200 mb-2 font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-pastel-pink-200 mb-2 font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-300 border border-dark-200 rounded-lg p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettings; 