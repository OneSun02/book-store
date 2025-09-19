import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer>
      {/* Logo */}
      <div className="footer-logo" style={{ marginBottom: 20 }}>
        <Image
          src="/images/logo-nhat-shop.png"
          alt="My Shop Logo"
          width={100}
          height={50}
          priority
        />
      </div>

      {/* Thông tin */}
      <div className="footer-info"><strong>ONE SHOP</strong></div>
      <div className="footer-info">Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
      <div className="footer-info">Hotline: 0123 456 789</div>
      <div className="footer-info">Email: support@myshop.com</div>

      {/* Mạng xã hội */}
      <div
        className="social-links"
        style={{ display: "flex", justifyContent: "center", gap: 20, margin: 20 }}
      >
        <a href="#" target="_blank" rel="noopener noreferrer">
          <FaFacebook size={24} color="#4267B2" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <FaInstagram size={24} color="#C13584" />
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          <FaLinkedin size={24} color="#0077B5" />
        </a>
      </div>

      {/* Copyright */}
      <div className="copyright" style={{ fontSize: 14, color: "#555" }}>
        &copy; 2025 ONE SHOP. All rights reserved.
      </div>
    </footer>
  );
}
