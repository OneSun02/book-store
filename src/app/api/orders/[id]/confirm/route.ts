// src/app/api/orders/[id]/return/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);

    // update status + tạo history
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        histories: {
          create: {
            status: "CONFIRMED",
            message: "Người dùng đã xác nhận đơn hàng",
          },
        },
      },
      include: { histories: true },
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Không thể xác nhận đơn hàng" },
      { status: 500 }
    );
  }
}
