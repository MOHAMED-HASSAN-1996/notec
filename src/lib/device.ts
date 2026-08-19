const KEY = "notec_device";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let d = window.localStorage.getItem(KEY);
    if (!d) {
      d =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(KEY, d);
    }
    return d;
  } catch {
    return "fallback-device";
  }
}
