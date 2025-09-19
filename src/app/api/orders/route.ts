// src/app/api/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

// ===== Type =====
type JwtPayload = {
  id: number;
  email?: string;
  role?: "USER" | "ADMIN";
};

interface PutOrderBody {
  orderId: number;
  status: "CANCELED" | "RETURNED" | "CONFIRMED";
  message?: string; // thông điệp tuỳ chọn cho lịch sử
}

// ===== Helper xác thực JWT =====
async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token) as JwtPayload;
    return payload.id;
  } catch {
    return null;
  }
}

// ===== PUT: Cập nhật trạng thái đơn hàng =====
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: PutOrderBody = await req.json();
    const { orderId, status, message } = body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Cập nhật trạng thái đơn
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // 2️⃣ Nếu RETURN hoặc CANCEL, hoàn trả tồn kho
      if (status === "RETURNED" || status === "CANCELED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity }, sold: { decrement: item.quantity } },
          });
        }
      }

      // 3️⃣ Lưu lịch sử
      await tx.orderHistory.create({
        data: {
          orderId,
          status,
          message: message || (status === "CANCELED" ? "Khách hủy đơn" :
                               status === "RETURNED" ? "Khách trả hàng" :
                               "Khách xác nhận đơn"),
        },
      });
    });

    return NextResponse.json({ success: true, message: `Đơn hàng đã được cập nhật: ${status}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
