import React from "react";

const AdminDrawer = ({ isOpen, toggleDrawer }) => {
  return (
    <div>
      {/* Overlay for drawer */}
      <div
        className={`fixed inset-0 z-40 bg-gray-800 bg-opacity-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleDrawer}
      ></div>

      {/* Drawer Content */}
      <div
        className={`fixed top-0 left-0 w-64 bg-white h-full p-4 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
        <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="/admin/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/admin/manage-blogs"
              className="text-gray-700 hover:text-blue-600"
            >
              Manage Blogs
            </a>
          </li>
          <li>
            <a
              href="/admin/manage-users"
              className="text-gray-700 hover:text-blue-600"
            >
              Manage Users
            </a>
          </li>
          <li>
            <a
              href="/admin/blogs"
              className="text-gray-700 hover:text-blue-600"
            >
              Create New Blogs
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDrawer;
