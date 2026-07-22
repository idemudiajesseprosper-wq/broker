import { Inter, Syne } from "next/font/google";
import SmartsuppWidget from "@/components/SmartsuppWidget";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata = {
  title: "BSX Capital Exchange",
  description: "Bitcoin trading broker and investment platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#050508] text-white">
        <ToastProvider>
          <AuthProvider>
            {children}
            <SmartsuppWidget />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
