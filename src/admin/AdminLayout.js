import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaList,
  FaUsers,
  FaPlus,
  FaSignOutAlt,
  FaUtensils,
  FaUser,
  FaPalette,
  FaCog,
  FaBars,
  FaFilm,
  FaTimes,
} from "react-icons/fa";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);

    if (!user || !user.id) {
      navigate("/login");
      return;
    }

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-500">
        <div className="animate-pulse text-pastel-pink-400 text-xl font-display">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col min-h-screen bg-dark-500">
      {/* Header */}
      <header className="bg-dark-400 text-white shadow-md py-4 border-b border-pastel-pink-500/20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUtensils className="text-pastel-pink-400 text-xl" />
            <h1 className="text-2xl font-display font-bold">
              <span className="text-pastel-pink-400">Admin</span> Dashboard
            </h1>
          </div>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-pastel-pink-400 focus:outline-none"
          >
            <FaBars className="text-2xl" />
          </button>

          {/* Profile & Logout (for larger screens) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/admin/profile"
              className="flex items-center space-x-2 text-pastel-pink-200 hover:text-pastel-pink-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-300 border border-pastel-pink-400/50">
                {user?.profilePicture ? (
                  <img
                    src={`/uploads/profiles/${user.profilePicture}`}
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-pastel-pink-300 text-sm" />
                  </div>
                )}
              </div>
              <span>{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-pastel-pink-500 text-dark-700 px-4 py-2 rounded-full font-medium hover:bg-pastel-pink-600 transition-colors duration-300 flex items-center space-x-2"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 z-50 bg-dark-400 text-white p-4 border-r border-pastel-pink-500/10 transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          {/* Close button for mobile */}
          <div className="flex justify-end md:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-pastel-pink-400 text-2xl mb-4"
            >
              <FaTimes />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="mt-6">
            <ul className="space-y-2">
              <NavItem
                to="/admin"
                icon={<FaHome />}
                label="Dashboard"
                current={location.pathname}
              />
              <NavItem
                to="/admin/manage-blogs"
                icon={<FaList />}
                label="Manage Blogs"
                current={location.pathname}
              />
              <NavItem
                to="/admin/manage-users"
                icon={<FaUsers />}
                label="Manage Users"
                current={location.pathname}
              />
              <NavItem
                to="/admin/create-blog"
                icon={<FaPlus />}
                label="Create New Blog"
                current={location.pathname}
              />
              <li className="mt-6 mb-2">
                <h3 className="text-xs uppercase text-pastel-pink-300 font-semibold px-4 mb-2">
                  Landing Page
                </h3>
                <div className="h-px bg-pastel-pink-500/20 mb-2"></div>
              </li>
              <NavItem
                to="/admin/landing-page"
                icon={<FaPalette />}
                label="Manage Landing Page"
                current={location.pathname}
              />
              <NavItem
                to="/admin/manage-reels"
                icon={<FaFilm />}
                label="Manage Reels"
                current={location.pathname}
              />
              <NavItem
                to="/admin/navigation"
                icon={<FaBars />}
                label="Navigation Menu"
                current={location.pathname}
              />
              <NavItem
                to="/admin/site-settings"
                icon={<FaCog />}
                label="Site Settings"
                current={location.pathname}
              />
              <li className="mt-6 mb-2">
                <h3 className="text-xs uppercase text-pastel-pink-300 font-semibold px-4 mb-2">
                  Account
                </h3>
                <div className="h-px bg-pastel-pink-500/20 mb-2"></div>
              </li>
              <NavItem
                to="/admin/profile"
                icon={<FaUser />}
                label="Profile Settings"
                current={location.pathname}
              />
            </ul>
          </nav>

          {/* Logout Button for Mobile */}
          <button
            onClick={handleLogout}
            className="bg-pastel-pink-500 text-dark-700 px-4 py-2 rounded-full font-medium hover:bg-pastel-pink-600 transition-colors duration-300 w-full mt-6"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gradient-to-b from-dark-500 to-dark-600 min-h-screen">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-dark-400 text-pastel-pink-200 py-4 border-t border-pastel-pink-300/20">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Delicious Bites Admin Panel. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// NavItem stays unchanged
const NavItem = ({ to, icon, label, current }) => {
  const isActive =
    current === to || (to !== "/admin" && current.startsWith(to));

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-pastel-pink-500/20 text-pastel-pink-300"
            : "text-white hover:bg-dark-300 hover:text-pastel-pink-200"
        }`}
      >
        <span
          className={isActive ? "text-pastel-pink-400" : "text-pastel-pink-200"}
        >
          {icon}
        </span>
        <span>{label}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pastel-pink-400"></span>
        )}
      </Link>
    </li>
  );
};

export default AdminLayout;
