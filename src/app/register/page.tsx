"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { FaPaperPlane } from "react-icons/fa";
import { HiShieldCheck } from "react-icons/hi";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"inputInfo" | "verifyOtp">("inputInfo");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }), // gửi name luôn để backend biết
      });
      const data = await res.json();

      if (data.success) {
        setToastType("success");
        setToastMessage(data.message);
        setStep("verifyOtp");
      } else {
        setToastType("error");
        setToastMessage(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      setToastType("error");
      setToastMessage("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP + tạo tài khoản
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, otp }),
      });
      const data = await res.json();

      if (data.success) {
        setToastType("success");
        setToastMessage("Đăng ký thành công! Bạn đã có thể đăng nhập.");
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setToastType("error");
        setToastMessage(data.message || "Xác thực thất bại");
      }
    } catch (err) {
      console.error(err);
      setToastType("error");
      setToastMessage("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-teal-100 to-teal-700 p-4">
      {toastMessage && <Toast message={toastMessage} type={toastType} />}

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Đăng ký
        </h2>

        {step === "inputInfo" && (
          <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
            <input
              type="text"
              placeholder="Tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={25}
              title="Phải từ 2 đến 25 ký tự"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
                minLength={8}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye className="w-5 h-5" /> :<EyeOff className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Đang gửi OTP...
                </>
              ) : (
                <>
                  <FaPaperPlane className="h-5 w-5" />
                  Gửi OTP
                </>
              )}
            </button>
          </form>
        )}

        {step === "verifyOtp" && (
          <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-600">Mã OTP đã gửi vào email: {email}</p>
            <input
              type="text"
              placeholder="Nhập OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Đang xác thực...
                </>
              ) : (
                <>
                  <HiShieldCheck className="h-5 w-5" />
                  Xác thực & tạo tài khoản
                </>
              )}
            </button>
          </form>
        )}

        <div className="flex justify-between mt-4 text-sm flex-wrap gap-2">
          <button
            onClick={() => router.push("/login")}
            className="text-black hover:text-emerald-600"
          >
            Đăng nhập
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
