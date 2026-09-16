import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();
  await query("select 1 as ok");

  return NextResponse.json({
    ok: true,
    service: "accesoslink-web",
    latencyMs: Date.now() - startedAt
  });
}
