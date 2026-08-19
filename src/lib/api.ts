import { getDeviceId } from "./device";
import type { EventPublic } from "./types";

export type ApiEvent = EventPublic;

export type CheckResult = {
  match: EventPublic | null;
  reason: "url" | "title" | null;
};

export type ActionState = {
  isReserved: boolean;
  isReminded: boolean;
  beforeMinutes: number;
  attendeesCount: number;
};

export type MyData = {
  reservations: (EventPublic & { at: string })[];
  reminders: (EventPublic & { beforeMinutes: number })[];
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-device-id": getDeviceId(),
      ...(init?.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (json as { error?: string })?.error || res.statusText,
      json,
    );
  }
  return json as T;
}

function qs(params: Record<string, string | undefined>): string {
  const s = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join("&");
  return s ? `?${s}` : "";
}

export const api = {
  listEvents: (params?: { q?: string; category?: string }) =>
    req<{ events: EventPublic[] }>(`/api/events${qs(params || {})}`),

  getEvent: (id: string) =>
    req<{ event: EventPublic; state: ActionState; related: EventPublic[] }>(
      `/api/events/${id}`,
    ),

  check: (url: string, title: string) =>
    req<CheckResult>(`/api/events/check${qs({ url, title })}`),

  createEvent: (body: Record<string, string>) =>
    req<{ id: string; event: EventPublic }>("/api/events", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  action: (id: string, body: { action: string; beforeMinutes?: number }) =>
    req<ActionState>(`/api/events/${id}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  my: () => req<MyData>(`/api/my${qs({ device: getDeviceId() })}`),
};
