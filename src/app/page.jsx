"use client";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-600">
          Olá, {user ? user.name.split(" ")[0] : "usuário"} 👋
        </p>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Bem-vindo de volta
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl p-5 text-white">
          <p className="text-sm/4 opacity-90">Seu saldo</p>
          <p className="text-4xl font-bold mt-1">R$ 245,80</p>
          <p className="text-xs mt-2 opacity-80">Atualizado hoje</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-zinc-500">Minhas metas</p>
          <p className="text-3xl font-bold text-violet-700 mt-1">60%</p>
          <a
            href="/goals"
            className="text-sm text-violet-700 mt-2 inline-block"
          >
            Ver
          </a>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-zinc-500">Últimas transações</p>
          <p className="text-3xl font-bold text-violet-700 mt-1">3</p>
          <a
            href="/transactions"
            className="text-sm text-violet-700 mt-2 inline-block"
          >
            Ver
          </a>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <p className="font-semibold text-zinc-900">Desafio do Dia</p>
        <p className="text-sm text-zinc-600 mt-1">
          Poupador da Semana – economize R$ 30 até domingo
        </p>
        <button className="mt-3 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm">
          Participar
        </button>
      </div>
    </div>
  );
}
