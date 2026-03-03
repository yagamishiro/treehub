export function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  let headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers as Record<string, string>
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
