import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope
} from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-emerald-900 text-white pt-12 pb-20 border-t border-emerald-700">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Top: Logo + Social */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          {/* Logo */}
          <div className="flex flex-row items-center gap-3">
            <Image
              src="/images/logo-nhat-shop.png"
              alt="ONE SHOP Logo"
              width={100}
              height={50}
              priority
            />
            <p className="text-gray-200 italic font-mono text-sm">
              Chúng tôi cam kết về chất lượng & Uy tín cho mọi khách hàng.
            </p>
          </div>


          {/* Social Media */}
          <div className="flex gap-6 text-white">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaFacebook size={28} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaInstagram size={28} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaLinkedin size={28} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaTwitter size={28} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
              <FaYoutube size={28} />
            </a>
          </div>
        </div>


        {/* Middle: Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shop Info */}
          <div className="space-y-2 text-sm">
            <h3 className="font-bold text-lg mb-3">Nhà Sách - One Shop</h3>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-400 flex-shrink-0" />
              <span>11 Hồng Hà, Quận Cầu Giấy, TP. Đồng Thanh</span>
            </p>
            <p className="flex items-center gap-2">
              <FaPhoneAlt className="text-emerald-400 flex-shrink-0" />
              <span>0923 456 789</span>
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-emerald-400 flex-shrink-0" />
              <span>support@oneShop.com</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-sm">
            <h3 className="font-bold text-lg mb-3">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-400 transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-emerald-400 transition-colors">
                  Thanh toán
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition-colors">
                  Hồ sơ của bạn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="text-sm text-gray-300 text-center mt-10">
          &copy; 2025 ONE SHOP. All rights reserved.
        </div>
      </div>

      {/* Wave full width */}
      <div className="absolute bottom-0 left-0 w-screen overflow-visible">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#007645" fillOpacity="1" d="M0,256L20,224C40,192,80,128,120,128C160,128,200,192,240,213.3C280,235,320,213,360,176C400,139,440,85,480,90.7C520,96,560,160,600,197.3C640,235,680,245,720,240C760,235,800,213,840,197.3C880,181,920,171,960,149.3C1000,128,1040,96,1080,101.3C1120,107,1160,149,1200,160C1240,171,1280,149,1320,149.3C1360,149,1400,171,1420,181.3L1440,192L1440,320L1420,320C1400,320,1360,320,1320,320C1280,320,1240,320,1200,320C1160,320,1120,320,1080,320C1040,320,1000,320,960,320C920,320,880,320,840,320C800,320,760,320,720,320C680,320,640,320,600,320C560,320,520,320,480,320C440,320,400,320,360,320C320,320,280,320,240,320C200,320,160,320,120,320C80,320,40,320,20,320L0,320Z"></path></svg>
      </div>
    </footer>
  );
}
