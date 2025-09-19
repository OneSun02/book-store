import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary"; // SDK Cloudinary config sẵn

interface JwtPayload {
  id: number;
  email?: string;
  role?: "USER" | "ADMIN";
}

// Kết quả trả về của Cloudinary upload
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  // có thể thêm các field khác nếu cần
}

export async function PUT(req: Request) {
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

    // Lấy dữ liệu từ FormData
    const formData = await req.formData();
    const name = (formData.get("name") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const address = (formData.get("address") as string) || "";
    const birthdayStr = (formData.get("birthday") as string) || "";
    const gender = (formData.get("gender") as string) || "";
    const bio = (formData.get("bio") as string) || "";
    const avatarFile = formData.get("avatar") as File | null;

    let avatarUrl: string | undefined;

    // Upload avatar lên Cloudinary nếu có
    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

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

      avatarUrl = result.secure_url;
    }

    // Cập nhật người dùng
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: {
        name,
        phone,
        address,
        birthday: birthdayStr ? new Date(birthdayStr) : null,
        gender,
        bio,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        birthday: true,
        gender: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
