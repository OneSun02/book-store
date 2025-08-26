// src/app/product/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import ProductGallery from "@/components/ProductGallery";
import CartActions from "@/components/CartActions";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: { images: true },
  });

  if (!product) {
    return <p style={{ padding: 20 }}>Sản phẩm không tồn tại</p>;
  }

  // Lấy các sản phẩm cùng category (khác sản phẩm hiện tại)
  const related = await prisma.product.findMany({
    where: { category: product.category, NOT: { id: product.id } },
    take: 4,
    include: { images: true },
  });

  // Lấy thêm vài sản phẩm khác ngẫu nhiên
  const others = await prisma.product.findMany({
    where: { NOT: { id: product.id }, category: { not: product.category } },
    take: 4,
    include: { images: true },
  });

  // Nối lại: related trước, others sau
  const combinedProducts = [...related, ...others];

  return (
    <div style={{ padding: "20px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Thông tin chính */}
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        {/* Gallery */}
        <div style={{ flex: 1, minWidth: 320, position: "relative" }}>
          {product.quantity === 0 && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "red",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                zIndex: 10,
              }}
            >
              Hết hàng
            </span>
          )}
          <ProductGallery images={product.images} />
        </div>

        {/* Chi tiết sản phẩm */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
            {product.name}
          </h1>

          <p><strong>Tác giả:</strong> {product.author}</p>
          <p><strong>Nhà xuất bản:</strong> {product.publisher}</p>
          <p><strong>Thể loại:</strong> {product.category}</p>
          {product.language && <p><strong>Ngôn ngữ:</strong> {product.language}</p>}
          {product.publishedYear && <p><strong>Năm xuất bản:</strong> {product.publishedYear}</p>}
          {product.pages && <p><strong>Số trang:</strong> {product.pages}</p>}

          <p style={{ fontSize: 24, fontWeight: 700, color: "#0070f3", margin: "20px 0" }}>
            {product.price.toLocaleString("vi-VN")}₫
          </p>

          <p style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
            Còn lại: <strong>{product.quantity}</strong> | Đã bán: <strong>{product.sold}</strong>
          </p>

          <CartActions product={{ ...product, description: product.description ?? undefined }} />
        </div>
      </div>

      {/* Mô tả */}
      {product.description && (
        <div style={{ marginTop: 40 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 10,
              borderBottom: "2px solid #0070f3",
              display: "inline-block",
              paddingBottom: 5,
            }}
          >
            Mô tả sản phẩm
          </h2>
          <p style={{ marginTop: 10, lineHeight: 1.6, color: "#333" }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Tất cả sản phẩm khác */}
      {combinedProducts.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 25,
              borderBottom: "2px solid #0070f3",
              display: "inline-block",
              paddingBottom: 5,
            }}
          >
            Các sản phẩm khác
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {combinedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
