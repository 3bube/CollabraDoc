import axios from "axios";

const newRequest = () => {
  // Use fallback URL if environment variable isn't set
  const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://collabradoc.onrender.com";

  console.log("Using API URL:", baseURL); // Helpful for debugging

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      // Add these headers to support CORS
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    },
    withCredentials: true, // Keep this for cookies
  });

  // Add request interceptor to handle CORS preflight
  instance.interceptors.request.use(
    function (config) {
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default newRequest;
