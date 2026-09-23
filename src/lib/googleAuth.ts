import "server-only";
import { JWT } from "google-auth-library";

/**
 * Credencial compartida (una sola cuenta de servicio) para todo lo que este proyecto lee de
 * Google: Sheets (el Sheet principal y el de "Flujo de atención") y Drive (el logo de marca,
 * ver DEC-015 en GAS — el hotlink directo de Drive no funciona para visitantes anónimos por la
 * política de uso compartido externo del Workspace, así que hay que leer el archivo como blob
 * con una identidad real, igual que hace GAS con DriveApp).
 */
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly"
];

let auth: JWT | null = null;

export function getGoogleAuth(): JWT {
  if (auth) return auth;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!email || !rawKey) {
    throw new Error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY.");
  }
  auth = new JWT({ email, key: rawKey.replace(/\\n/g, "\n"), scopes: SCOPES });
  return auth;
}
