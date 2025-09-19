"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@prisma/client";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  ListFilter,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Flame,
  ListOrdered,
} from "lucide-react";

interface ProductListProps {
  products: (Product & { images: { url: string }[] })[];
  categories: string[];
}

// Options cho dropdown sắp xếp
const sortOptions = [
  { value: "default", label: "Mặc định", icon: ListOrdered, color: "text-gray-500" },
  { value: "price-asc", label: "Giá: Thấp → Cao", icon: ArrowUpNarrowWide, color: "text-blue-500" },
  { value: "price-desc", label: "Giá: Cao → Thấp", icon: ArrowDownNarrowWide, color: "text-red-500" },
  { value: "best-seller", label: "Bán chạy nhất", icon: Flame, color: "text-orange-500" },
];

export default function ProductList({ products, categories }: ProductListProps) {
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("default");
  const [openSort, setOpenSort] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // ✅ Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setOpenCategory(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setOpenSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc theo category
  const categoryFiltered = useMemo(() => {
    return currentCategory
      ? products.filter((p) => p.category === currentCategory)
      : products;
  }, [products, currentCategory]);

  // Sắp xếp
  const sortedProducts = useMemo(() => {
    const arr = [...categoryFiltered];
    if (sort === "price-asc") return arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return arr.sort((a, b) => b.price - a.price);
    if (sort === "best-seller") return arr.sort((a, b) => b.sold - a.sold);
    return arr;
  }, [categoryFiltered, sort]);

  // Tính phân trang
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Render số trang
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) pages.push(<span key="start">...</span>);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i
            ? "bg-emerald-700 text-white"
            : "bg-white text-gray-700 hover:bg-emerald-700 hover:text-white"
            }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) pages.push(<span key="end">...</span>);
    return pages;
  };

  const currentSort = sortOptions.find((o) => o.value === sort) || sortOptions[0];

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 relative">
        {/* Category */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenCategory(!openCategory);
              setOpenSort(false);
            }}
            className="flex items-center gap-2 border border-gray-300 rounded-sm px-4 py-2 text-sm 
                 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <ListFilter size={16} className="text-emerald-600" />
            <span>{currentCategory || "Danh mục"}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          {openCategory && (
            <div className="absolute mt-2 w-56 rounded-sm shadow-lg bg-white ring-black ring-opacity-5 z-50">
              <button
                onClick={() => {
                  setCurrentCategory("");
                  setCurrentPage(1);
                  setOpenCategory(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
              >
                <ListFilter size={16} className="text-emerald-600" />
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrentCategory(c);
                    setCurrentPage(1);
                    setOpenCategory(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                >
                  <ListFilter size={16} className="text-emerald-600" />
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenSort(!openSort);
              setOpenCategory(false);
            }}
            className="flex items-center gap-2 border border-gray-300 rounded-sm px-4 py-2 text-sm 
                 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <currentSort.icon size={16} className={currentSort.color} />
            <span>{currentSort.label}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {openSort && (
            <div className="absolute mt-2 w-56 rounded-sm shadow-lg bg-white ring-black ring-opacity-5 z-50">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setCurrentPage(1);
                      setOpenSort(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-100"
                  >
                    <Icon size={16} className={opt.color} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Grid sản phẩm */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {paginatedProducts.map((p) => (
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
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-sm shadow-md text-sm font-medium 
                       transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-emerald-600 hover:text-white"
          >
            <ChevronsLeft size={18} className="text-emerald-700" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-sm shadow-md text-sm font-medium 
                       transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-emerald-600 hover:text-white"
          >
            <ChevronLeft size={18} className="text-emerald-700" />
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm shadow-md text-sm font-medium 
                       transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-emerald-600 hover:text-white"
          >
            <ChevronRight size={18} className="text-emerald-700" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm shadow-md text-sm font-medium 
                       transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-emerald-600 hover:text-white"
          >
            <ChevronsRight size={18} className="text-emerald-700" />
          </button>
        </div>
      )}
    </div>
  );
}
