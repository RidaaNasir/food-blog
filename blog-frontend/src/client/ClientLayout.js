import React from "react";
import { Outlet, Link } from "react-router-dom";
import ClientNavbar from "./components/ClientNavBar";

const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-500">
      {/* Navbar */}
      <ClientNavbar />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 bg-gradient-to-b from-dark-500 to-dark-600 min-h-screen animate-fade-in">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-400 text-pastel-pink-200 py-6 md:py-8 border-t border-pastel-pink-300/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-display font-semibold mb-2 md:mb-4 text-pastel-pink-400">Delicious Bites</h3>
              <p className="text-xs md:text-sm">Sharing the joy of food through beautiful recipes and culinary adventures.</p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-display font-semibold mb-2 md:mb-4 text-pastel-pink-400">Quick Links</h3>
              <ul className="space-y-1 md:space-y-2">
                <li><Link to="/" className="text-sm md:text-base hover:text-pastel-pink-300 transition-colors duration-300">Home</Link></li>
                <li><Link to="/blogs" className="text-sm md:text-base hover:text-pastel-pink-300 transition-colors duration-300">Recipes</Link></li>
                <li><Link to="/login" className="text-sm md:text-base hover:text-pastel-pink-300 transition-colors duration-300">Login</Link></li>
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1 mt-4 sm:mt-0">
              <h3 className="text-lg md:text-xl font-display font-semibold mb-2 md:mb-4 text-pastel-pink-400">Connect</h3>
              <p className="text-xs md:text-sm mb-2 md:mb-4">Join our food-loving community on social media</p>
              <div className="flex space-x-3 md:space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-pastel-pink-300 hover:text-pastel-pink-500 transition-colors duration-300">Instagram</a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-pastel-pink-300 hover:text-pastel-pink-500 transition-colors duration-300">Pinterest</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-pastel-pink-300 hover:text-pastel-pink-500 transition-colors duration-300">Twitter</a>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-dark-300 text-center text-xs md:text-sm">
            <p>© {new Date().getFullYear()} The Bite Review. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
