import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = { title: "SimpleMoney" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-zinc-50 text-zinc-900">
        <Providers>
          <Navbar />
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-[240px_1fr] gap-6">
            <Sidebar />
            <main className="min-h-[70vh]">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
