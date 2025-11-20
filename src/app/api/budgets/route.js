import { NextResponse } from "next/server";

let budgets = [
  {
    id: "1",
    month: "2025-11",
    costCenter: "Alimentação",
    limit: 500,
    spent: 120,
  },
];

// GET – lista orçamentos
export async function GET() {
  return NextResponse.json(budgets);
}

// POST – cria orçamento
export async function POST(req) {
  const body = await req.json();

  const newBudget = {
    id: crypto.randomUUID(),
    month: body.month || "",
    costCenter: body.costCenter || "",
    limit: Number(body.limit) || 0,
    spent: Number(body.spent) || 0,
  };

  budgets.push(newBudget);
  return NextResponse.json(newBudget, { status: 201 });
}

// PUT – atualiza orçamento (pode atualizar spent, limit etc.)
export async function PUT(req) {
  const body = await req.json();

  budgets = budgets.map((b) => (b.id === body.id ? { ...b, ...body } : b));

  return NextResponse.json({ ok: true });
}

// DELETE – remove orçamento
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  budgets = budgets.filter((b) => b.id !== id);
  return NextResponse.json({ ok: true });
}
