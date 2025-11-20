import { NextResponse } from "next/server";

let transactions = [
  {
    id: "1",
    description: "Salário",
    type: "entrada", // "entrada" | "saida"
    amount: 3000,
    date: "2025-11-01",
    costCenter: "Renda",
  },
  {
    id: "2",
    description: "Lanche",
    type: "saida",
    amount: 25.5,
    date: "2025-11-02",
    costCenter: "Alimentação",
  },
];

// GET – lista transações
export async function GET() {
  return NextResponse.json(transactions);
}

// POST – cria transação
export async function POST(req) {
  const body = await req.json();

  const newTransaction = {
    id: crypto.randomUUID(),
    description: body.description || "",
    type: body.type === "saida" ? "saida" : "entrada",
    amount: Number(body.amount) || 0,
    date: body.date || null,
    costCenter: body.costCenter || "",
  };

  transactions.push(newTransaction);
  return NextResponse.json(newTransaction, { status: 201 });
}

// PUT – atualiza transação existente
export async function PUT(req) {
  const body = await req.json();

  transactions = transactions.map((t) =>
    t.id === body.id ? { ...t, ...body } : t
  );

  return NextResponse.json({ ok: true });
}

// DELETE – remove transação por id
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  transactions = transactions.filter((t) => t.id !== id);
  return NextResponse.json({ ok: true });
}
