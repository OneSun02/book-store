"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
}

export default function Toast({ message, type = "success" }: ToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const bgColor = type === "success" ? "#4CAF50" : "#FF4D4F"; // xanh lá | đỏ

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: bgColor,
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 5,
      }}
    >
      {message}
    </div>
  );
}
