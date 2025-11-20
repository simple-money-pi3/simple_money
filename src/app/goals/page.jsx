"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

async function fetchGoals() {
  const r = await fetch("/api/goals");
  return r.json();
}

export default function GoalsPage() {
  const qc = useQueryClient();
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const r = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      setTitle("");
      setTargetValue("");
      setDeadline("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const rows = useMemo(
    () =>
      goals.map((g) => {
        const percent = g.targetValue
          ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100)
          : 0;
        return { ...g, percent };
      }),
    [goals]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Metas</h1>
        <p className="text-sm text-zinc-600">
          Crie e acompanhe suas metas de economia
        </p>
      </header>

      {/* Form */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Nome da meta</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Notebook novo"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Valor objetivo</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Data limite</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={() =>
            createMutation.mutate({
              title,
              targetValue: Number(targetValue) || 0,
              currentValue: 0,
              deadline: deadline || null,
            })
          }
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {createMutation.isPending ? "Salvando..." : "Adicionar meta"}
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border rounded-xl p-5">
        {isLoading ? (
          <p>Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma meta cadastrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">Meta</th>
                <th>Progresso</th>
                <th>Objetivo</th>
                <th>Prazo</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((g) => (
                <tr key={g.id} className="align-middle">
                  <td className="py-2 font-medium">{g.title}</td>
                  <td className="py-2">
                    <div className="w-56 h-2 bg-zinc-200 rounded-full">
                      <div
                        className="h-2 bg-violet-600 rounded-full"
                        style={{ width: `${g.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{g.percent}%</span>
                  </td>
                  <td className="py-2">
                    R$ {g.currentValue} / R$ {g.targetValue}
                  </td>
                  <td className="py-2">{g.deadline || "-"}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(g.id)}
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
