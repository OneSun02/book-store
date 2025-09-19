import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ message: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: "Email chưa đăng ký" }, { status: 400 });

  if (!user.isVerified) return NextResponse.json({ message: "Vui lòng xác thực email" }, { status: 400 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ message: "Email hoặc mật khẩu của bạn không đúng" }, { status: 400 });

  const token = signJwt({ id: user.id, email: user.email });

  const res = NextResponse.json({ message: "Đăng nhập thành công" });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
  });

  return res;
}
