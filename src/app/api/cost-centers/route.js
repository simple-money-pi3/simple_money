import { NextResponse } from "next/server";

let costCenters = [
  { id: "1", name: "Alimentação", category: "Variável" },
  { id: "2", name: "Moradia", category: "Fixa" },
];

// GET – lista centros de custo
export async function GET() {
  return NextResponse.json(costCenters);
}

// POST – cria centro de custo
export async function POST(req) {
  const body = await req.json();

  const newCenter = {
    id: crypto.randomUUID(),
    name: body.name || "",
    category: body.category || "",
  };

  costCenters.push(newCenter);
  return NextResponse.json(newCenter, { status: 201 });
}

// PUT – atualiza centro de custo
export async function PUT(req) {
  const body = await req.json();

  costCenters = costCenters.map((c) =>
    c.id === body.id ? { ...c, ...body } : c
  );

  return NextResponse.json({ ok: true });
}

// DELETE – remove centro de custo
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  costCenters = costCenters.filter((c) => c.id !== id);
  return NextResponse.json({ ok: true });
}
