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

export async function getThreadList({ q = "" } = {}) {
  const res = await messageApi.get("/api/messages/threads", {
    params: q ? { q } : {},
  });
  return res.data.data;
}

export async function getThreadMessages(senderUuid) {
  const res = await messageApi.get(`/api/messages/threads/${senderUuid}`);
  return res.data.data;
}

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

export async function sendNotification(payload) {
  const res = await messageApi.post("/api/notifications/send", payload);
  return res.data.data;
}

export async function getSentNotifications({ page = 1, perPage = 20 } = {}) {
  const res = await messageApi.get("/api/notifications/sent", {
    params: { page, per_page: perPage },
  });
  return res.data.data;
}

export async function getSentById(id) {
  const res = await messageApi.get(`/api/notifications/sent/${id}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Laravel scope-list endpoints (calls the Laravel backend, not the message service)
// ---------------------------------------------------------------------------

const LARAVEL_BASE_URL =
  getEnv("VITE_API_BASE_URL") ?? "http://localhost:8000/api";

const laravelApi = axios.create({
  baseURL: LARAVEL_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

laravelApi.interceptors.request.use(
  async (config) => {
    try {
      const authClient = AsgardeoSPAClient.getInstance();
      const accessToken = await authClient.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("messageService/laravelApi: failed to get access token", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export async function getScopeProvinces() {
  const res = await laravelApi.get("/message-service/scope-lists/provinces");
  return res.data.data;
}

export async function getScopeZones(peoWpId) {
  const res = await laravelApi.get("/message-service/scope-lists/zones", {
    params: peoWpId ? { peo_wp_id: peoWpId } : {},
  });
  return res.data.data;
}

export async function getScopeDivisions(zeoWpId) {
  const res = await laravelApi.get("/message-service/scope-lists/divisions", {
    params: zeoWpId ? { zeo_wp_id: zeoWpId } : {},
  });
  return res.data.data;
}

export async function getScopeSchools(deoWpId) {
  const res = await laravelApi.get("/message-service/scope-lists/schools", {
    params: deoWpId ? { deo_wp_id: deoWpId } : {},
  });
  return res.data.data;
}
