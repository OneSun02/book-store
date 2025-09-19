import jwt, { Secret, SignOptions } from "jsonwebtoken";

// ===== Kiểu payload rõ ràng =====
export interface JwtPayload {
  id: number;
  email?: string;
  role?: "USER" | "ADMIN";
}

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET not set in environment variables");

// ===== Tạo token =====
export function signJwt(payload: JwtPayload, expiresIn: string | number = "7d") {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, SECRET as Secret, options);
}

// ===== Xác thực token =====
export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET as Secret);
    // Nếu decoded không phải object, trả về null
    if (typeof decoded !== "object" || decoded === null) return null;
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
