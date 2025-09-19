import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET not set in environment variables");

// Tạo token
export function signJwt(payload: object, expiresIn: string | number = "7d") {
  return jwt.sign(payload, SECRET as jwt.Secret, { expiresIn });
}

// Xác thực token
export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET as jwt.Secret);
  } catch (err) {
    return null;
  }
}
