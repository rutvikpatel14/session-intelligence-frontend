export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDateDDMMYYYY(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function formatDateTimeDDMMYYYY(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDateDDMMYYYY(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function detectDeviceName() {
  if (typeof navigator === "undefined") return "Unknown device";

  const ua = navigator.userAgent || "";
  const platform = (navigator as unknown as { platform?: string }).platform || "";

  const browser = (() => {
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
    return "Browser";
  })();

  const os = (() => {
    const p = platform.toLowerCase();
    if (p.includes("win")) return "Windows";
    if (p.includes("mac")) return "macOS";
    if (p.includes("linux")) return "Linux";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    return "Device";
  })();

  return `${browser} on ${os}`;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const anyError = error as { response?: { data?: { error?: { message?: string } } } };
  const message = anyError?.response?.data?.error?.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  return fallback;
}


