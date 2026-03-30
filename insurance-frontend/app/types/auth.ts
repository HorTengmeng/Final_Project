export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
}

// lib/auth.ts

export function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function isAdmin(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decodeToken(token);
  return payload?.role === "ADMIN";
}

export function isUser(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decodeToken(token);
  return payload?.role === "USER";
}