"use client";

import { useState, useEffect } from "react";
import { getCart, clearCart, CartItem } from "@/utils/cart";
import Image from "next/image";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const buyNowProduct = sessionStorage.getItem("buyNowProduct");
    if (buyNowProduct) {
      setCart([JSON.parse(buyNowProduct) as CartItem]);
      sessionStorage.removeItem("buyNowProduct");
    } else {
      const cartData = getCart().filter((p: CartItem) => !!p.selected);
      setCart(cartData);
    }
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return alert("Bạn chưa chọn sản phẩm nào để thanh toán!");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      const data = await response.json();

      if (data.success) {
        clearCart();
        setCart([]);
        setSuccess(true);
      } else {
        alert("Thanh toán thất bại: " + (data.error ?? "Lỗi không xác định"));
      }
    } catch (error) {
      const err = error as unknown;
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert("Có lỗi xảy ra: " + message);
    }
  };

  if (success)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Thanh toán thành công!</h2>
        <p>Cảm ơn bạn, {name}.</p>
      </div>
    );

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto", display: "flex", gap: 40, flexWrap: "wrap" }}>
      {/* Form khách hàng + thẻ */}
      <form
        onSubmit={handleCheckout}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <h2>Thông tin khách hàng</h2>
        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input type="text" placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

        <h2>Thanh toán thẻ</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
          <Image src="/images/icon/visa.png" alt="Visa logo" width={50} height={30} style={{ objectFit: "contain" }} />
          <Image src="/images/icon/mastercard.png" alt="MasterCard logo" width={50} height={30} style={{ objectFit: "contain" }} />
          <Image src="/images/icon/amex.png" alt="American Express logo" width={50} height={30} style={{ objectFit: "contain" }} />
        </div>

        <input type="text" placeholder="Số thẻ" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required style={inputStyle} />
        <div style={{ display: "flex", gap: 10 }}>
          <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
          <input type="text" placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
        </div>

        <button type="submit" style={submitStyle}>
          Thanh toán {total.toLocaleString()}₫
        </button>
      </form>

      {/* Đơn hàng */}
      <div style={{ flex: 1, minWidth: 280, padding: 20, border: "1px solid #ddd", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
        <h2>Đơn hàng</h2>
        {cart.map((p: CartItem) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span>{p.name} x {p.quantity}</span>
            <span>{(p.price * p.quantity).toLocaleString()}₫</span>
          </div>
        ))}
        <hr style={{ margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>Tổng cộng:</span>
          <span>{total.toLocaleString()}₫</span>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box" as const,
};

const submitStyle = {
  padding: "14px 0",
  borderRadius: 8,
  border: "none",
  backgroundColor: "#0070f3",
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background 0.3s",
} as const;
