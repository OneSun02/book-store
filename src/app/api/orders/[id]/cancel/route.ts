// src/app/api/orders/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity }, sold: { decrement: item.quantity } },
        });
      }

      await tx.orderHistory.create({
        data: { orderId, status: "CANCELED", message: "Khách hủy đơn hàng" },
      });
    });

    return NextResponse.json({ success: true, message: "Đơn hàng đã hủy" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
