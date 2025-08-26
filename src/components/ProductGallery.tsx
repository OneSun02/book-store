// src/components/ProductGallery.tsx
"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: { url: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [mainIndex, setMainIndex] = useState(0);

  return (
    <div style={{ marginBottom: 20 }}>
      <img
        src={images[mainIndex]?.url || "/images/default.jpg"}
        alt="Main"
        style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 6, marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={`Thumbnail ${i}`}
            onClick={() => setMainIndex(i)}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              border: i === mainIndex ? "2px solid #0070f3" : "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
