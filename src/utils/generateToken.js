import jwt from "jsonwebtoken";

// Creates a signed session token containing the user's id and role.
export function generateToken(userId, role) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
