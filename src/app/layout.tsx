import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "ONE SHOP",
  description: "nhà sách online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
        <body>
        <Header />
        <main className="min-h-[80vh] px-5">{children}</main>
        <Footer />
        </body>
    </html>
  );
}
