import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { cart } = await req.json();

    for (const item of cart) {
      // Lấy tồn kho hiện tại
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, sold: true },
      });

      if (!product) {
        return NextResponse.json({ success: false, error: `Product ID ${item.id} not found` }, { status: 404 });
      }

      if (item.quantity > product.quantity) {
        return NextResponse.json({
          success: false,
          error: `Sản phẩm ID ${item.id} chỉ còn ${product.quantity} trong kho`,
        }, { status: 400 });
      }

      // Cập nhật tồn kho và số lượng đã bán
      await prisma.product.update({
        where: { id: item.id },
        data: {
          quantity: { decrement: item.quantity },
          sold: { increment: item.quantity },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
