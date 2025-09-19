import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") return NextResponse.json({ message: "Email không hợp lệ" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "Email không tồn tại" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    const existingOtp = await prisma.otp.findFirst({ where: { email } });
    if (existingOtp) {
      await prisma.otp.update({ where: { id: existingOtp.id }, data: { code: otp, expiresAt, createdAt: new Date() } });
    } else {
      await prisma.otp.create({ data: { email, code: otp, expiresAt } });
    }

    await sendVerificationEmail(email, otp);

    return NextResponse.json({ message: "OTP đã gửi thành công" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Có lỗi server" }, { status: 500 });
  }
}
