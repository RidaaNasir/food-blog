import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import axios from "axios";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-pastel-pink-200 flex flex-col md:flex-row items-center justify-center p-6 md:p-12">
      {/* Left Section */}
      <div className="md:w-1/2 w-full mb-10 md:mb-0 md:pr-10 space-y-6">
        <h1 className="text-4xl font-bold text-pastel-pink-400">
          Zaina's Studio
        </h1>
        <div className="space-y-2 text-sm md:text-base">
          <p className="text-pastel-pink-200">
            📍 Address: 123 Creative Avenue, Kuwait
          </p>
          <p className="text-pastel-pink-200">
            📧 Email:{" "}
            <a
              href="mailto:hello@zainas.studio"
              className="underline hover:text-pastel-pink-400"
            >
              hello@zainas.studio
            </a>
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-6 pt-4">
          <a
            href="https://instagram.com/zainas.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pastel-pink-300 hover:text-pastel-pink-500"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://twitter.com/zainas_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pastel-pink-300 hover:text-pastel-pink-500"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://facebook.com/zainas.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pastel-pink-300 hover:text-pastel-pink-500"
          >
            <FaFacebook size={24} />
          </a>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          {success && (
            <div className="text-green-400 text-sm mb-2">
              Message sent successfully!
            </div>
          )}
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-dark-300 text-white border border-pastel-pink-400/30 focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-dark-300 text-white border border-pastel-pink-400/30 focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
            required
          />
          <textarea
            name="message"
            rows="4"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md bg-dark-300 text-white border border-pastel-pink-400/30 focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full py-3 bg-pastel-pink-500 text-black font-semibold rounded-md hover:bg-pastel-pink-600 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Right Section Image */}
      <div className="md:w-1/2 w-full">
        <img
          link="https://www.pngwing.com/en/free-png-vflfp#google_vignette" // change this to your actual image path
          alt="Contact Illustration"
          className="rounded-xl shadow-lg w-full object-cover"
        />
      </div>
    </div>
  );
};

export default ContactPage;
