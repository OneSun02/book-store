"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Home, ShoppingCart, CreditCard, Search } from "lucide-react";
import { getCart } from "@/utils/cart";
import type { CartItem } from "@/utils/cart";

export default function Header() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const linkClass = (path: string) => (pathname === path ? "active" : "");

  useEffect(() => {
    const cart = getCart(); // getCart() trả CartItem[]
    // dùng generic để chỉ rõ kiểu kết quả và cho TS suy luận kiểu phần tử
    const total = cart.reduce<number>((sum, item) => sum + (item.quantity ?? 0), 0);
    setCartCount(total);
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        justifyContent: "space-between",
      }}
    >
      {/* Logo + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div className="logo">
          <Link href="/">
            <Image
              src="/images/logo-nhat-shop.png"
              width={100}
              height={50}
              priority
              alt="Nhat Shop Logo"
            />
          </Link>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "250px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            style={{
              width: "100%",
              padding: "6px 36px 6px 12px",
              borderRadius: "9999px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", gap: "20px", fontSize: "22px", position: "relative" }}>
        <Link href="/" className={linkClass("/")}>
          <Home />
        </Link>

        <div style={{ position: "relative" }}>
          <Link href="/cart" className={linkClass("/cart")}>
            <ShoppingCart />
          </Link>
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                backgroundColor: "red",
                color: "#fff",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {cartCount}
            </span>
          )}
        </div>

        <Link href="/checkout" className={linkClass("/checkout")}>
          <CreditCard />
        </Link>
      </nav>
    </header>
  );
}
