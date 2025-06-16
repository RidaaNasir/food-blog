import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaPlus } from "react-icons/fa";

const ManageBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/blogs");
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      console.log("Sending DELETE request for blog ID:", id);
      await axiosInstance.delete(`/blogs/${id}`);
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
      alert("Blog deleted successfully!");
    } catch (error) {
      console.error(
        "Error deleting blog:",
        error.response?.data || error.message
      );
      alert(
        `Failed to delete blog. ${
          error.response?.data?.message || "Something went wrong on the server."
        }`
      );
    }
  };

  const handleEditRedirect = (blogId) => {
    navigate(`/admin/edit-blog/${blogId}`);
  };

  const handleCreateRedirect = () => {
    navigate('/admin/create-blog');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-pastel-pink-400">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Manage Blogs</h1>
        <button
          onClick={handleCreateRedirect}
          className="bg-pastel-pink-500 text-dark-700 px-6 py-2 rounded-lg shadow hover:bg-pastel-pink-600 focus:outline-none transition duration-300 flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create New Blog</span>
        </button>
      </div>

      <div className="bg-dark-400 rounded-xl overflow-hidden shadow-lg border border-pastel-pink-500/20">
        {blogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-300 text-pastel-pink-200">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Author</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-dark-300/50 transition-colors">
                    <td className="py-3 px-4 text-white">{blog.title}</td>
                    <td className="py-3 px-4 text-pastel-pink-200">{blog.author}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditRedirect(blog._id)}
                          className="bg-pastel-pink-400 text-dark-700 px-3 py-1 rounded-md hover:bg-pastel-pink-500 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBlog(blog._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-pastel-pink-200 mb-4">No blogs found</p>
            <button
              onClick={handleCreateRedirect}
              className="bg-pastel-pink-500 text-dark-700 px-4 py-2 rounded-md hover:bg-pastel-pink-600 transition-colors"
            >
              Create Your First Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBlogs;
