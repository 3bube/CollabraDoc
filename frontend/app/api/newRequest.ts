import axios from "axios";

const newRequest = () => {
  // Use fallback URL if environment variable isn't set
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log("Using API URL:", baseURL); // Helpful for debugging

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return instance;
};

export default newRequest;
