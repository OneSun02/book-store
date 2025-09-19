"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FaPen, FaCamera, FaMars, FaVenus, FaGenderless } from "react-icons/fa";

// -------------------- Types --------------------
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  bio?: string;
  avatarUrl?: string;
  activeOrders?: Order[];
  completedOrders?: Order[];
}

interface FormDataType {
  name: string;
  phone: string;
  address: string;
  birthday: string;
  gender: string;
  bio: string;
  avatarUrl?: string;
  avatarFile?: File;
}

interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    images?: { url: string }[];
  };
}

type ConfirmAction = 'cancel' | 'confirm' | 'return';

enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  RETURNED = "RETURNED",
}

// -------------------- Main Page --------------------
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormDataType>({
    name: "",
    phone: "",
    address: "",
    birthday: "",
    gender: "",
    bio: "",
  });
  const [originalForm, setOriginalForm] = useState<FormDataType>({ ...form });
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; orderId?: number; action?: ConfirmAction }>({ visible: false });

  const genderMap: Record<string, { label: string; icon: React.ReactNode }> = {
    male: { label: "Nam", icon: <FaMars className="inline mr-1 text-blue-500" /> },
    female: { label: "Nữ", icon: <FaVenus className="inline mr-1 text-pink-500" /> },
    other: { label: "Khác", icon: <FaGenderless className="inline mr-1 text-gray-500" /> },
    "": { label: "Chưa cập nhật", icon: <FaGenderless className="inline mr-1 text-gray-400" /> },
  };

  // -------------------- Fetch user --------------------
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          birthday: data.user.birthday ? data.user.birthday.split("T")[0] : "",
          gender: data.user.gender || "",
          bio: data.user.bio || "",
          avatarUrl: data.user.avatarUrl || "",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Lỗi tải dữ liệu người dùng", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Form handlers --------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setForm({ ...form, avatarFile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleStartEdit = () => { setOriginalForm({ ...form }); setEditing(true); };
  const handleCancelEdit = () => { setForm({ ...originalForm }); setPreview(null); setEditing(false); };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        const k = key as keyof FormDataType; // ép kiểu key
        if (k === "avatarFile" && form.avatarFile) formData.append("avatar", form.avatarFile);
        else formData.append(k, form[k] as string); // ép kiểu value thành string
      });
      const res = await fetch("/api/profile/update", { method: "PUT", body: formData });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "Cập nhật thành công!", type: "success" });
        window.location.reload();
      } else setToast({ message: data.message || "Cập nhật thất bại", type: "error" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Lỗi kết nối server", type: "error" });
    }
  };

const handleUpdateOrderStatus = async (orderId: number, action: 'cancel' | 'confirm' | 'return') => {
  const status = action === 'cancel' ? 'CANCELED' :
                 action === 'return' ? 'RETURNED' : 'CONFIRMED';

  try {
    const res = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });
    const data = await res.json();
    if (data.success) fetchUser();
    else setToast({ message: data.message || 'Cập nhật thất bại', type: 'error' });
  } catch (err) {
    console.error(err);
    setToast({ message: 'Lỗi kết nối server', type: 'error' });
  }
};


const handleCancel = (orderId: number) => handleUpdateOrderStatus(orderId, 'cancel');
const handleConfirm = (orderId: number) => handleUpdateOrderStatus(orderId, 'confirm');
const handleReturn = (orderId: number) => handleUpdateOrderStatus(orderId, 'return');


  const showConfirm = (orderId: number, action: ConfirmAction) => setConfirmModal({ visible: true, orderId, action });
  const handleConfirmAction = async () => {
    if (!confirmModal.orderId || !confirmModal.action) return;
    const { orderId, action } = confirmModal;
    if (action === 'cancel') await handleCancel(orderId);
    if (action === 'confirm') await handleConfirm(orderId);
    if (action === 'return') await handleReturn(orderId);
    setConfirmModal({ visible: false });
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center mt-10">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-gray-700 font-medium animate-pulse">Đang tải...</p>
    </div>
  );

  if (!user) return <p className="text-center mt-10">Không tìm thấy thông tin người dùng</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* User info */}
      <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-xl shadow-md">
        <div className="relative w-32 h-32 md:w-40 md:h-40 group">
          <Image
            src={preview || form.avatarUrl || "/default-avatar.png"}
            alt="avatar"
            width={160}
            height={160}
            className="w-full h-full rounded-full object-cover border-2 border-emerald-600"
          />
          {editing && (
            <>
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer rounded-full z-20" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <FaCamera className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Đổi ảnh</span>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 w-full">
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 w-full max-w-md">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="SĐT" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="date" name="birthday" value={form.birthday} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24" />
              <div className="flex gap-3 mt-3">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition">Lưu</button>
                <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 rounded-lg transition">Hủy</button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p><span className="font-medium text-gray-900">Email:</span> <span className=" font-light font-sans">{user.email}</span></p>
              <p><span className="font-medium text-gray-900">SĐT:</span> <span className="font-light font-sans">{user.phone}</span></p>
              <p><span className="font-medium text-gray-900">Địa chỉ:</span> <span className="font-light font-sans">{user.address}</span></p>
              <p><span className="font-medium text-gray-900">Ngày sinh:</span> <span className="font-light font-sans">{user.birthday?.split("T")[0]}</span></p>
              <p><span className="font-medium text-gray-900">Giới tính:</span>  <span className="font-light font-sans">
                {genderMap[user.gender ?? ""]?.icon} {genderMap[user.gender ?? ""]?.label}
              </span></p>
              <p><span className="font-medium text-gray-900">Bio:</span> <span className="font-light font-sans">{user.bio}</span></p>
              <button onClick={handleStartEdit} className="mt-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-sm shadow hover:bg-emerald-600 flex items-center gap-2"><FaPen size={16} /> Chỉnh sửa</button>
            </div>
          )}
        </div>
      </div>

      {/* Orders */}
      <h2 className="text-2xl font-bold mt-6 mb-2">ĐƠN HÀNG CỦA BẠN</h2>
      <div className="flex gap-2 mt-6">
        <TabButton active={activeTab === "active"} onClick={() => setActiveTab("active")}>Đang xử lý</TabButton>
        <TabButton active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Hoàn thành</TabButton>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {activeTab === "active" ? (
          user.activeOrders && user.activeOrders.length > 0 ? (
            user.activeOrders.map((order) => <OrderCard key={order.id} order={order} showConfirm={showConfirm} />)
          ) : <p>Không có đơn hàng đang xử lý.</p>
        ) : (
          user.completedOrders && user.completedOrders.length > 0 ? (
            user.completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : <p>Chưa có đơn hàng hoàn thành.</p>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <ConfirmModal
        visible={confirmModal.visible}
        message={
          confirmModal.action === 'cancel' ? 'Bạn có chắc chắn muốn hủy đơn này không?' :
            confirmModal.action === 'confirm' ? 'Bạn có chắc chắn muốn xác nhận đơn này không?' :
              'Bạn có chắc chắn muốn trả hàng cho đơn này không?'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ visible: false })}
      />
    </div>
  );
}

// -------------------- Helpers --------------------
const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 font-semibold transition
      bg-gray-200 text-gray-700 rounded-t-lg
      border-b-4 ${active ? "border-emerald-500" : "border-transparent"}
      hover:text-gray-900
    `}
  >
    {children}
  </button>
);

// -------------------- Order Card --------------------
interface OrderCardProps {
  order: Order;
  showConfirm?: (orderId: number, action: ConfirmAction) => void;
}

const OrderCard = ({ order, showConfirm }: OrderCardProps) => {
  const statusColor: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800",
    [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800",
    [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
    [OrderStatus.CANCELED]: "bg-red-100 text-red-800",
    [OrderStatus.RETURNED]: "bg-pink-100 text-pink-800",
  };

  const statusText: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Chuẩn bị vận chuyển",
    [OrderStatus.CONFIRMED]: "Đã xác nhận",
    [OrderStatus.SHIPPED]: "Đang vận chuyển",
    [OrderStatus.DELIVERED]: "Đã giao hàng",
    [OrderStatus.CANCELED]: "Đã hủy đơn",
    [OrderStatus.RETURNED]: "Đã trả hàng",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-gray-700">
          Mã đơn: <span className="font-normal">{order.id}</span>
        </p>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[order.status]}`}>
          {statusText[order.status]}
        </span>
      </div>

      <p className="text-gray-600 font-medium mb-3">
        Tổng tiền:{" "}
        <span className="text-gray-800 font-semibold">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
        </span>
      </p>

      <div className="flex flex-col gap-3 border-t border-b border-gray-100 py-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.product.images?.[0] && (
              <Image
                src={item.product.images[0].url}
                alt={item.product.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-md object-cover border"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-700">{item.product.name}</p>
              <p className="text-gray-500 text-sm">
                Số lượng: {item.quantity} | Giá: {item.price}₫
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        {showConfirm && order.status === OrderStatus.PENDING && (
          <button
            onClick={() => showConfirm(order.id, 'cancel')}
            className="flex-1 min-w-[120px] px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 hover:shadow-md transition-all duration-200"
          >
            Hủy đơn
          </button>
        )}
        {showConfirm && order.status === OrderStatus.DELIVERED && (
          <>
            <button
              onClick={() => showConfirm(order.id, 'confirm')}
              className="flex-1 min-w-[120px] px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow hover:bg-emerald-600 hover:shadow-md transition-all duration-200"
            >
              Xác nhận
            </button>
            <button
              onClick={() => showConfirm(order.id, 'return')}
              className="flex-1 min-w-[120px] px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow hover:bg-cyan-600 hover:shadow-md transition-all duration-200"
            >
              Trả hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
};
