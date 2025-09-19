import { PrismaClient } from "@prisma/client";
import ProductList from "@/components/ProductList";
import Fuse from "fuse.js";

const prisma = new PrismaClient();

export default async function SearchPage({
  // Next.js 15: searchParams is a Promise
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // phải await vì Next.js truyền Promise
  const resolvedParams = (await searchParams) ?? {};
  const query = (resolvedParams.q as string | undefined)?.trim() ?? "";

  // Lấy tất cả sản phẩm + images
  const allProducts = await prisma.product.findMany({ include: { images: true } });

  let filteredProducts = allProducts;

  if (query) {
    const fuse = new Fuse(allProducts, {
      keys: ["name", "author", "publisher", "category", "description"],
      threshold: 0.4,
    });
    filteredProducts = fuse.search(query).map((r) => r.item);
  }

  // Lấy danh sách category
  const categoriesData = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = categoriesData.map((c) => c.category || "");

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        Kết quả tìm kiếm: &quot;{query}&quot;
      </h1>
      {filteredProducts.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào.</p>
      ) : (
        <ProductList products={filteredProducts} categories={categories} />
      )}
    </div>
  );
}
