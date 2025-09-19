import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    // Nếu chỉ có email → bước gửi OTP
    if (email && !otp && !password) {
      // Kiểm tra email có tồn tại
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        return NextResponse.json({ success: false, message: "Email chưa được đăng ký" }, { status: 400 });
      }

      // Tạo OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const existingOtp = await prisma.otp.findFirst({ where: { email } });
      if (existingOtp) {
        await prisma.otp.update({
          where: { id: existingOtp.id },
          data: { code, expiresAt, createdAt: new Date() },
        });
      } else {
        await prisma.otp.create({ data: { email, code, expiresAt } });
      }

      await sendVerificationEmail(email, code);

      return NextResponse.json({ success: true, message: "OTP đặt lại mật khẩu đã gửi, vui lòng kiểm tra email" });
    }

    // Nếu có email + otp + password → bước xác minh OTP và đổi mật khẩu
    if (email && otp && password) {
      const otpEntry = await prisma.otp.findFirst({
        where: { email, code: otp },
        orderBy: { createdAt: "desc" },
      });

      if (!otpEntry || otpEntry.expiresAt < new Date()) {
        return NextResponse.json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 });
      }

      // Hash password và cập nhật
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Xóa OTP
      await prisma.otp.deleteMany({ where: { email } });

      return NextResponse.json({ success: true, message: "Đặt lại mật khẩu thành công" });
    }

    return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Có lỗi server" }, { status: 500 });
  }
}
