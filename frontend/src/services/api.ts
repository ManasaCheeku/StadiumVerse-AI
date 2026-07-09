import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://stadium-verse-ai-flame.vercel.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;