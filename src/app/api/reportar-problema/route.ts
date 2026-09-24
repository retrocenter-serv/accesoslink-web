import { NextResponse } from "next/server";
import { GAS_EXEC_URL } from "@/lib/config";

/**
 * Relay server-a-server hacia el doPost de GAS (WebApp.gs) — nunca desde el navegador
 * directo (evita el problema de CORS/preflight de Apps Script con JSON) y nunca escribe en el
 * Sheet desde este servidor (Fase 1 sigue siendo de solo lectura contra Sheets/Drive). GAS sigue
 * siendo el único que valida/guarda/notifica — esto solo reenvía el payload tal cual.
 */
export async function POST(request: Request) {
  if (!GAS_EXEC_URL) {
    return NextResponse.json(
      { ok: false, message: "El envío de reportes no está configurado todavía." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Datos no válidos." }, { status: 400 });
  }

  try {
    const res = await fetch(GAS_EXEC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "reportarProblema", payload })
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { ok: false, message: "No se pudo comunicar con el servidor. Intenta de nuevo." },
      { status: 502 }
    );
  }
}
