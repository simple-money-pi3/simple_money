"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function fetchCostCenters() {
  const res = await fetch("/api/cost-centers");
  return res.json();
}

export default function CostCentersPage() {
  const qc = useQueryClient();
  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: fetchCostCenters,
  });

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/cost-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cost-centers"] });
      setName("");
      setCategory("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/cost-centers?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Centros de custo
        </h1>
        <p className="text-sm text-zinc-600">
          Organize suas despesas por categorias.
        </p>
      </header>

      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Nome</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alimentação"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Categoria</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Fixas, Variáveis..."
            />
          </div>
        </div>

        <button
          onClick={() =>
            createMutation.mutate({
              name,
              category,
            })
          }
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {createMutation.isPending ? "Salvando..." : "Adicionar centro"}
        </button>
      </div>

      <div className="bg-white border rounded-xl p-5">
        {isLoading ? (
          <p>Carregando...</p>
        ) : costCenters.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Nenhum centro de custo cadastrado.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">Nome</th>
                <th>Categoria</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {costCenters.map((c) => (
                <tr key={c.id}>
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">{c.category || "-"}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
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
