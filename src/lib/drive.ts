import "server-only";
import { getGoogleAuth } from "@/lib/googleAuth";

/**
 * Descarga el logo desde Drive usando la cuenta de servicio (ver DEC-015 en GAS): el hotlink
 * directo de Drive (LOGO_URL, `drive.google.com/uc?export=view&id=...`) no funciona para un
 * visitante anónimo porque el Workspace restringe el uso compartido fuera de la organización,
 * aunque el archivo esté marcado "cualquiera con el enlace". La solución de GAS es leer el
 * archivo con una identidad real (DriveApp, como la cuenta que despliega) y servirlo ya
 * descargado — acá se replica igual, pero con la cuenta de servicio en vez de DriveApp.
 *
 * Requiere: la carpeta de recursos del proyecto (RECURSOS_FOLDER_ID en CONFIG_MARCA) compartida
 * como Lector con el correo de la cuenta de servicio — una sola vez, sobrevive a que se
 * reemplace el logo despues (los archivos nuevos heredan el permiso de la carpeta).
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; buffer: Buffer; contentType: string } | null = null;

export async function getLogoBlob(fileId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache;

  const auth = getGoogleAuth();
  const { token } = await auth.getAccessToken();
  if (!token) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/png";
  cache = { at: Date.now(), buffer, contentType };
  return cache;
}
