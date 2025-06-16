import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from "./admin/AdminLayout";
import ClientLayout from "./client/ClientLayout";

import Home from "./client/pages/Home";
import Login from "./client/pages/Login";
import Register from "./client/pages/Register";
import Blog from "./client/pages/Blog";
import AdminDashboard from "./admin/pages/AdminDashboard";
import ManageBlogs from "./admin/pages/ManageBlogs";
import ManageUsers from "./admin/pages/ManageUsers";
import BlogDetails from "./client/pages/BlogDetails";
import EditBlogs from './admin/pages/EditBlogs';
import CreateBlog from './admin/pages/CreateBlog';
import ProfileSettings from './admin/pages/ProfileSettings';
import ManageLandingPage from './admin/pages/ManageLandingPage';
import ManageNavigation from './admin/pages/ManageNavigation';
import SiteSettings from './admin/pages/SiteSettings';
import ManageReels from './admin/pages/ManageReels';
import ContactPage from "./client/pages/ContacPage";

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-blogs" element={<ManageBlogs />} />
          <Route path="edit-blog/:id" element={<EditBlogs />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="create-blog" element={<CreateBlog />} />
          <Route path="profile" element={<ProfileSettings />} />

          {/* Landing Page Management Routes */}
          <Route path="landing-page" element={<ManageLandingPage />} />
          <Route path="manage-reels" element={<ManageReels />} />
          <Route path="navigation" element={<ManageNavigation />} />
          <Route path="site-settings" element={<SiteSettings />} />
        </Route>

        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="blogs" element={<Blog />} />
          <Route path="blogs/:id" element={<BlogDetails />} />
          <Route path="contact" element={<ContactPage />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
