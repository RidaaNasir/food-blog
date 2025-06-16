import React, { useState, useEffect } from "react";
import { FaSpinner, FaSave, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaLink, FaExternalLinkAlt } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const ManageNavigation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newItem, setNewItem] = useState({
    title: "",
    url: "",
    isExternal: false,
    order: 0
  });

  // Fetch navigation menu items
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/navigation");
        if (response.data) {
          setMenuItems(response.data.sort((a, b) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error fetching navigation:", error);
        setError("Failed to load navigation items");
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  // Handle new item input changes
  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new menu item
  const addMenuItem = () => {
    if (!newItem.title || !newItem.url) {
      setError("Title and URL are required.");
      return;
    }

    const itemToAdd = {
      ...newItem,
      id: Date.now().toString(),
      order: menuItems.length
    };

    setMenuItems(prev => [...prev, itemToAdd]);
    setNewItem({
      title: "",
      url: "",
      isExternal: false,
      order: 0
    });
    setSuccess("Menu item added successfully!");
  };

  // Update menu item
  const updateMenuItem = (id, field, value) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Remove menu item
  const removeMenuItem = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    setSuccess("Menu item removed successfully!");
  };

  // Move item up in order
  const moveItemUp = (index) => {
    if (index === 0) return;
    
    const newMenuItems = [...menuItems];
    const temp = newMenuItems[index];
    newMenuItems[index] = newMenuItems[index - 1];
    newMenuItems[index - 1] = temp;
    
    // Update order property
    newMenuItems.forEach((item, idx) => {
      item.order = idx;
    });
    
    setMenuItems(newMenuItems);
  };

  // Move item down in order
  const moveItemDown = (index) => {
    if (index === menuItems.length - 1) return;
    
    const newMenuItems = [...menuItems];
    const temp = newMenuItems[index];
    newMenuItems[index] = newMenuItems[index + 1];
    newMenuItems[index + 1] = temp;
    
    // Update order property
    newMenuItems.forEach((item, idx) => {
      item.order = idx;
    });
    
    setMenuItems(newMenuItems);
  };

  // Save navigation menu
  const saveNavigation = async () => {
    try {
      setSaving(true);
      await axiosInstance.put("/navigation", menuItems);
      setSuccess("Navigation menu updated successfully!");
    } catch (error) {
      console.error("Error saving navigation menu:", error);
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
          <p className="text-pastel-pink-200">Loading navigation menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-400 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-pastel-pink-400">Manage Navigation</h1>
        <button
          onClick={saveNavigation}
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

      <div className="bg-dark-300 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Add Menu Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-pastel-pink-200 mb-2">Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => handleNewItemChange("title", e.target.value)}
              className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
              placeholder="Menu item title"
            />
          </div>
          
          <div>
            <label className="block text-pastel-pink-200 mb-2">URL</label>
            <input
              type="text"
              value={newItem.url}
              onChange={(e) => handleNewItemChange("url", e.target.value)}
              className="w-full bg-dark-500 border border-pastel-pink-500/30 rounded-lg px-4 py-2 text-white"
              placeholder="Menu item URL"
            />
          </div>
          
          <div className="flex items-end">
            <div className="mr-4">
              <label className="flex items-center text-pastel-pink-200 mb-2">
                <input
                  type="checkbox"
                  checked={newItem.isExternal}
                  onChange={(e) => handleNewItemChange("isExternal", e.target.checked)}
                  className="mr-2"
                />
                External Link
              </label>
            </div>
            
            <button
              onClick={addMenuItem}
              className="bg-pastel-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-pastel-pink-600 transition-colors"
            >
              <FaPlus />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-300 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-pastel-pink-300 mb-4">Menu Items</h2>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8 text-pastel-pink-200">
            No menu items added yet. Add your first menu item above.
          </div>
        ) : (
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div key={item.id} className="bg-dark-500 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveItemUp(index)}
                      disabled={index === 0}
                      className={`text-pastel-pink-300 p-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-pastel-pink-500/20 rounded'}`}
                    >
                      <FaArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItemDown(index)}
                      disabled={index === menuItems.length - 1}
                      className={`text-pastel-pink-300 p-1 ${index === menuItems.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-pastel-pink-500/20 rounded'}`}
                    >
                      <FaArrowDown size={14} />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateMenuItem(item.id, "title", e.target.value)}
                        className="bg-dark-400 border border-pastel-pink-500/30 rounded px-3 py-1 text-white"
                        placeholder="Menu title"
                      />
                      
                      {item.isExternal && (
                        <FaExternalLinkAlt className="text-pastel-pink-300" size={14} />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FaLink className="text-pastel-pink-300" size={14} />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateMenuItem(item.id, "url", e.target.value)}
                        className="bg-dark-400 border border-pastel-pink-500/30 rounded px-3 py-1 text-white text-sm"
                        placeholder="URL"
                      />
                      
                      <label className="flex items-center text-pastel-pink-200 text-sm">
                        <input
                          type="checkbox"
                          checked={item.isExternal}
                          onChange={(e) => updateMenuItem(item.id, "isExternal", e.target.checked)}
                          className="mr-1"
                        />
                        External
                      </label>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeMenuItem(item.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNavigation; 