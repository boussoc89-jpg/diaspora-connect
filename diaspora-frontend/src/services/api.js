import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter le token JWT automatiquement à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Gérer les erreurs automatiquement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Services Auth
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
};

// Services Projets
export const projetService = {
  getAll: () => api.get("/projets"),
  getOne: (id) => api.get(`/projets/${id}`),
  create: (data) => api.post("/projets", data),
  update: (id, data) => api.put(`/projets/${id}`, data),
  delete: (id) => api.delete(`/projets/${id}`),
};

// Services Partenaires
export const partenaireService = {
  getAll: () => api.get("/partenaires"),
  getOne: (id) => api.get(`/partenaires/${id}`),
  create: (data) => api.post("/partenaires", data),
  update: (id, data) => api.put(`/partenaires/${id}`, data),
  delete: (id) => api.delete(`/partenaires/${id}`),
};

// Services Financements
export const financementService = {
  getByProjet: (projetId) => api.get(`/financements/projet/${projetId}`),
  getStats: (projetId) => api.get(`/financements/stats/${projetId}`),
  create: (data) => api.post("/financements", data),
  update: (id, data) => api.put(`/financements/${id}`, data),
  delete: (id) => api.delete(`/financements/${id}`),
};
// Services Export
export const exportService = {
  exportProjetPDF: (id) =>
    api.get(`/export/projet/${id}/pdf`, { responseType: "blob" }),
  exportProjetsExcel: () =>
    api.get("/export/projets/excel", { responseType: "blob" }),
};
export default api;
