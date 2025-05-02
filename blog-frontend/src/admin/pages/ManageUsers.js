import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield, FaUserAlt, FaTrash, FaCheck, FaTimes, FaSearch, FaSpinner, FaBlog, FaComment } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch user details when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchUserDetails = async () => {
        setLoadingDetails(true);
        try {
          const response = await axiosInstance.get(`/users/${selectedUser._id}`);
          setUserDetails(response.data);
        } catch (error) {
          console.error("Error fetching user details:", error);
          setError("Failed to load user details. Please try again.");
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchUserDetails();
    }
  }, [selectedUser]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle toggling admin status
  const handleToggleAdminStatus = async (userId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/users/${userId}/admin-status`, {
        isAdmin: !currentStatus
      });
      
      // Update users list
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
      
      // Update selected user if it's the one being modified
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, isAdmin: !currentStatus });
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert(error.response?.data?.message || "Failed to update admin status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-pastel-pink-400">Loading users...</div>
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
          User <span className="text-pastel-pink-400">Management</span>
        </h1>
        <p className="text-pastel-pink-200 mb-6">
          Manage registered users, their permissions, and activities
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-pastel-pink-300" />
          </div>
          <input
            type="text"
            className="w-full bg-dark-300 border border-dark-200 rounded-lg pl-10 p-3 text-white focus:border-pastel-pink-400 focus:ring-1 focus:ring-pastel-pink-400 transition-colors"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1 bg-dark-300 rounded-lg overflow-hidden">
            <div className="p-4 bg-dark-200 border-b border-dark-100">
              <h2 className="text-lg font-semibold text-white">Users ({filteredUsers.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredUsers.length > 0 ? (
                <ul className="divide-y divide-dark-200">
                  {filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      className={`p-4 hover:bg-dark-200 cursor-pointer transition-colors ${
                        selectedUser && selectedUser._id === user._id ? "bg-dark-200" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {user.isAdmin ? (
                            <FaUserShield className="text-pastel-pink-400 text-lg" />
                          ) : (
                            <FaUserAlt className="text-pastel-pink-200 text-lg" />
                          )}
                          <div>
                            <h3 className="text-white font-medium">{user.username}</h3>
                            <p className="text-pastel-pink-200 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {/* Don't show delete button for current user */}
                          {currentUser && currentUser.id !== user._id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete User"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-pastel-pink-200">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2 bg-dark-300 rounded-lg overflow-hidden">
            {selectedUser ? (
              loadingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="text-pastel-pink-400 text-2xl animate-spin" />
                </div>
              ) : (
                <div>
                  <div className="p-4 bg-dark-200 border-b border-dark-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">User Details</h2>
                    {/* Admin toggle button - don't show for current user */}
                    {currentUser && currentUser.id !== selectedUser._id && (
                      <button
                        onClick={() => handleToggleAdminStatus(selectedUser._id, selectedUser.isAdmin)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                          selectedUser.isAdmin
                            ? "bg-pastel-pink-400 text-dark-700 hover:bg-pastel-pink-500"
                            : "bg-dark-400 text-white hover:bg-dark-500"
                        }`}
                      >
                        {selectedUser.isAdmin ? (
                          <>
                            <FaTimes className="text-xs" />
                            <span>Remove Admin</span>
                          </>
                        ) : (
                          <>
                            <FaCheck className="text-xs" />
                            <span>Make Admin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-pastel-pink-300 text-sm font-medium mb-2">Basic Information</h3>
                      <div className="bg-dark-400 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-pastel-pink-200 text-xs">Username</p>
                            <p className="text-white">{selectedUser.username}</p>
                          </div>
                          <div>
                            <p className="text-pastel-pink-200 text-xs">Email</p>
                            <p className="text-white">{selectedUser.email}</p>
                          </div>
                          <div>
                            <p className="text-pastel-pink-200 text-xs">Role</p>
                            <p className="text-white flex items-center">
                              {selectedUser.isAdmin ? (
                                <>
                                  <FaUserShield className="text-pastel-pink-400 mr-1" /> Administrator
                                </>
                              ) : (
                                <>
                                  <FaUserAlt className="text-pastel-pink-200 mr-1" /> Regular User
                                </>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-pastel-pink-200 text-xs">User ID</p>
                            <p className="text-white text-sm truncate">{selectedUser._id}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {userDetails && (
                      <>
                        {/* User's Blogs */}
                        <div className="mb-6">
                          <h3 className="text-pastel-pink-300 text-sm font-medium mb-2 flex items-center">
                            <FaBlog className="mr-2" /> Blogs ({userDetails.activity.blogs.length})
                          </h3>
                          <div className="bg-dark-400 rounded-lg p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {userDetails.activity.blogs.length > 0 ? (
                              <ul className="divide-y divide-dark-300">
                                {userDetails.activity.blogs.map((blog) => (
                                  <li key={blog._id} className="py-2">
                                    <div className="flex justify-between items-center">
                                      <p className="text-white hover:text-pastel-pink-300 cursor-pointer" 
                                         onClick={() => navigate(`/blogs/${blog._id}`)}>
                                        {blog.title}
                                      </p>
                                      <p className="text-pastel-pink-200 text-xs">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-pastel-pink-200 text-center py-4">
                                This user hasn't created any blogs yet.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* User's Comments */}
                        <div>
                          <h3 className="text-pastel-pink-300 text-sm font-medium mb-2 flex items-center">
                            <FaComment className="mr-2" /> Comments ({userDetails.activity.comments.length})
                          </h3>
                          <div className="bg-dark-400 rounded-lg p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {userDetails.activity.comments.length > 0 ? (
                              <ul className="divide-y divide-dark-300">
                                {userDetails.activity.comments.map((comment, index) => (
                                  <li key={index} className="py-2">
                                    <div className="mb-1">
                                      <p className="text-white text-sm">{comment.comment}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <p className="text-pastel-pink-300 text-xs hover:underline cursor-pointer"
                                         onClick={() => navigate(`/blogs/${comment.blogId}`)}>
                                        On: {comment.blogTitle}
                                      </p>
                                      <p className="text-pastel-pink-200 text-xs">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-pastel-pink-200 text-center py-4">
                                This user hasn't made any comments yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-pastel-pink-200">
                <FaUserAlt className="text-4xl mb-4 opacity-50" />
                <p>Select a user to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageUsers;
