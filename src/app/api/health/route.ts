import { NextResponse } from "next/server";
import { leerFilas } from "@/lib/sheets";

export async function GET() {
  const startedAt = Date.now();
  await leerFilas("CONFIG_MARCA");

  return NextResponse.json({
    ok: true,
    service: "accesoslink-web",
    latencyMs: Date.now() - startedAt
  });
}
