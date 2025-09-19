// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

// ===== Type =====
type JwtPayload = {
  id: number;        
  email?: string;    
  role?: "USER" | "ADMIN";}

interface PostCartBody {
  productId: number;
  quantity: number;
  selected?: boolean;
}

interface PutCartBody {
  cartId: number;
  quantity: number;
  selected?: boolean;
}

interface DeleteCartBody {
  cartId: number;
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

// ===== GET: Lấy giỏ hàng hoặc số lượng sản phẩm cụ thể =====
export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json([], { status: 200 });

    const url = new URL(req.url);
    const productIdParam = url.searchParams.get("productId");

    if (productIdParam) {
      const productId = Number(productIdParam);
      const cartItem = await prisma.cart.findFirst({ where: { userId, productId } });
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { quantity: true },
      });

      if (!cartItem || !product || product.quantity <= 0) {
        if (cartItem) await prisma.cart.delete({ where: { id: cartItem.id } });
        return NextResponse.json({ quantity: 0 });
      }

      const actualQuantity = Math.min(cartItem.quantity, product.quantity);
      return NextResponse.json({ quantity: actualQuantity });
    }

    const cart = await prisma.cart.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
    });

    const cartWithLimitedQuantity = await Promise.all(
      cart.map(async (item) => {
        if (item.product.quantity <= 0) {
          await prisma.cart.delete({ where: { id: item.id } });
          return null;
        }
        return {
          ...item,
          quantity: Math.min(item.quantity, item.product.quantity),
          selected: item.selected,
        };
      })
    );

    const filteredCart = cartWithLimitedQuantity.filter(
      (item): item is typeof cartWithLimitedQuantity[0] => item !== null
    );

    return NextResponse.json(filteredCart);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

// ===== POST: Thêm sản phẩm vào giỏ =====
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: PostCartBody = await req.json();
    const { productId, quantity, selected } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    });
    if (!product)
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });

    const existing = await prisma.cart.findFirst({ where: { userId, productId } });
    const newQuantity = (existing?.quantity || 0) + quantity;

    if (newQuantity > product.quantity)
      return NextResponse.json(
        { error: `Số lượng vượt quá hàng tồn kho (${product.quantity})` },
        { status: 400 }
      );

    if (existing) {
      await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQuantity, selected },
      });
    } else {
      await prisma.cart.create({
        data: { userId, productId, quantity, selected },
      });
    }

    return NextResponse.json({ message: "Thành công" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ===== PUT: Cập nhật số lượng / selected =====
export async function PUT(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: PutCartBody = await req.json();
    const { cartId, quantity, selected } = body;

    const cartItem = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cartItem || cartItem.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId },
      select: { quantity: true },
    });
    if (!product)
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });

    if (quantity > product.quantity)
      return NextResponse.json(
        { error: `Chỉ còn ${product.quantity} sản phẩm trong kho` },
        { status: 400 }
      );

    const updated = await prisma.cart.update({
      where: { id: cartId },
      data: { quantity, selected },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ===== DELETE: Xóa sản phẩm khỏi giỏ =====
export async function DELETE(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: DeleteCartBody = await req.json();
    const { cartId } = body;

    const cartItem = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cartItem || cartItem.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.cart.delete({ where: { id: cartId } });
    return NextResponse.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
