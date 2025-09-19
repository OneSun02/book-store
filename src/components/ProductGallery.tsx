"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react"; // icon đẹp

interface ProductGalleryProps {
  images: { url: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 🔒 Khóa scroll khi mở modal
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    let scrollY = 0;

    if (isOpen) {
      scrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
    } else {
      const y = body.style.top;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    }
  }, [isOpen]);


  // Zoom bằng cuộn chuột
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 0.2, 5));
    } else {
      setZoom((z) => Math.max(z - 0.2, 1));
      if (zoom <= 1.2) setPosition({ x: 0, y: 0 });
    }
  };

  // Drag ảnh
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Điều hướng bằng bàn phím
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") setMainIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setMainIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, images.length]);

  return (
    <div className="mb-5">
      {/* Ảnh chính */}
      <div
        className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-md mb-3 overflow-hidden cursor-zoom-in"
        onClick={() => {
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          setIsOpen(true);
        }}
      >
        <img
          src={images[mainIndex]?.url || "/images/default.jpg"}
          alt="Main"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto">
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setMainIndex(i)}
            className={`w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer overflow-hidden transition
              ${i === mainIndex ? "border-2 border-blue-600" : "border border-gray-300"}`}
          >
            <img
              src={img.url}
              alt={`Thumbnail ${i}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-white text-3xl font-bold z-50 hover:scale-110 transition"
          >
            <X size={32} />
          </button>

          {/* Prev */}
          <button
            onClick={() => setMainIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/40 transition z-50"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>

          {/* Next */}
          <button
            onClick={() => setMainIndex((i) => (i + 1) % images.length)}
            className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full hover:bg-white/40 transition z-50"
          >
            <ChevronRight size={32} className="text-white" />
          </button>

          {/* Ảnh hiển thị full screen */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={images[mainIndex]?.url}
              alt="Zoom"
              className="select-none max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              draggable={false}
            />
          </div>

          {/* Thumbnails trong modal */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 
                 flex gap-2 bg-black/40 p-2 rounded-lg 
                 max-w-[90vw] overflow-x-auto scrollbar-none"
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                onClick={() => {
                  setMainIndex(i);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-md cursor-pointer border-2 transition 
            ${i === mainIndex ? "border-blue-500" : "border-transparent opacity-70 hover:opacity-100"}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
