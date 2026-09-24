import type { Brand } from "@/types";

export const APP_NAME = "AccesosLink";
export const APP_BASE_URL =
  process.env.APP_BASE_URL || "https://accesos.tdemperu.com";

/**
 * Versionado propio de ESTE sitio (Next.js/Netlify) — no es el mismo numero que CONFIG.APP.VERSION
 * en GAS, porque son dos códigos distintos con sus propios cambios. Mismo criterio de UX que GAS
 * (Novedades en el pie de página): agregar una entrada nueva al inicio del arreglo en cada cambio
 * visible, junto con el bump de APP_VERSION/APP_VERSION_FECHA.
 */
export const APP_VERSION = "1.0.0";
export const APP_VERSION_FECHA = "2026-09-24";
export const APP_CHANGELOG: { version: string; fecha: string; titulo: string; cambios: string[] }[] = [
  {
    version: "1.0.0",
    fecha: "2026-09-24",
    titulo: "Primera versión pública en Netlify",
    cambios: [
      "Directorio público de áreas, con el mismo diseño que el sistema GAS.",
      "Lee en vivo el mismo Google Sheet que usa GAS (Fase 1 — GAS sigue siendo el único que edita).",
      '"Conocer al equipo" y "Flujo de atención" como tarjetas desplegables.',
      'Nuevo botón "Reportar un problema" en el pie de página.'
    ]
  }
];

/** URL /exec de la Web App de GAS — único destino de escritura (ver /api/reportar-problema). */
export const GAS_EXEC_URL = process.env.GAS_EXEC_URL || "";

export const defaultBrand: Brand = {
  nombreEmpresa: "Accesos Rapidos",
  logoUrl: "",
  loginBgUrl: "",
  colorPrimario: "#004a99",
  colorSecundario: "#16a34a",
  colorTexto: "#1c2b4a",
  colorMuted: "#55606e",
  colorAppBg: "#e9f3fc",
  colorSurface: "#ffffff",
  colorBorde: "#dfe4ea"
};

export function areaUrl(areaId: string, mode?: "externo" | "interno") {
  const url = new URL(`/${areaId}`, APP_BASE_URL);
  if (mode === "externo") url.searchParams.set("modo", "externo");
  return url.toString();
}
