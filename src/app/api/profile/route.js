import { NextResponse } from "next/server";

let profile = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@email.com",
  age: 22,
  points: 580,
};

// GET – retorna o perfil
export async function GET() {
  return NextResponse.json(profile);
}

// PUT – atualiza o perfil
export async function PUT(req) {
  const body = await req.json();

  profile = {
    ...profile,
    ...body,
    age: body.age !== undefined ? Number(body.age) : profile.age,
    points: body.points !== undefined ? Number(body.points) : profile.points,
  };

  return NextResponse.json(profile);
}
