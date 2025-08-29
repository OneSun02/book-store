import { PrismaClient } from "@prisma/client";
import ProductList from "@/components/ProductList";

const prisma = new PrismaClient();

// Force HomePage luôn dynamic, fetch data mỗi lần request
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({ include: { images: true } });
  const categoriesData = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = categoriesData.map((c) => c.category || "");

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Danh sách sản phẩm</h1>
      <ProductList products={products} categories={categories} />
    </div>
  );
}
