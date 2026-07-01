import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json(
    { message: "Signed out" },
    { status: 200 },
  );
  response.cookies.set({
    maxAge: 0,
    name: "bsx_token",
    path: "/",
    value: "",
  });

  return response;
}
