"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function fetchBudgets() {
  const res = await fetch("/api/budgets");
  return res.json();
}

export default function BudgetsPage() {
  const qc = useQueryClient();
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });

  const [month, setMonth] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [limit, setLimit] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      setMonth("");
      setCostCenter("");
      setLimit("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Orçamentos</h1>
        <p className="text-sm text-zinc-600">
          Defina limites mensais por centro de custo.
        </p>
      </header>

      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Mês</label>
            <input
              type="month"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Centro de custo</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="Ex: Alimentação"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Limite (R$)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="500"
            />
          </div>
        </div>

        <button
          onClick={() =>
            createMutation.mutate({
              month,
              costCenter,
              limit: Number(limit) || 0,
            })
          }
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {createMutation.isPending ? "Salvando..." : "Adicionar orçamento"}
        </button>
      </div>

      <div className="bg-white border rounded-xl p-5">
        {isLoading ? (
          <p>Carregando...</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhum orçamento cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">Mês</th>
                <th>Centro de custo</th>
                <th>Limite</th>
                <th>Gasto</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {budgets.map((b) => (
                <tr key={b.id}>
                  <td className="py-2">{b.month}</td>
                  <td className="py-2">{b.costCenter}</td>
                  <td className="py-2">
                    R$ {Number(b.limit).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-2">
                    R${" "}
                    {Number(b.spent || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(b.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
