// src/app/product/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import ProductGallery from "@/components/ProductGallery";
import CartActions from "@/components/CartActions";
import ProductCard from "@/components/ProductCard";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return <p className="p-5">Thiếu ID sản phẩm</p>;
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
    include: { images: true },
  });

  if (!product) {
    return <p className="p-5">Sản phẩm không tồn tại</p>;
  }

  const related = await prisma.product.findMany({
    where: { category: product.category, NOT: { id: product.id } },
    take: 4,
    include: { images: true },
  });

  const others = await prisma.product.findMany({
    where: { NOT: { id: product.id }, category: { not: product.category } },
    take: 4,
    include: { images: true },
  });

  const combinedProducts = [...related, ...others];

  return (
    <div className="px-5 md:px-10 max-w-[1200px] mx-auto py-6">
      {/* Thông tin chính */}
      <div className="flex flex-wrap gap-10">
        {/* Gallery */}
        <div className="flex-1 min-w-[320px] relative">
          {product.quantity === 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold z-10">
              Hết hàng
            </span>
          )}
          <ProductGallery images={product.images} />
        </div>

        {/* Chi tiết sản phẩm */}
        <div className="flex-1 min-w-[320px]">
          <h1 className="text-3xl font-bold mb-5">{product.name}</h1>

          <p>
            <strong>Tác giả:</strong> {product.author ?? "—"}
          </p>
          <p>
            <strong>Nhà xuất bản:</strong> {product.publisher ?? "—"}
          </p>
          <p>
            <strong>Thể loại:</strong> {product.category ?? "—"}
          </p>
          {product.language && (
            <p>
              <strong>Ngôn ngữ:</strong> {product.language}
            </p>
          )}
          {product.publishedYear && (
            <p>
              <strong>Năm xuất bản:</strong> {product.publishedYear}
            </p>
          )}
          {product.pages && (
            <p>
              <strong>Số trang:</strong> {product.pages}
            </p>
          )}

          <p className="text-2xl font-bold text-emerald-600 my-5">
            {product.price.toLocaleString("vi-VN")}₫
          </p>

          <p className="text-sm text-gray-600 mb-5">
            Còn lại: <strong>{product.quantity}</strong> | Đã bán:{" "}
            <strong>{product.sold}</strong>
          </p>

          <CartActions
            product={{
              ...product,
              description: product.description ?? undefined,
            }}
          />
        </div>
      </div>

      {/* Mô tả */}
      {product.description && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3 border-b-2 border-blue-600 inline-block pb-1">
            Mô tả sản phẩm
          </h2>
          <p className="mt-3 leading-relaxed text-gray-800">
            {product.description}
          </p>
        </div>
      )}

      {/* Các sản phẩm khác */}
      {combinedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold mb-6 border-b-2 border-blue-600 inline-block pb-1">
            Các sản phẩm khác
          </h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {combinedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  author: p.author ?? undefined,
                  category: p.category ?? undefined,
                  quantity: p.quantity,
                  sold: p.sold,
                  images: p.images?.map((img) => ({ url: img.url })) ?? [],
                  description: p.description ?? undefined,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
