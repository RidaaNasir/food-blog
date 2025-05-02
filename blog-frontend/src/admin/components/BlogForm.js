import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate
import axiosInstance from "../../utils/axiosInstance";

const BlogForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null); // For file upload
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate(); // Initialize navigate

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!title || !content || !author) {
      alert("Please fill in all required fields!");
      return;
    }

    const formData = new FormData(); // Create form data to send both text and file
    formData.append("title", title);
    formData.append("content", content);
    formData.append("author", author);
    if (image) {
      formData.append("image", image); // Append the file if it's selected
    }

    try {
      setIsSubmitting(true);

      const response = await axiosInstance.post(
        "/blogs", // Adjust to match your backend route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );

      alert("Blog created successfully!");
      console.log(response.data);

      // Reset form fields
      setTitle("");
      setContent("");
      setAuthor("");
      setImage(null);

      // Navigate to blogs page
      navigate("/blogs");
    } catch (error) {
      console.error("Error creating blog:", error.response || error.message);
      alert(
        error.response?.data?.message ||
          "Failed to create blog. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 rounded">
      <h1 className="text-2xl font-bold mb-4">Create a Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block font-medium mb-2">Content</label>
          <textarea
            className="w-full p-2 border rounded"
            rows="6"
            placeholder="Enter blog content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Author */}
        <div>
          <label className="block font-medium mb-2">Author</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-500"
            onChange={handleImageChange}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white py-2 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Create Blog"}
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
