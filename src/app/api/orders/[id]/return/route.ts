import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" });

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Cập nhật trạng thái đơn
      await tx.order.update({
        where: { id: orderId },
        data: { status: "RETURNED" },
      });

      // 2️⃣ Hoàn trả tồn kho
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity }, sold: { decrement: item.quantity } },
        });
      }

      // 3️⃣ Lưu lịch sử
      await tx.orderHistory.create({
        data: {
          orderId,
          status: "RETURNED",
          message: "Khách yêu cầu trả hàng",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Đơn hàng đã được trả" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
