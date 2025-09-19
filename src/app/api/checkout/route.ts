import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

const prisma = new PrismaClient();

type CheckoutPayload = {
  name?: string;
  address?: string;
  email?: string;
};

export async function POST(req: Request) {
  try {
    // ✅ Lấy token từ cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Định nghĩa type payload JWT
    interface JwtPayload {
      id: number;
    }

    // Thay thế `any` bằng JwtPayload
    let payload: JwtPayload;
    try {
      payload = verifyJwt(token) as JwtPayload;
    } catch {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CheckoutPayload;

    // ✅ Lấy cart selected của user
    const cart = await prisma.cart.findMany({
      where: { userId: payload.id, selected: true },
      include: { product: true },
    });

    if (!cart.length) {
      return NextResponse.json({ success: false, error: "Không có sản phẩm để thanh toán" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Tạo order trước
      const newOrder = await tx.order.create({
        data: {
          userId: payload.id,
          name: body.name ?? "",
          address: body.address ?? "",
          email: body.email ?? "",
          total: cart.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
        },
      });

      // Cập nhật tồn kho & tạo order items
      for (const item of cart) {
        if (item.quantity <= 0) throw new Error(`Sản phẩm ID ${item.productId} số lượng không hợp lệ`);

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { quantity: true, sold: true, price: true, name: true },
        });

        if (!product) throw new Error(`Sản phẩm ID ${item.productId} không tồn tại`);
        if (item.quantity > product.quantity)
          throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.quantity} trong kho`);

        // Cập nhật product
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity }, sold: { increment: item.quantity } },
        });

        // Tạo OrderItem
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price, // giá tại thời điểm mua
          },
        });
      }

      // Xóa cart đã thanh toán
      await tx.cart.deleteMany({ where: { userId: payload.id, selected: true } });
    });


    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("checkout POST error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
