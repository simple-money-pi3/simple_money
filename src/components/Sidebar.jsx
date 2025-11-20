"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/goals", label: "Metas" },
  { href: "/transactions", label: "Transações" },
  { href: "/challenges", label: "Desafios" },
  { href: "/cost-centers", label: "Centros de Custo" },
  { href: "/budgets", label: "Orçamentos" },
  { href: "/profile", label: "Perfil" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white/95 border border-zinc-200 rounded-2xl shadow-sm p-4 h-fit sticky top-20">
      <p className="text-xs font-semibold text-zinc-500 tracking-wide mb-3">
        Navegação
      </p>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
                ${
                  isActive
                    ? "bg-violet-100 text-violet-700 font-medium"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-violet-700"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-violet-600" : "bg-zinc-300"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
