// lib/auth.ts

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  // Save to localStorage (for API calls)
  localStorage.setItem("token", token);
  // Save to cookie (for middleware to read)
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}`;
  //                                                   ↑ 24 hours
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  // Remove from localStorage
  localStorage.removeItem("token");
  // Remove from cookie
  document.cookie = "token=; path=/; max-age=0";
}

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