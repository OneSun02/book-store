"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@prisma/client";
import styles from "./ProductList.module.css";

interface ProductListProps {
  products: (Product & { images: { url: string }[] })[];
  categories: string[];
}

export default function ProductList({ products, categories }: ProductListProps) {
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(6); // hiển thị ban đầu 12 sản phẩm
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const filteredProducts = currentCategory
    ? products.filter((p) => p.category === currentCategory)
    : products;

  // Observer để detect khi scroll tới cuối
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 6, filteredProducts.length));
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [filteredProducts]);

  return (
    <div>
      {/* Nút chọn category */}
      <div className={styles.categoryButtons}>
        <button
          className={`${styles.button} ${currentCategory === "" ? styles.active : ""}`}
          onClick={() => {
            setCurrentCategory("");
            setVisibleCount(12);
          }}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`${styles.button} ${currentCategory === c ? styles.active : ""}`}
            onClick={() => {
              setCurrentCategory(c);
              setVisibleCount(12); // reset lại khi đổi category
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid sản phẩm */}
      <div className={styles.productGrid}>
        {filteredProducts.slice(0, visibleCount).map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              price: p.price,
              author: p.author || undefined,
              category: p.category || undefined,
              quantity: p.quantity,
              sold: p.sold,
              images: p.images,
              description: p.description ?? undefined,
            }}
          />
        ))}
      </div>

      {/* Loader ảo để trigger IntersectionObserver */}
      {visibleCount < filteredProducts.length && (
        <div
          ref={loaderRef}
          style={{ height: "40px", margin: "20px 0", textAlign: "center", color: "#888" }}
        >
          Đang tải thêm...
        </div>
      )}
    </div>
  );
}
