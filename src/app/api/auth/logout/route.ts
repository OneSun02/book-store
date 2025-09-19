//src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Xóa cookie token (HttpOnly)
  const res = NextResponse.json({ success: true, message: "Đăng xuất thành công" });

  // set cookie token về rỗng + expire ngay lập tức
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",          // cookie có hiệu lực toàn site
    maxAge: 0,          // hết hạn ngay
    sameSite: "lax",    // tùy chọn bảo mật
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
