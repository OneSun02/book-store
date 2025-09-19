"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "./Toast";
import { FiShoppingCart, FiZap } from "react-icons/fi";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number; // tồn kho
  images: { url: string }[];
  description?: string;
  sold?: number;
}
interface CartActionsProps {
  product: Product;
}
export default function CartActions({ product }: CartActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [inCart, setInCart] = useState(0);
  const router = useRouter();

  // --- Hiển thị toast ---
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 1500);
  };

  // --- Lấy số lượng sản phẩm trong giỏ ---
  const fetchCartQuantity = async () => {
    try {
      const res = await fetch(`/api/cart?productId=${product.id}`, {
        credentials: "include",
      });
      if (!res.ok) return setInCart(0);
      const data = await res.json();
      setInCart(data?.quantity || 0);
    } catch {
      setInCart(0);
    }
  };

  useEffect(() => {
    fetchCartQuantity();
  }, [product.id]);

  // --- Thêm vào giỏ / Mua ngay ---
  const addToCartApi = async (qty: number, selected: boolean) => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          selected,
        }),
      });

      if (res.ok) {
        showToast(selected ? "Mua ngay thành công!" : "Đã thêm vào giỏ hàng!");
        fetchCartQuantity();
        return true;
      } else if (res.status === 401) {
        showToast("Vui lòng đăng nhập để mua hàng", "error");
        router.push("/login");
        return false;
      } else {
        const data = await res.json();
        showToast(data?.error || "Lỗi thêm giỏ hàng", "error");
        return false;
      }
    } catch {
      showToast("Có lỗi xảy ra", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- Tồn kho khả dụng ---
  const maxAvailable = Math.max(product.quantity - inCart, 0);

  const handleAddToCart = async () => {
    if (maxAvailable <= 0) return showToast("Sản phẩm hết hàng", "error");
    const qty = Math.min(quantity, maxAvailable);
    await addToCartApi(qty, false);
  };

  const handleBuyNow = async () => {
    if (maxAvailable <= 0) return showToast("Sản phẩm hết hàng", "error");
    const qty = Math.min(quantity, maxAvailable);
    const success = await addToCartApi(qty, true);
    if (success) router.push("/checkout");
  };

  const isDisabled = loading || maxAvailable <= 0;

  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 ">
      {/* Input số lượng với nút - và + */}
      <div className="flex items-center rounded-sm overflow-hidden shadow-sm">
        <button
          type="button"
          disabled={isDisabled || quantity <= 1}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-1 font-bold text-gray-700 bg-gray-100 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>

        <input
          type="number"
          value={quantity}
          min={1}
          max={Math.max(maxAvailable, 1)}
          step={1}
          onChange={(e) => {
            let val = parseInt(e.target.value, 10) || 1;
            val = Math.max(1, Math.min(val, maxAvailable));
            setQuantity(val);
          }}
          disabled={isDisabled}
          className="w-16 px-2 py-1 text-sm text-center outline-none"
        />

        <button
          type="button"
          disabled={isDisabled || quantity >= maxAvailable}
          onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
          className="px-3 py-1 font-bold text-gray-700 bg-gray-100 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +</button>
      </div>
      {/* Nút */}
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`flex items-center justify-center px-2 py-1.5 rounded-sm font-medium text-white transition w-full sm:w-auto text-sm
            ${isDisabled
              ? "bg-gray-300 cursor-not-allowed text-gray-700"
              : "px-4 py-2 bg-sky-500 text-white rounded shadow transition-all duration-300 hover:bg-sky-400 hover:shadow-md hover:translate-y-[-2px] active:scale-95"
            }`}
        >
          <FiShoppingCart className="mr-1 text-base" />
          Giỏ hàng
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isDisabled}
          className={`flex items-center justify-center px-2 py-1.5 rounded-sm font-medium text-white transition w-full sm:w-auto text-sm
            ${isDisabled
              ? "bg-gray-300 cursor-not-allowed text-gray-700"
              : "px-4 py-2 bg-emerald-500 text-white rounded shadow transition-all duration-300 hover:bg-emerald-400 hover:shadow-md hover:translate-y-[-2px] active:scale-95"
            }`}
        >
          <FiZap className="mr-1 text-base" />
          Mua ngay
        </button>
      </div>

      {toastMessage && <Toast message={toastMessage} type={toastType} />}
    </div>
  );
}
