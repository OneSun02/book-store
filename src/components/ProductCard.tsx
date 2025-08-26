"use client";

import Link from "next/link";
import CartActions from "./CartActions";
import styles from "./ProductCard.module.css"; // import module CSS

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    author?: string;
    category?: string;
    quantity: number;
    sold: number;
    images?: { url: string }[];
    description?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      {product.quantity === 0 && <span className={styles.soldOutLabel}>Hết hàng</span>}

      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <img
          src={product.images?.[0]?.url || "/images/default.jpg"}
          alt={product.name}
          className={styles.image}
        />
        <h2 className={styles.title}>{product.name}</h2>
        {product.author && <p className={styles.author}>{product.author}</p>}
        {product.category && <p className={styles.soldInfo}>Thể loại: {product.category}</p>}
        <p className={styles.price}>{product.price.toLocaleString("vi-VN")}₫</p>
        <p className={styles.soldInfo}>
          Còn lại: {product.quantity} | Đã bán: {product.sold}
        </p>
      </Link>

      {/* Nút Add to Cart / Buy Now */}
      <CartActions
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          sold: product.sold,
          images: product.images,
          description: product.description ?? "",
        }}
      />
    </div>
  );
}
