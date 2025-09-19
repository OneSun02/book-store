import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary"; // config sẵn Cloudinary SDK

interface JwtPayload {
  id: number;        
  email?: string;    
  role?: "USER" | "ADMIN";
}

export async function PUT(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return NextResponse.json({ success: false, message: "Chưa đăng nhập" });

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload) return NextResponse.json({ success: false, message: "Token không hợp lệ" });

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const birthday = formData.get("birthday") as string;
    const gender = formData.get("gender") as string;
    const bio = formData.get("bio") as string;
    const avatarFile = formData.get("avatar") as File | null;

    let avatarUrl: string | undefined;

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "avatars" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(buffer);
      });

      avatarUrl = result.secure_url;
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
