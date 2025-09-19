import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Không có token → redirect login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("message", "Bạn chưa đăng nhập");
    return NextResponse.redirect(loginUrl);
  }

  // Token tồn tại → verify
  const payload = verifyJwt(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("message", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    return NextResponse.redirect(loginUrl);
  }

  // Token hợp lệ → tiếp tục
  return NextResponse.next();
}

export const config = {
  matcher: ["/cart", "/checkout", "/profile"],
  runtime: "nodejs",
};
