import { useAuthContext } from "@asgardeo/auth-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDosService = () => {
  const { getAccessToken } = useAuthContext();

  const getAllDos = async () => {
    const token = await getAccessToken(); // get token from auth
    if (!token) throw new Error("Access token not available");

    const res = await fetch(`${API_BASE_URL}/deo-officers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch DOs: ${res.statusText}`);
    }

    return res.json(); // assume API returns array or { data: [] }
  };

  return { getAllDos };
};
