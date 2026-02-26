let accessToken: string | null = null;
let csrfToken: string | null = null;

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken() {
  return csrfToken;
}

export function clearAuthState() {
  accessToken = null;
  csrfToken = null;
}

