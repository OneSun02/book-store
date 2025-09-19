// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

type JwtPayload = {
  id: number;        
  email?: string;    
  role?: "USER" | "ADMIN";}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) return NextResponse.json({ loggedIn: false });

    const payload = verifyJwt(token) as JwtPayload | null; // ✅ dùng type thay cho any
    if (!payload) return NextResponse.json({ loggedIn: false });

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatarUrl: true,
        birthday: true,
        gender: true,
        bio: true,
        orders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                price: true,
                product: { select: { id: true, name: true, images: true } },
              },
            },
          },
        },
      },
    });

    if (!user) return NextResponse.json({ loggedIn: false });

    const completedOrders = user.orders.filter((o) =>
      ["CONFIRMED", "CANCELED", "RETURNED"].includes(o.status)
    );
    const activeOrders = user.orders.filter((o) =>
      ["PENDING", "DELIVERED", "SHIPPED"].includes(o.status)
    );

    return NextResponse.json({
      loggedIn: true,
      user: {
        ...user,
        activeOrders,
        completedOrders,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ loggedIn: false }, { status: 500 });
  }
}
