import "server-only";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { getGoogleAuth } from "@/lib/googleAuth";
import type { FlujoAtencion } from "@/types";

/**
 * Puerto de FlujoAtencionService.gs (GAS): lee EN VIVO la primera tabla de una hoja externa
 * ("Guía Rápida de Contacto"), que tiene varias tablas apiladas — se detiene en la primera fila
 * totalmente en blanco tras el encabezado, para no arrastrar el resto (RACI, SLA, glosarios).
 *
 * Es una hoja DISTINTA a GOOGLE_SHEET_ID — requiere compartirla tambien con la cuenta de
 * servicio (como Lector alcanza). Variables: FLUJO_SPREADSHEET_ID, FLUJO_SHEET_GID (mismos
 * valores que CONFIG.FLUJO_ATENCION en GAS; se dejan como env var por si cambian sin redeploy).
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: FlujoAtencion } | null = null;

function filaVacia(row: unknown[]): boolean {
  return row.every((c) => String(c ?? "").trim() === "");
}

export async function getFlujoAtencion(): Promise<FlujoAtencion | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const spreadsheetId = process.env.FLUJO_SPREADSHEET_ID;
  const gidRaw = process.env.FLUJO_SHEET_GID;
  if (!spreadsheetId || !gidRaw) return null;

  const doc = new GoogleSpreadsheet(spreadsheetId, getGoogleAuth());
  await doc.loadInfo();
  const sheet = doc.sheetsById[Number(gidRaw)];
  if (!sheet) return null;

  const values: unknown[][] = (await sheet.getCellsInRange("A1:Z80")) || [];
  if (!values.length) return { titulo: "Flujo de atención", headers: [], rows: [] };

  const headerRow = values[0];
  let lastCol = headerRow.length - 1;
  while (lastCol >= 0 && String(headerRow[lastCol] ?? "").trim() === "") lastCol--;
  const headers = headerRow.slice(0, lastCol + 1).map((v) => String(v ?? "").trim());

  const rows: string[][] = [];
  for (let i = 1; i < values.length; i++) {
    if (filaVacia(values[i])) break; // fin de la primera tabla
    rows.push(values[i].slice(0, lastCol + 1).map((c) => String(c ?? "")));
  }

  const data: FlujoAtencion = { titulo: "Flujo de atención", headers, rows };
  cache = { at: Date.now(), data };
  return data;
}
