import axios from "axios";
import { AsgardeoSPAClient } from "@asgardeo/auth-react";
import { getEnv } from "../utils/env";

const BASE_URL =
  getEnv("VITE_MESSAGE_SERVICE_URL") ?? "http://localhost:3001";

const messageApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

messageApi.interceptors.request.use(
  async (config) => {
    try {
      const authClient = AsgardeoSPAClient.getInstance();
      const accessToken = await authClient.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("messageService: failed to get access token", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export async function getInbox({ page = 1, perPage = 50 } = {}) {
  const res = await messageApi.get("/api/notifications/inbox", {
    params: { page, per_page: perPage },
  });
  return res.data.data;
}

export async function markRead(notificationId) {
  const res = await messageApi.patch(`/api/notifications/${notificationId}/read`);
  return res.data.data;
}

export async function acknowledge(notificationId) {
  const res = await messageApi.patch(`/api/notifications/${notificationId}/acknowledge`);
  return res.data.data;
}

export async function estimateReach(scope) {
  const res = await messageApi.post("/api/notifications/estimate-reach", { scope });
  return res.data.data;
}

export async function createNotification(payload) {
  const res = await messageApi.post("/api/notifications", payload);
  return res.data.data;
}

export async function getSentNotifications({ status, page = 1, perPage = 20 } = {}) {
  const res = await messageApi.get("/api/notifications", {
    params: { status, page, per_page: perPage },
  });
  return res.data.data;
}
