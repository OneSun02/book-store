"use client";

import Link from "next/link";
import CartActions from "./CartActions";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    author?: string;
    category?: string;
    quantity: number;
    sold?: number;
    images?: { url: string }[];
    description?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="relative flex flex-col justify-between w-full p-2 
            bg-white rounded-xl shadow-lg 
            hover:-translate-y-1 transition-transform duration-300">
      {/* Label Hết hàng */}
      {product.quantity === 0 && (
        <span className="absolute top-0 left-0 z-1 bg-red-500 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold">
          Hết hàng
        </span>
      )}

      <Link
        href={`/product/${product.id}`}
        className="text-inherit no-underline"
      >
        <img
          src={product.images?.[0]?.url || "/images/default.jpg"}
          alt={product.name}
          className="w-full h-40 object-cover rounded-sm mb-2"
        />
        <h2 className="text-base font-bold text-left mb-1">{product.name}</h2>
        {product.author && (
          <p className="text-xs font-sans text-black text-left mb-0.5">{product.author}</p>
        )}
        {product.category && (
          <p className="text-xs font-sans text-gray-600 text-left mb-1">
            Thể loại: {product.category}
          </p>
        )}
        <p className="text-lg text-emerald-700 text-left mb-1">
          {product.price.toLocaleString("vi-VN")}₫
        </p>
        <p className="text-xs font-sans text-gray-600 text-left mb-2">
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
          images:
            product.images?.map((img, i) => ({
              id: i,
              url: img.url,
              productId: product.id,
            })) ?? [],
        }}
      />
    </div>
  );
}
