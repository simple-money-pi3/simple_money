"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Buscar dados do perfil
async function fetchProfile() {
  const res = await fetch("/api/profile");
  if (!res.ok) throw new Error("Erro ao carregar perfil");
  return res.json();
}

// Atualizar perfil
async function updateProfile(data) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar perfil");
  return res.json();
}

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [points, setPoints] = useState("");

  // Preenche o formulário quando o perfil chega da API
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setEmail(profile.email || "");
    setAge(profile.age ? String(profile.age) : "");
    setPoints(profile.points ? String(profile.points) : "");
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  function handleSave() {
    if (!profile) return;

    updateMutation.mutate({
      id: profile.id, // se sua API usar id
      name,
      email,
      age: Number(age) || 0,
      points: Number(points) || 0,
    });
  }

  if (isLoading || !profile) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">Perfil</h1>
        <p className="text-sm text-zinc-600">
          Gerencie suas informações pessoais e acompanhe seus pontos.
        </p>
      </header>

      {/* Card principal */}
      <div className="bg-white border rounded-xl p-6 grid grid-cols-[220px_1fr] gap-6">
        {/* Lado esquerdo: avatar/resumo */}
        <div className="flex flex-col items-center border-r pr-6">
          <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-2xl font-bold">
            {name ? name.charAt(0) : "U"}
          </div>
          <p className="mt-3 font-medium text-zinc-900">{name || "Usuário"}</p>
          <p className="text-xs text-zinc-500">{email}</p>
          <p className="text-xs text-violet-700 mt-2">
            {points || 0} pontos acumulados
          </p>
        </div>

        {/* Lado direito: formulário */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-600">Nome completo</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-600">E-mail</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-600">Idade</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 25"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600">Pontos</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Ex: 580"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="mt-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-70"
          >
            {updateMutation.isPending ? "Salvando..." : "Atualizar perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
