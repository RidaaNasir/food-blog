import axios from "axios";

// Get the API base URL from environment variable or use localhost in development
const apiBaseUrl = process.env.NODE_ENV === 'development' 
  ? "http://localhost:5003"
  : "https://blog-backend-iurp.onrender.com";

console.log("Axios instance created with baseURL:", apiBaseUrl);

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // Enable credentials for CORS
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
    // Ensure error object exists before accessing properties
    const errorDetails = {
      url: error?.config?.url || 'unknown',
      status: error?.response?.status || 'unknown',
      message: error?.message || 'An unknown error occurred',
      data: error?.response?.data || null
    };
    
    console.error("API Response Error:", errorDetails);
    
    if (error?.code === "ECONNABORTED") {
      console.error("Request timeout - the server took too long to respond");
      return Promise.reject(new Error("Request timeout - please try again"));
    }
    
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error?.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    // Create a new error with the processed details
    const processedError = new Error(errorDetails.message);
    processedError.details = errorDetails;
    
    return Promise.reject(processedError);
  }
);

export default axiosInstance;
