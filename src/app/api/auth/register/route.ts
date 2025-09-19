import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, name, password, otp } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email không hợp lệ" }, { status: 400 });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email đã được đăng ký" }, { status: 400 });
    }

    // Nếu chưa có otp trong body → gửi OTP
    if (!otp) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

      // Lưu OTP
      const existingOtp = await prisma.otp.findFirst({ where: { email } });
      if (existingOtp) {
        await prisma.otp.update({
          where: { id: existingOtp.id },
          data: { code, expiresAt, createdAt: new Date() },
        });
      } else {
        await prisma.otp.create({ data: { email, code, expiresAt } });
      }

      // Gửi OTP
      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "OTP đã gửi thành công, Kiểm tra email của bạn!" });
    }

    // Nếu có otp → xác minh
    const existingOtp = await prisma.otp.findFirst({
      where: { email, code: otp },
      orderBy: { createdAt: "desc" },
    });

    if (!existingOtp || existingOtp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isVerified: true,
      },
    });

    // Xóa OTP sau khi dùng
    await prisma.otp.deleteMany({ where: { email } });

    // Tạo JWT
    const token = signJwt({ id: user.id, email: user.email });
    const res = NextResponse.json({ success: true, message: "Đăng ký thành công" });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Có lỗi server" }, { status: 500 });
  }
}
