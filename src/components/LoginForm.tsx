"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { FaSignInAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const messageFromQuery = searchParams.get("message");
    if (messageFromQuery) setToastMessage(messageFromQuery);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setToastMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        setToastMessage(data.message || "Đăng nhập thất bại");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
      setError("Đã có lỗi xảy ra");
      setToastMessage("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-teal-100 to-emerald-700 p-4">
      {toastMessage && <Toast message={toastMessage} type="error" />}
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Đăng nhập
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <FaSignInAlt className="h-5 w-5" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm flex-wrap gap-2">
          <button
            onClick={() => router.push("/register")}
            className="text-black hover:text-emerald-600"
          >
            Đăng ký
          </button>
          <button
            onClick={() => router.push("/forgotpassword")}
            className="text-black hover:text-emerald-600"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>
    </div>
  );
}
