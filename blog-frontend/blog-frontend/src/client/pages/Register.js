import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/users/register", {
        username,
        email,
        password,
      });

      // Automatically log in after registration
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="bg-dark-400 rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-3xl font-display font-bold text-white mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Create Account
                </motion.h1>
                <motion.p 
                  className="text-pastel-pink-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Join our community of food lovers
                </motion.p>
              </div>

              {error && (
                <motion.div 
                  className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-pastel-pink-200 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="Your username"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-pastel-pink-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-pastel-pink-200 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-pastel-pink-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-field w-full"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>
              </form>

              <div className="mt-6 text-center text-pastel-pink-200">
                Already have an account?{" "}
                <Link to="/login" className="text-pastel-pink-400 hover:text-pastel-pink-300 transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
