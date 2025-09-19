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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Danh sách sản phẩm
      </h1>
      <ProductList products={products} categories={categories} />
    </div>
  );
}
