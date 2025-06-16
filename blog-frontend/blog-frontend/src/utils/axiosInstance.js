import axios from "axios";

// Get the API base URL from environment variable - use localhost instead of IP address
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;



console.log("Axios instance created with baseURL:", apiBaseUrl);


// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false // For cross-origin requests
});

// Add a request interceptor to include the auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url
    });
    
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common response issues
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("API Response Success:", {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - the server took too long to respond");
      return Promise.reject(new Error("Request timeout - please try again"));
    }
    
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
