"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import {
  Home,
  ShoppingCart,
  CreditCard,
  Search,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
} from "lucide-react";

type CartItemDB = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: { url: string }[];
  };
};

export default function Header() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (path: string) =>
    pathname === path ? "text-black" : "text-gray-600 hover:text-black";
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await resUser.json();

        setIsLoggedIn(userData.loggedIn);

        if (userData.loggedIn && userData.user?.name) {
          setUserName(userData.user.name);
        }

        if (userData.loggedIn) {
          const resCart = await fetch("/api/cart", { credentials: "include" });
          const data = await resCart.json();
          const cartData: CartItemDB[] = Array.isArray(data)
            ? data
            : data?.cart ?? [];
          const total = cartData.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
          );
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
        setCartCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCart();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(false);
        setCartCount(0);
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-300 relative">
      {/* Logo */}
      <div className="flex items-center">
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

      {/* Search desktop */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex relative items-center w-64"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full px-3 py-1.5 pr-9 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="absolute right-2 text-gray-500 hover:text-black"
        >
          <Search size={20} />
        </button>
      </form>

      {/* Nav desktop */}
      <nav className="hidden md:flex items-center gap-4">
        {/* Home */}
        <div className={`relative group p-2 rounded-full transition-colors duration-200
    ${pathname === "/" ? "bg-emerald-100" : "hover:bg-gray-200"}`}>
          <Link href="/" className="flex items-center justify-center w-8 h-8">
            <Home
              size={20}
              className={`${pathname === "/" ? "text-emerald-600" : "text-gray-600"}`}
            />
          </Link>
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
            Trang chủ
          </span>
        </div>

        {/* Cart */}
        <div className={`relative group p-2 rounded-full transition-colors duration-200
    ${pathname === "/cart" ? "bg-emerald-100" : "hover:bg-gray-200"}`}>
          <Link href="/cart" className="flex items-center justify-center w-8 h-8 relative">
            <ShoppingCart
              size={20}
              className={`${pathname === "/cart" ? "text-emerald-600" : "text-gray-600"}`}
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1.5 text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
            Giỏ hàng
          </span>
        </div>

        {/* Checkout */}
        <div className={`relative group p-2 rounded-full transition-colors duration-200
    ${pathname === "/checkout" ? "bg-emerald-100" : "hover:bg-gray-200"}`}>
          <Link href="/checkout" className="flex items-center justify-center w-8 h-8">
            <CreditCard
              size={20}
              className={`${pathname === "/checkout" ? "text-emerald-600" : "text-gray-600"}`}
            />
          </Link>
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
            Thanh toán
          </span>
        </div>

        {/* Profile / Login */}
        {!isLoading && (
          <>
            {isLoggedIn ? (
              <>
                <div className={`relative group p-2 rounded-full transition-colors duration-200
            ${pathname === "/profile" ? "bg-emerald-100" : "hover:bg-gray-200"}`}>
                  <Link href="/profile" className="flex items-center justify-center w-8 h-8">
                    <User
                      size={20}
                      className={`${pathname === "/profile" ? "text-emerald-600" : "text-gray-600"}`}
                    />
                  </Link>
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                    {userName || "Hồ sơ của bạn"}
                  </span>
                </div>

                <div className={`relative group p-2 rounded-full transition-colors duration-200 hover:bg-gray-200`}>
                  <button
                    onClick={() => setShowConfirmLogout(true)}
                    className="flex items-center justify-center w-8 h-8"
                  >
                    <LogOut size={20} className="text-gray-600" />
                  </button>
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                    Đăng xuất
                  </span>
                </div>
              </>
            ) : (
              <div className={`relative group p-2 rounded-full transition-colors duration-200
          ${pathname === "/login" ? "bg-emerald-100" : "hover:bg-gray-200"}`}>
                <Link href="/login" className="flex items-center justify-center w-8 h-8">
                  <LogIn
                    size={20}
                    className={`${pathname === "/login" ? "text-emerald-600" : "text-gray-600"}`}
                  />
                </Link>
                <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                  Đăng nhập
                </span>
              </div>
            )}
          </>
        )}
      </nav>



      {/* Mobile: Hamburger */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-4 p-4 md:hidden z-50">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center relative w-full"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-1.5 pr-9 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 text-gray-500 hover:text-black"
            >
              <Search size={20} />
            </button>
          </form>

          {/* Menu items với icon */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-md transition ${pathname === "/" ? "bg-emerald-100" : "hover:bg-emerald-100"
              }`}
          >
            <Home size={20} /> Trang chủ
          </Link>

          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-md transition ${pathname === "/cart" ? "bg-emerald-100" : "hover:bg-emerald-100"
              }`}
          >
            <ShoppingCart size={20} /> Giỏ hàng ({cartCount})
          </Link>

          <Link
            href="/checkout"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-md transition ${pathname === "/checkout" ? "bg-emerald-100" : "hover:bg-emerald-100"
              }`}
          >
            <CreditCard size={20} /> Thanh toán
          </Link>

          {!isLoading &&
            (isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-md transition ${pathname === "/profile" ? "bg-emerald-100" : "hover:bg-emerald-100"
                    }`}
                >
                  <User size={20} /> {userName || "Profile"}
                </Link>

<button
  onClick={() => setShowConfirmLogout(true)}
  className="flex items-center gap-2 p-2 rounded-md text-left hover:bg-emerald-100 transition"
>
  <LogOut size={20} /> Đăng xuất
</button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 p-2 rounded-md transition ${pathname === "/login" ? "bg-emerald-100" : "hover:bg-emerald-100"
                  }`}
              >
                <LogIn size={20} /> Đăng nhập
              </Link>
            ))}

        </div>
      )}
      <ConfirmModal
        visible={showConfirmLogout}
        message="Bạn có chắc muốn đăng xuất?"
        onConfirm={() => {
          handleLogout();
          setShowConfirmLogout(false);
        }}
        onCancel={() => setShowConfirmLogout(false)}
      />
    </header>
  );

}