import axios from "axios";

// Created  axios with a base URL
const axiosInstance = axios.create({
  baseURL: "https://seasavor-final.onrender.com",
});

export default axiosInstance;