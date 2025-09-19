import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary";

interface JwtPayload { 
  id: number;
}

// interface cho kết quả trả về của Cloudinary
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function POST(req: Request) {
  try {
    // Lấy token từ cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
    }

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload) {
      return NextResponse.json({ success: false, message: "Token không hợp lệ" }, { status: 401 });
    }

    // Lấy file từ FormData
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, message: "Chưa chọn file" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload lên Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    const avatarUrl = result.secure_url;

    // Cập nhật user
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Upload thất bại" }, { status: 500 });
  }
}
