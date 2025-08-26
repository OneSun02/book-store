"use client";

import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart } from "@/utils/cart";
import Link from "next/link";
import Toast from "@/components/Toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
  selected: boolean;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const loadCart = async () => {
      const cartData = getCart();

      const updatedCart = await Promise.all(
        cartData.map(async (item: CartItem) => {
          const fallbackItem = {
            id: item.id,
            name: item.name ?? "Không xác định",
            price: item.price ?? 0,
            image: item.image ?? "/images/default.jpg",
            quantity: item.quantity ?? 1,
            maxQuantity: item.maxQuantity ?? (item.quantity ?? 1),
            selected: item.selected ?? true,
          };

          try {
            const res = await fetch(`/api/products/${item.id}`);
            const data = await res.json();
            const maxQty = data?.stock ?? fallbackItem.maxQuantity;

            let qty = fallbackItem.quantity;
            if (qty > maxQty) {
              qty = maxQty;
              showToast(
                `Số lượng "${fallbackItem.name}" đã được giảm xuống ${maxQty} do tồn kho thay đổi`,
                "error"
              );
            }

            return { ...fallbackItem, quantity: qty, maxQuantity: maxQty };
          } catch (error) {
            console.error("Lỗi fetch tồn kho:", error);
            return fallbackItem;
          }
        })
      );

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    loadCart();
  }, []);

  const handleSelect = (id: number, value: boolean) => {
    const updated = cart.map((p) => (p.id === id ? { ...p, selected: value } : p));
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleQuantityChange = (id: number, newQty: number) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          let qty = newQty;
          if (qty < 1) qty = 1;
          if (qty > p.maxQuantity) {
            qty = p.maxQuantity;
            showToast(`Số lượng "${p.name}" vượt tồn kho (${p.maxQuantity})`, "error");
          }
          updateQuantity(id, qty, p.maxQuantity);
          return { ...p, quantity: qty };
        }
        return p;
      })
    );
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
    setCart((prev) => prev.filter((p) => p.id !== id));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
  };

  const total = cart.reduce((sum, p) => (p.selected ? sum + (p.price ?? 0) * p.quantity : sum), 0);
  const hasInvalidItems = cart.some((p) => p.quantity > p.maxQuantity || p.maxQuantity === 0);

  if (!cart.length) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng trống</p>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 30 }}>Giỏ hàng của bạn</h1>

      {cart.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 20,
            padding: 15,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          <input
            type="checkbox"
            checked={p.selected}
            onChange={(e) => handleSelect(p.id, e.target.checked)}
            disabled={p.maxQuantity === 0}
          />

          <img
            src={p.image || "/images/default.jpg"}
            alt={p.name}
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{p.name ?? "Không xác định"}</p>
            <p style={{ margin: "5px 0", color: "#0070f3", fontWeight: "bold" }}>
              {(p.price ?? 0).toLocaleString("vi-VN")}₫
            </p>

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              Số lượng:{" "}
              <input
                type="number"
                value={p.quantity}
                min={1}
                max={p.maxQuantity}
                style={{ width: 60, padding: 5, borderRadius: 4, border: "1px solid #ccc" }}
                disabled={p.maxQuantity === 0}
                onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value))}
              />
            </label>
          </div>

          <button
            onClick={() => handleRemove(p.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#d9363e")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#ff4d4f")}
          >
            Xóa
          </button>

          {p.maxQuantity === 0 && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 50,
                backgroundColor: "red",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              Hết hàng
            </span>
          )}
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 30,
          padding: 20,
          borderRadius: 10,
          backgroundColor: "#f9f9f9",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        <span>Tổng tiền:</span>
        <span>{total.toLocaleString("vi-VN")}₫</span>
      </div>

      <Link
        href={hasInvalidItems ? "#" : "/checkout"}
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "12px 25px",
          backgroundColor: hasInvalidItems ? "#ccc" : "#0070f3",
          color: "#fff",
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: "none",
          pointerEvents: hasInvalidItems ? "none" : "auto",
          transition: "background 0.3s",
        }}
        onMouseEnter={(e) => !hasInvalidItems && ((e.target as HTMLAnchorElement).style.backgroundColor = "#005bb5")}
        onMouseLeave={(e) => !hasInvalidItems && ((e.target as HTMLAnchorElement).style.backgroundColor = "#0070f3")}
      >
        Thanh toán
      </Link>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
