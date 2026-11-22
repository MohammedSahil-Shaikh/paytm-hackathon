import type { HealthResponse, ServiceName, ServiceStatusState } from "@/types";

const DEFAULT_BACKEND_URL = "http://localhost:8000";
const DEFAULT_AI_SERVICE_URL = "http://localhost:8001";

export const API_URLS = {
  backend: process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL,
  aiService: process.env.NEXT_PUBLIC_AI_SERVICE_URL || DEFAULT_AI_SERVICE_URL,
} as const;

export const HEALTH_ENDPOINTS = {
  backend: `${API_URLS.backend}/api/v1/health`,
  aiService: `${API_URLS.aiService}/health`,
} as const;

const HEALTH_TIMEOUT_MS = 4000;

async function fetchHealth(
  url: string,
  expectedService: string,
): Promise<ServiceStatusState> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return "disconnected";
    }

    const data = (await response.json()) as HealthResponse;
    if (data.success && data.status === "healthy" && data.service === expectedService) {
      return "connected";
    }

    return "disconnected";
  } catch {
    return "disconnected";
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkServiceHealth(
  service: Exclude<ServiceName, "frontend">,
): Promise<ServiceStatusState> {
  if (service === "backend") {
    return fetchHealth(HEALTH_ENDPOINTS.backend, "backend");
  }
  return fetchHealth(HEALTH_ENDPOINTS.aiService, "ai-service");
}
