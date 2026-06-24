import axios from "axios";
import { getEnv } from "../utils/env";

const API = axios.create({
  baseURL: getEnv("VITE_API_BASE_URL"),
  headers: {
    "Content-Type": "application/json",
  },
});

// GET all versions
export const fetchVersions = () => API.get("/versions");

// POST new version
export const createVersion = (data) => API.post("/versions", data);

// UPDATE version by ID
export const updateVersion = (id, data) => API.put(`/versions/${id}`, data);

// DELETE version by ID
export const deleteVersion = (id) => API.delete(`/versions/${id}`);
