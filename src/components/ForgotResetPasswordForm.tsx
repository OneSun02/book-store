"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { FaPaperPlane } from "react-icons/fa";
import { HiLockOpen } from "react-icons/hi";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Nếu có email query param, tự set
  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setToast({ message: data.message, type: data.success ? "success" : "error" });
      if (data.success) setStep("reset");
    } catch {
      setToast({ message: "Có lỗi xảy ra, vui lòng thử lại", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      setToast({ message: data.message, type: data.success ? "success" : "error" });
      if (data.success) setTimeout(() => router.push("/login"), 2000);
    } catch {
      setToast({ message: "Có lỗi xảy ra, vui lòng thử lại", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-teal-100 to-green-700 p-4">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {step === "email" ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
        </h1>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Đang gửi OTP..." : <><FaPaperPlane /> Gửi OTP</>}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              readOnly
              className="px-4 py-3 border rounded-lg border-gray-300 bg-gray-100 cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="Nhập OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Đang đặt lại mật khẩu..." : <><HiLockOpen /> Đặt lại mật khẩu</>}
            </button>
          </form>
        )}

        <div className="flex justify-between mt-4 text-sm flex-wrap gap-2">
          <button onClick={() => router.push("/register")} className="text-black hover:text-emerald-600">
            Đăng ký
          </button>
          <button onClick={() => router.push("/login")} className="text-black hover:text-emerald-600">
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
