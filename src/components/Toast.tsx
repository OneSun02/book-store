"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import {FiX} from "react-icons/fi";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

export default function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const Icon = type === "error" ? FaTimesCircle : type === "info" ? FaInfoCircle : FaCheckCircle;

  const toastUI = (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-2 rounded-md text-white shadow-lg ${typeClasses[type]} animate-slideIn`}
    >
      <Icon size={18} />
      <span className="text-sm">{message}</span>
      <button onClick={() => setShow(false)} className="ml-2 text-white/80 hover:text-white">
        <FiX size={16} />
      </button>
    </div>
  );

  return createPortal(toastUI, document.body);
}
