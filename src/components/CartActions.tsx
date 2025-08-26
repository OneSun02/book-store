"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addToCartWithQuantity, getCart } from "@/utils/cart";
import Toast from "./Toast";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import styles from "./CartActions.module.css";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number; // tồn kho
  sold: number;
  images?: { url: string }[];
  description?: string;
}

interface CartActionsProps {
  product: Product;
}

export default function CartActions({ product }: CartActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [remaining, setRemaining] = useState(product.quantity);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const router = useRouter();

  useEffect(() => {
    const cart = getCart();
    const itemInCart = cart.find((p: any) => p.id === product.id);
    const newRemaining = product.quantity - (itemInCart?.quantity || 0);
    setRemaining(newRemaining);
    if (quantity > newRemaining) setQuantity(newRemaining > 0 ? newRemaining : 1);
  }, [product.id, product.quantity]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = () => {
    if (remaining <= 0) return;
    addToCartWithQuantity(product, quantity, product.quantity, false);
    showToast("Đã thêm vào giỏ hàng!");
    router.push("/cart");
  };

  const handleBuyNow = () => {
    if (remaining <= 0) return;
    addToCartWithQuantity(product, quantity, product.quantity, true);
    router.push("/checkout");
  };

  return (
    <div className={styles.cartContainer}>
      {remaining > 0 && (
        <label className={styles.quantityLabel}>
          Số lượng:
          <input
            type="number"
            value={quantity}
            min={1}
            max={remaining}
            onChange={(e) => {
              let val = parseInt(e.target.value);
              if (isNaN(val)) val = 1;
              if (val > remaining) val = remaining;
              if (val < 1) val = 1;
              setQuantity(val);
            }}
          />
        </label>
      )}

      <div className={styles.buttonGroup}>
        <button
          className={styles.addToCart}
          onClick={handleAddToCart}
          disabled={remaining <= 0}
        >
          <FiShoppingCart style={{ marginRight: "8px" }} />
          Giỏ hàng
        </button>

        <button
          className={styles.buyNow}
          onClick={handleBuyNow}
          disabled={remaining <= 0}
        >
          <FiZap style={{ marginRight: "6px" }} />
          Mua ngay
        </button>
      </div>
    </div>

  );
}
