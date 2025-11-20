"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function fetchTransactions() {
  const res = await fetch("/api/transactions");
  return res.json();
}

export default function TransactionsPage() {
  const qc = useQueryClient();
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const [description, setDescription] = useState("");
  const [type, setType] = useState("entrada");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [costCenter, setCostCenter] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setDescription("");
      setAmount("");
      setDate("");
      setCostCenter("");
      setType("entrada");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Transações</h1>
        <p className="text-sm text-zinc-600">
          Registre entradas, saídas e acompanhe o extrato.
        </p>
      </header>

      {/* Formulário */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-zinc-600">Descrição</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Lanchonete, salário..."
            />
          </div>

          <div>
            <label className="text-xs text-zinc-600">Tipo</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-600">Valor</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-600">Data</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-zinc-600">Centro de Custo</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="Ex: Alimentação, Lazer..."
            />
          </div>
        </div>

        <button
          onClick={() =>
            createMutation.mutate({
              description,
              type,
              amount: Number(amount) || 0,
              date,
              costCenter,
            })
          }
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {createMutation.isPending ? "Salvando..." : "Adicionar transação"}
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border rounded-xl p-5">
        {isLoading ? (
          <p>Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma transação cadastrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">Descrição</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Centro de custo</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="py-2">{t.description}</td>
                  <td className="py-2">
                    {t.type === "entrada" ? "Entrada" : "Saída"}
                  </td>
                  <td className="py-2">
                    R$ {Number(t.amount).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-2">{t.date || "-"}</td>
                  <td className="py-2">{t.costCenter || "-"}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(t.id)}
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
