import { NextResponse } from "next/server";

let challenges = [
  {
    id: "1",
    title: "Poupador da semana",
    description: "Economizar R$ 30 até domingo",
    targetValue: 30,
    status: "em_andamento", // "em_andamento" | "concluido"
  },
];

// GET – lista desafios
export async function GET() {
  return NextResponse.json(challenges);
}

// POST – cria desafio
export async function POST(req) {
  const body = await req.json();

  const newChallenge = {
    id: crypto.randomUUID(),
    title: body.title || "",
    description: body.description || "",
    targetValue: Number(body.targetValue) || 0,
    status: "em_andamento",
  };

  challenges.push(newChallenge);
  return NextResponse.json(newChallenge, { status: 201 });
}

// PUT – atualiza desafio (ex: status concluído / em andamento)
export async function PUT(req) {
  const body = await req.json();

  challenges = challenges.map((c) =>
    c.id === body.id ? { ...c, ...body } : c
  );

  return NextResponse.json({ ok: true });
}

// DELETE – (se quiser remover um desafio)
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  challenges = challenges.filter((c) => c.id !== id);
  return NextResponse.json({ ok: true });
}
