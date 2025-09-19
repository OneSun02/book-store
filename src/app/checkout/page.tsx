"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast"; // ✅ import toast

type CartItemDB = {
  id: number;
  quantity: number;
  selected: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    images: { url: string }[];
  };
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItemDB[]>([]);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Load cart chỉ lấy selected = true
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("Không thể lấy giỏ hàng");
        const data: CartItemDB[] = await res.json();

        const selectedItems = data
          .filter((item) => item.selected)
          .map((item) => ({
            ...item,
            quantity: Number(item.quantity) || 1,
            product: {
              ...item.product,
              price: Number(item.product.price) || 0,
              images: item.product.images || [],
            },
          }));

        setCart(selectedItems);
      } catch (err) {
        console.error("Lỗi load cart:", err);
        setToast({ message: "Lỗi tải giỏ hàng", type: "error" });
      }
    };
    loadCart();
  }, []);

  // Prefill thông tin từ DB
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.loggedIn && data.user) {
          setName(data.user.name ?? "");
          setEmail(data.user.email ?? "");
          setAddress(data.user.address ?? "");
        }
      } catch (err) {
        console.error("Không thể lấy thông tin user:", err);
        setToast({ message: "Không thể tải thông tin người dùng", type: "error" });
      }
    };
    loadUser();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) {
      setToast({ message: "Bạn chưa chọn sản phẩm nào để thanh toán!", type: "info" });
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((c) => ({ id: c.product.id, quantity: c.quantity })),
          name,
          address,
          email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCart([]);
        setSuccess(true);
        setToast({ message: "Thanh toán thành công!", type: "success" });
      } else {
        setToast({ message: "Thanh toán thất bại: " + (data.error ?? "Lỗi không xác định"), type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Có lỗi xảy ra, vui lòng thử lại!", type: "error" });
    }
  };

  if (success)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Thanh toán thành công!</h2>
        <p>Cảm ơn bạn, {name}.</p>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-wrap gap-8">
      {/* Form thông tin */}
      <form
        onSubmit={handleCheckout}
        className="flex-1 flex flex-col gap-5 p-6 border border-gray-200 rounded-xl shadow-md bg-white"
      >
        <h2 className="text-xl font-semibold text-emerald-600">Thông tin khách hàng</h2>

        <input
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="text"
          placeholder="Địa chỉ"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition"
        >
          Thanh toán {total.toLocaleString()}₫
        </button>
      </form>

      {/* Đơn hàng */}
      <div className="flex-1 min-w-[280px] p-6 border border-gray-200 rounded-xl shadow-md bg-white">
        <h2 className="text-xl font-semibold text-emerald-600 mb-4">Đơn hàng</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-2 text-gray-700">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span className="font-medium">
              {(item.product.price * item.quantity).toLocaleString()}₫
            </span>
          </div>
        ))}
        <hr className="my-3" />
        <div className="flex justify-between font-bold text-lg text-gray-800">
          <span>Tổng cộng:</span>
          <span>{total.toLocaleString()}₫</span>
        </div>
      </div>

      {/* Hiển thị Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
