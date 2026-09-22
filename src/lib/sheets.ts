import "server-only";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

/**
 * Acceso de solo lectura al MISMO Google Sheet que ya usa el proyecto Apps Script
 * (CONFIG.SPREADSHEETS.MAIN) — Fase 1 (ver docs/07 y 08): nada de Supabase/Postgres,
 * nada de una copia de los datos. GAS sigue siendo el único que escribe; esta app
 * solo lee, para pintar el directorio publico en Netlify.
 *
 * Requiere una cuenta de servicio de Google (Sheets API habilitada) con el Sheet
 * compartido como Editor (o al menos Lector, ya que acá solo se lee) a su correo.
 * Variables de entorno: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_SERVICE_ACCOUNT_KEY (la clave privada PEM, con los saltos de línea como \n).
 */

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

// Cache en memoria del proceso (mismo criterio que PadronService_buscarColaboradoresLima_ en
// GAS: 5 minutos) — en una función serverless "tibia" evita releer el Sheet en cada request;
// en una instancia nueva (cold start) simplemente no hay nada cacheado todavía.
const CACHE_TTL_MS = 5 * 60 * 1000;
const rowsCache = new Map<string, { at: number; rows: Record<string, string>[] }>();

let docPromise: Promise<GoogleSpreadsheet> | null = null;

function crearAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!email || !rawKey) {
    throw new Error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY.");
  }
  return new JWT({ email, key: rawKey.replace(/\\n/g, "\n"), scopes: SCOPES });
}

async function getDoc(): Promise<GoogleSpreadsheet> {
  if (!docPromise) {
    const id = process.env.GOOGLE_SHEET_ID;
    if (!id) throw new Error("Falta GOOGLE_SHEET_ID.");
    const doc = new GoogleSpreadsheet(id, crearAuth());
    docPromise = doc.loadInfo().then(() => doc);
  }
  return docPromise;
}

async function getSheet(nombreHoja: string): Promise<GoogleSpreadsheetWorksheet> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[nombreHoja];
  if (!sheet) throw new Error(`Hoja no encontrada en el Sheet: ${nombreHoja}`);
  return sheet;
}

/** Lee todas las filas de una hoja como objetos { ENCABEZADO: valor }, igual que SheetsService_readObjects_ en GAS. */
export async function leerFilas(nombreHoja: string): Promise<Record<string, string>[]> {
  const hit = rowsCache.get(nombreHoja);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.rows;

  const sheet = await getSheet(nombreHoja);
  const rows = await sheet.getRows();
  const objetos = rows.map((r) => r.toObject() as Record<string, string>);
  rowsCache.set(nombreHoja, { at: Date.now(), rows: objetos });
  return objetos;
}

/** Interpreta un valor de celda como booleano (mismo criterio que AccesosMapper_bool_ en GAS). */
export function celdaBool(v: unknown): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "sí" || s === "si" || s === "x" || s === "verdadero";
}

/** Hoy (yyyy-MM-dd) y ahora (HH:mm) en la zona del proyecto — mismo criterio que Utilities.formatDate(..., 'America/Lima', ...) en GAS. */
export function hoyYAhoraLima(): { hoy: string; ahoraHHMM: string } {
  const ahora = new Date();
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(ahora); // en-CA -> yyyy-MM-dd
  const ahoraHHMM = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(ahora); // en-GB 24h -> HH:mm
  return { hoy, ahoraHHMM };
}
