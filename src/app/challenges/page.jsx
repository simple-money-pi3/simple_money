"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function fetchChallenges() {
  const res = await fetch("/api/challenges");
  return res.json();
}

export default function ChallengesPage() {
  const qc = useQueryClient();
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      setTitle("");
      setDescription("");
      setTargetValue("");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (challenge) => {
      const res = await fetch("/api/challenges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...challenge,
          status:
            challenge.status === "concluido" ? "em_andamento" : "concluido",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Desafios</h1>
        <p className="text-sm text-zinc-600">
          Crie desafios pessoais e acompanhe seu progresso.
        </p>
      </header>

      {/* Form */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-600">Título</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Poupador da semana"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600">Valor alvo (R$)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="col-span-3">
            <label className="text-xs text-zinc-600">Descrição</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do desafio..."
            />
          </div>
        </div>

        <button
          onClick={() =>
            createMutation.mutate({
              title,
              description,
              targetValue: Number(targetValue) || 0,
            })
          }
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {createMutation.isPending ? "Salvando..." : "Adicionar desafio"}
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white border rounded-xl p-5">
        {isLoading ? (
          <p>Carregando...</p>
        ) : challenges.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhum desafio cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {challenges.map((c) => (
              <li
                key={c.id}
                className="border rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-zinc-500">{c.description}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Meta: R$ {c.targetValue} | Status:{" "}
                    {c.status === "concluido" ? "Concluído" : "Em andamento"}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatusMutation.mutate(c)}
                  className="text-sm px-3 py-1 rounded-lg border border-violet-600 text-violet-700 hover:bg-violet-50"
                >
                  {c.status === "concluido" ? "Reabrir" : "Concluir"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
