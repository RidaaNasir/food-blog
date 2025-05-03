import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUtensils, FaBars, FaTimes } from "react-icons/fa";

const ClientNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark-500/95 backdrop-blur-sm shadow-lg py-1 md:py-2"
          : "bg-dark-600 py-2 md:py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Brand Name */}
        <Link to="/" className="flex items-center space-x-1 md:space-x-2 group">
          <FaUtensils className="text-pastel-pink-400 text-lg md:text-xl group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xl md:text-2xl font-display font-bold text-white">
            <span className="text-pastel-pink-400">The Bite Review</span> 
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" current={location.pathname}>
            Home
          </NavLink>
          <NavLink to="/blogs" current={location.pathname}>
            Restaurants
          </NavLink>
          

          {user ? (
            <>
              <span className="text-pastel-pink-200 px-3 py-2">
                Hello, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-pastel-pink-500 text-dark-700 px-4 py-2 rounded-full font-medium hover:bg-pastel-pink-600 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" current={location.pathname}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="bg-pastel-pink-500 text-dark-700 ml-2 px-4 py-2 rounded-full font-medium hover:bg-pastel-pink-600 transition-all duration-300 hover:shadow-lg"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-1 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FaTimes className="h-5 w-5 md:h-6 md:w-6 text-pastel-pink-400" />
          ) : (
            <FaBars className="h-5 w-5 md:h-6 md:w-6 text-pastel-pink-400" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed inset-x-0 z-40 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ top: scrolled ? "42px" : "50px" }}
      >
        <div className="px-4 py-3 space-y-2 bg-dark-400 shadow-inner">
          <MobileNavLink to="/" onClick={() => setIsOpen(false)}>
            Home
          </MobileNavLink>
          <MobileNavLink to="/blogs" onClick={() => setIsOpen(false)}>
            Food Blog
          </MobileNavLink>

          {user ? (
            <>
              <div className="text-pastel-pink-200 py-2 border-t border-dark-300 mt-2">
                Hello, {user.username}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-center bg-pastel-pink-500 text-dark-700 py-2 rounded-md font-medium hover:bg-pastel-pink-600 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>
                Login
              </MobileNavLink>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-pastel-pink-500 text-dark-700 py-2 rounded-md font-medium hover:bg-pastel-pink-600 transition-colors duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, current, children }) => {
  const isActive = current === to;
  
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 rounded-md font-medium transition-all duration-300 ${
        isActive 
          ? "text-pastel-pink-300" 
          : "text-white hover:text-pastel-pink-200"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pastel-pink-400 rounded-full"></span>
      )}
    </Link>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ to, onClick, children }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block py-2 text-white hover:text-pastel-pink-300 transition-colors duration-300"
    >
      {children}
    </Link>
  );
};

export default ClientNavbar;
