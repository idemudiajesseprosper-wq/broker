import jwt from "jsonwebtoken";

// Verifies Authorization: Bearer <token> and returns the decoded JWT payload.
export function protect(req) {
  const authorization =
    typeof req.headers?.get === "function"
      ? req.headers.get("authorization")
      : req.headers?.authorization || req.headers?.Authorization;
  const cookieToken =
    typeof req.cookies?.get === "function"
      ? req.cookies.get("bsx_token")?.value
      : null;

  if (
    (!authorization || !authorization.startsWith("Bearer ")) &&
    !cookieToken
  ) {
    throw new Error("Unauthorized");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const token = cookieToken || authorization.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("Unauthorized");
  }
}
