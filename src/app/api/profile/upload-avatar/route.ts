import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import fs from "fs";
import path from "path";

interface JwtPayload {
  id: number;
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return NextResponse.json({ success: false, message: "Chưa đăng nhập" });

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload) return NextResponse.json({ success: false, message: "Token không hợp lệ" });

    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    if (!file) return NextResponse.json({ success: false, message: "Chưa chọn file" });

    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const avatarUrl = `/uploads/${file.name}`;

    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Upload thất bại" });
  }
}
