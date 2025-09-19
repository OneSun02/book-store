import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import fs from "fs";
import path from "path";

interface JwtPayload {
  id: number;        
  email?: string;    
  role?: "USER" | "ADMIN";
}

export async function PUT(req: Request) {
  try {
    // Lấy token từ cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) return NextResponse.json({ success: false, message: "Chưa đăng nhập" });

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload) return NextResponse.json({ success: false, message: "Token không hợp lệ" });

    // Xử lý FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const birthday = formData.get("birthday") as string;
    const gender = formData.get("gender") as string;
    const bio = formData.get("bio") as string;
    const avatarFile = formData.get("avatar") as File | null;

    // Lưu avatar nếu có
    let avatarUrl: string | undefined;
    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const fileName = `${Date.now()}-${avatarFile.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      avatarUrl = `/uploads/${fileName}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name,
        phone,
        address,
        birthday: birthday ? new Date(birthday) : null,
        gender,
        bio,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
