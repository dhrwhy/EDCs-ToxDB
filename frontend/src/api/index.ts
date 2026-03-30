import axios from "axios";

const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${base}/api`,
  timeout: 10000,
});

export default api;
