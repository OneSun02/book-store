// src/app/api/checkout/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

type CartItem = {
  id: number;
  quantity: number;
};

type CheckoutPayload = {
  cart?: unknown;
};

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => null);
    const body = raw as CheckoutPayload | null;

    if (!body || !Array.isArray(body.cart)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing cart array" },
        { status: 400 }
      );
    }

    // Sau khi đã kiểm tra Array.isArray, ép kiểu an toàn sang CartItem[]
    const cart = body.cart as unknown as CartItem[];

    for (const item of cart) {
      // validate item shape
      if (
        typeof item?.id !== "number" ||
        typeof item?.quantity !== "number" ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { success: false, error: `Invalid cart item: ${JSON.stringify(item)}` },
          { status: 400 }
        );
      }

      // Lấy tồn kho hiện tại
      const product = (await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, sold: true },
      })) as { quantity: number; sold: number } | null;

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ID ${item.id} not found` },
          { status: 404 }
        );
      }

      if (item.quantity > product.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Sản phẩm ID ${item.id} chỉ còn ${product.quantity} trong kho`,
          },
          { status: 400 }
        );
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // không cast thành any; log nguyên err cho debugging
    console.error("checkout POST error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
