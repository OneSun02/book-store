import { PrismaClient } from "@prisma/client";
import ProductList from "@/components/ProductList";
import Fuse from "fuse.js";

const prisma = new PrismaClient();

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q || "").trim();

  // Lấy tất cả sản phẩm + images
  const allProducts = await prisma.product.findMany({ include: { images: true } });

  let filteredProducts = allProducts;

  if (query) {
    // Fuse.js match tên, tác giả, publisher, category, description
    const fuse = new Fuse(allProducts, {
      keys: ["name", "author", "publisher", "category", "description"],
      threshold: 0.4, // fuzzy search
    });
    filteredProducts = fuse.search(query).map(r => r.item);
  }

  // Lấy danh sách category
  const categoriesData = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = categoriesData.map(c => c.category || "");

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Kết quả tìm kiếm: "{query}"</h1>
      {filteredProducts.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào.</p>
      ) : (
        <ProductList products={filteredProducts} categories={categories} />
      )}
    </div>
  );
}
