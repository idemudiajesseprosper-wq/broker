import { protect } from "./auth";

// Verifies the request JWT and ensures the requester is an admin.
export function adminOnly(request) {
  const decoded = protect(request);

  if (decoded.role !== "admin") {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return decoded;
}
