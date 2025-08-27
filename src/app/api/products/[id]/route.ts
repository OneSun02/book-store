import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

// --- fix TS globalThis ---
declare global {
  var prisma: PrismaClient | undefined;
}

// Tái sử dụng PrismaClient global để tránh tạo nhiều kết nối
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // await params vì params là Promise trong App Router
    const { id: idParam } = await context.params;

    if (!idParam) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const id = Number(idParam);

    // Kiểm tra id hợp lệ (số nguyên dương)
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, quantity: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ stock: product.quantity }, { status: 200 });
  } catch (error) {
    // Tránh typed catch binding; cast to unknown và narrow safely.
    const err = error as unknown;
    let message = "Unknown error";

    if (err instanceof Error) {
      message = err.message;
    } else {
      try {
        message = String(err);
      } catch {
        // giữ default
      }
    }

    console.error("GET /api/products/[id] error:", message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
