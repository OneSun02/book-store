"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";

interface CartItem {
  id: number;
  quantity: number;
  selected: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    quantity: number; // tồn kho
    images: { url: string }[];
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("Không thể lấy giỏ hàng");
      const data: CartItem[] = await res.json();

      setCart((prev) => {
        data.forEach((item) => {
          const oldItem = prev.find((i) => i.id === item.id);
          if (oldItem && item.quantity < oldItem.quantity) {
            showToast(
              `Sản phẩm ${item.product.name} đã giảm còn ${item.quantity} trong kho`,
              "error"
            );
          }
        });
        prev.forEach((oldItem) => {
          if (!data.find((i) => i.id === oldItem.id)) {
            showToast(`Sản phẩm ${oldItem.product.name} đã bị xóa khỏi giỏ hàng`, "error");
          }
        });
        return data;
      });
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải giỏ hàng", "error");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateCartItem = async (cartId: number, data: { quantity?: number; selected?: boolean }) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, ...data }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");

      setCart((prev) => prev.map((item) => (item.id === cartId ? { ...item, ...data } : item)));
      return true;
    } catch (err) {
      console.error(err);
      showToast("Cập nhật thất bại", "error");
      return false;
    }
  };

  const handleRemove = async (cartId: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId }),
      });
      if (!res.ok) throw new Error("Xóa thất bại");

      setCart((prev) => prev.filter((item) => item.id !== cartId));
      showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    } catch (err) {
      console.error(err);
      showToast("Xóa thất bại", "error");
    }
  };

  const total = cart.reduce(
    (sum, p) => (p.selected ? sum + p.product.price * p.quantity : sum),
    0
  );
  const hasInvalidItems = cart.some(
    (p) => p.quantity > p.product.quantity || p.product.quantity === 0
  );

  if (!cart.length) {
    return (
      <div className="p-6 sm:p-10 text-center">
        <h1 className="text-xl sm:text-2xl font-semibold mb-3">Giỏ hàng</h1>
        <p className="text-gray-500 mb-3">Giỏ hàng trống</p>
        <Link href="/" className="text-blue-600 underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">Giỏ hàng của bạn</h1>

      {cart.map((p) => (
        <div
          key={p.id}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-5 p-4 rounded-lg shadow-sm bg-white relative"
        >
 <input
      type="checkbox"
      checked={p.selected}
      disabled={p.product.quantity === 0}
      onChange={(e) => updateCartItem(p.id, { selected: e.target.checked })}
      className="
        w-5 h-5 appearance-none border-2 border-gray-300 rounded-md 
        cursor-pointer transition-colors duration-200
        checked:bg-emerald-500 checked:border-emerald-500
        flex items-center justify-center
        relative
        before:content-[''] before:block
        before:w-2 before:h-4
        before:border-r-2 before:border-b-2 before:border-white
        before:rotate-45
        before:opacity-0 checked:before:opacity-100
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    />

          <img
            src={p.product.images[0]?.url || "/images/default.jpg"}
            alt={p.product.name}
            className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-md"
          />

          <div className="flex-1 w-full">
            <p className="font-semibold text-sm sm:text-base">{p.product.name}</p>
            <p className="text-blue-600 font-bold my-1 text-sm sm:text-base">
              {p.product.price.toLocaleString("vi-VN")}₫
            </p>

            <div className="flex items-center gap-2 text-sm">
              <span>Số lượng:</span>
              <div className="flex items-center rounded-sm overflow-hidden shadow-sm">
                <button
                  type="button"
                  disabled={p.product.quantity === 0 || p.quantity <= 1}
                  onClick={() =>
                    updateCartItem(p.id, { quantity: Math.max(1, p.quantity - 1) })
                  }
                  className="px-3 py-1 font-bold text-gray-700 bg-gray-100 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>

                <input
                  type="number"
                  value={p.quantity}
                  min={1}
                  max={p.product.quantity}
                  disabled={p.product.quantity === 0}
                  onChange={(e) => {
                    let newQty = parseInt(e.target.value) || 1;
                    if (newQty < 1) newQty = 1;
                    if (newQty > p.product.quantity) {
                      showToast(`Số lượng vượt tồn kho (${p.product.quantity})`, "error");
                      newQty = p.product.quantity;
                    }
                    updateCartItem(p.id, { quantity: newQty });
                  }}
                  className="w-14 sm:w-16 px-2 py-1 text-sm text-center outline-none"
                />

                <button
                  type="button"
                  disabled={p.product.quantity === 0 || p.quantity >= p.product.quantity}
                  onClick={() =>
                    updateCartItem(p.id, {
                      quantity: Math.min(p.product.quantity, p.quantity + 1),
                    })
                  }
                  className="px-3 py-1 font-bold text-gray-700 bg-gray-100 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleRemove(p.id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 self-start sm:self-center"
          >
            Xóa
          </button>

          {p.product.quantity === 0 && (
            <span className="absolute top-2 left-14 bg-red-500 text-white px-2 py-0.5 rounded text-xs">
              Hết hàng
            </span>
          )}
        </div>
      ))}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 p-5 rounded-lg bg-emerald-100 text-base sm:text-lg font-semibold gap-3">
        <span>Tổng tiền:</span>
        <span>{total.toLocaleString("vi-VN")}₫</span>
      </div>

      <Link
        href={hasInvalidItems ? "#" : "/checkout"}
        className={`block sm:inline-block mt-5 px-6 py-3 rounded-md font-semibold text-center text-white ${
          hasInvalidItems
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        Thanh toán
      </Link>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
