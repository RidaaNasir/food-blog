import React, { useState, useEffect, useRef } from "react";
import { FaImage, FaSave, FaSpinner, FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaYoutube } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const SiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: "Delicious Bites",
    siteDescription: "A food blog sharing delicious recipes and cooking tips",
    logo: "",
    favicon: "",
    primaryColor: "#ff6b81",
    secondaryColor: "#2f3542",
    footerText: "© 2023 Delicious Bites. All rights reserved.",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      pinterest: "",
      youtube: ""
    },
    contactEmail: "",
    contactPhone: "",
    address: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/site-settings");
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        setError("Failed to load site settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle social media input changes
  const handleSocialMediaChange = (platform, value) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "logo");

    try {
      setSaving(true);
      const response = await axiosInstance.post("/site-settings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.imageUrl) {
        handleInputChange("logo", response.data.imageUrl);
        setSuccess("Logo uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Failed to upload logo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle favicon upload
  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "favicon");

    try {
      setSaving(true);
      const response = await axiosInstance.post("/site-settings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data && response.data.imageUrl) {
        handleInputChange("favicon", response.data.imageUrl);
        setSuccess("Favicon uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading favicon:", error);
      setError("Failed to upload favicon. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Save site settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      await axiosInstance.put("/site-settings", settings);
      setSuccess("Site settings updated successfully!");
    } catch (error) {
      console.error("Error saving site settings:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pastel-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pastel-pink-200">Loading site settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-400 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-pastel-pink-400">Site Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-pastel-pink-600 transition-colors"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="bg-dark-300 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Basic Settings</h2>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => handleInputChange("siteTitle", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter site title"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter site description"
                rows="3"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Footer Text</label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => handleInputChange("footerText", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter footer text"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-pastel-pink-200 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                    placeholder="#ff6b81"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-pastel-pink-200 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                    placeholder="#2f3542"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo & Favicon */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Logo & Favicon</h2>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Logo</label>
              <div className="border-2 border-dashed border-pastel-pink-500/30 rounded-lg p-4 h-40 flex flex-col items-center justify-center bg-dark-500">
                {settings.logo ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={settings.logo}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      onClick={() => logoInputRef.current.click()}
                      className="absolute bottom-2 right-2 bg-pastel-pink-500 text-white p-2 rounded-full hover:bg-pastel-pink-600 transition-colors"
                    >
                      <FaImage />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaImage className="text-pastel-pink-500/50 text-5xl mx-auto mb-4" />
                    <p className="text-pastel-pink-200 mb-4">Upload site logo</p>
                    <button
                      onClick={() => logoInputRef.current.click()}
                      className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pastel-pink-600 transition-colors"
                    >
                      Select Logo
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">Recommended size: 200x60 pixels</p>
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Favicon</label>
              <div className="border-2 border-dashed border-pastel-pink-500/30 rounded-lg p-4 h-32 flex flex-col items-center justify-center bg-dark-500">
                {settings.favicon ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={settings.favicon}
                      alt="Favicon"
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      onClick={() => faviconInputRef.current.click()}
                      className="absolute bottom-2 right-2 bg-pastel-pink-500 text-white p-2 rounded-full hover:bg-pastel-pink-600 transition-colors"
                    >
                      <FaImage />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaImage className="text-pastel-pink-500/50 text-3xl mx-auto mb-2" />
                    <button
                      onClick={() => faviconInputRef.current.click()}
                      className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pastel-pink-600 transition-colors"
                    >
                      Select Favicon
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={handleFaviconUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">Recommended size: 32x32 pixels</p>
            </div>
          </div>
        </div>
        
        {/* Social Media */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Social Media</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#3b5998] p-2 rounded-lg">
                <FaFacebook className="text-white" />
              </div>
              <input
                type="text"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Facebook URL"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-[#1da1f2] p-2 rounded-lg">
                <FaTwitter className="text-white" />
              </div>
              <input
                type="text"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Twitter URL"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-[#c32aa3] p-2 rounded-lg">
                <FaInstagram className="text-white" />
              </div>
              <input
                type="text"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Instagram URL"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-[#bd081c] p-2 rounded-lg">
                <FaPinterest className="text-white" />
              </div>
              <input
                type="text"
                value={settings.socialMedia.pinterest}
                onChange={(e) => handleSocialMediaChange("pinterest", e.target.value)}
                className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Pinterest URL"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-[#ff0000] p-2 rounded-lg">
                <FaYoutube className="text-white" />
              </div>
              <input
                type="text"
                value={settings.socialMedia.youtube}
                onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                className="flex-1 bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="YouTube URL"
              />
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-pastel-pink-200 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter contact email"
              />
            </div>
            
            <div>
              <label className="block text-pastel-pink-200 mb-2">Contact Phone</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter contact phone"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-pastel-pink-200 mb-2">Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
                placeholder="Enter address"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings; 