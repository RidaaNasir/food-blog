import axios from "axios";

// Get the API base URL from environment variable or use localhost in development
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "https://blog-backend-iurp.onrender.com";

console.log("Axios instance created with baseURL:", apiBaseUrl);

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 10000, // Increased timeout to 10 seconds
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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message,
        data: error.response.data
      });

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }

    // Create a new error object with processed error message
    const processedError = new Error(error.response?.data?.message || error.message);
    processedError.details = {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    };

    return Promise.reject(processedError);
  }
);

export default axiosInstance;
