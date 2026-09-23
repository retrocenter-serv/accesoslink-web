import "server-only";
import { notFound } from "next/navigation";
import { defaultBrand } from "@/lib/config";
import { celdaBool, hoyYAhoraLima, leerFilas } from "@/lib/sheets";
import type { AreaLink, AreaSection, AreaSummary, Brand, PublicArea, TeamDirectoryMember } from "@/types";

const ESTADO_ELIMINADO = "ELIMINADO";

function noEliminado(row: Record<string, string>) {
  return String(row.ESTADO_REGISTRO || "").trim().toUpperCase() !== ESTADO_ELIMINADO;
}

function porOrden(a: Record<string, string>, b: Record<string, string>) {
  return Number(a.ORDEN || 0) - Number(b.ORDEN || 0);
}

/**
 * ID del archivo de Drive del logo (CONFIG_MARCA.LOGO_FILE_ID) — usado por /api/logo para
 * descargarlo con la cuenta de servicio (ver lib/drive.ts, mismo motivo que DEC-015 en GAS).
 */
export async function getLogoFileId(): Promise<string | null> {
  const rows = await leerFilas("CONFIG_MARCA");
  const fila = rows.find((row) => String(row.CAMPO || "").trim() === "LOGO_FILE_ID");
  const id = String(fila?.VALOR ?? "").trim();
  return id || null;
}

export async function getBrand(): Promise<Brand> {
  const rows = await leerFilas("CONFIG_MARCA");
  const values = new Map(rows.map((row) => [String(row.CAMPO || "").trim(), String(row.VALOR ?? "")]));
  // Si hay un archivo de logo en Drive, se sirve vía /api/logo (descargado con la cuenta de
  // servicio) en vez del hotlink directo LOGO_URL, que no carga para visitantes anónimos.
  const logoFileId = values.get("LOGO_FILE_ID") || "";

  return {
    nombreEmpresa: values.get("NOMBRE_EMPRESA") || defaultBrand.nombreEmpresa,
    logoUrl: logoFileId ? "/api/logo" : values.get("LOGO_URL") || defaultBrand.logoUrl,
    loginBgUrl: values.get("LOGIN_BG_URL") || defaultBrand.loginBgUrl,
    colorPrimario: values.get("COLOR_PRIMARIO") || defaultBrand.colorPrimario,
    colorSecundario: values.get("COLOR_SECUNDARIO") || defaultBrand.colorSecundario,
    colorTexto: values.get("COLOR_TEXTO") || defaultBrand.colorTexto,
    colorMuted: values.get("COLOR_MUTED") || defaultBrand.colorMuted,
    colorAppBg: values.get("COLOR_APP_BG") || defaultBrand.colorAppBg,
    colorSurface: values.get("COLOR_SURFACE") || defaultBrand.colorSurface,
    colorBorde: values.get("COLOR_BORDE") || defaultBrand.colorBorde
  };
}

export async function getAreaSummaries(): Promise<AreaSummary[]> {
  const [areas, accesos] = await Promise.all([leerFilas("AREAS"), leerFilas("ACCESOS")]);

  const counts = new Map<string, number>();
  accesos.filter(noEliminado).forEach((row) => {
    const id = String(row.ID_AREA || "");
    counts.set(id, (counts.get(id) || 0) + 1);
  });

  return areas
    .filter(noEliminado)
    .sort(porOrden)
    .map((row) => ({
      id: String(row.ID_AREA || ""),
      area: String(row.AREA || ""),
      abreviatura: String(row.ABREVIATURA || ""),
      simbolo: String(row.SIMBOLO || "folder"),
      header: Number(row.HEADER || 0),
      count: counts.get(String(row.ID_AREA || "")) || 0
    }));
}

/**
 * Estado mostrado HOY en "Conocer al equipo" — mismo criterio que
 * AccesosMapper_estadoMostrado_ en GAS: (1) manual de HOY manda, (2) si no, horario de
 * refrigerio de respaldo, (3) si no, "Presente" por defecto.
 */
function estadoMostrado(row: Record<string, string>, hoy: string, ahoraHHMM: string) {
  const fechaEstado = String(row.ESTADO_FECHA || "").trim().slice(0, 10);
  const estadoManual = String(row.ESTADO_ACTUAL || "").trim().toUpperCase();
  if (estadoManual && fechaEstado === hoy) return estadoManual as TeamDirectoryMember["estadoMostrado"];

  const inicio = String(row.REFRIGERIO_INICIO || "").trim();
  const fin = String(row.REFRIGERIO_FIN || "").trim();
  if (inicio && fin && ahoraHHMM >= inicio && ahoraHHMM < fin) return "REFRIGERIO";

  return "PRESENTE";
}

export async function getPublicArea(
  areaId: string,
  mode: "externo" | "interno"
): Promise<PublicArea> {
  const [areas, secciones, accesos, equipo] = await Promise.all([
    leerFilas("AREAS"),
    leerFilas("SECCIONES"),
    leerFilas("ACCESOS"),
    leerFilas("EQUIPO")
  ]);

  const area = areas.find((row) => row.ID_AREA === areaId && noEliminado(row));
  if (!area) notFound();

  const { hoy, ahoraHHMM } = hoyYAhoraLima();
  const soloExterno = mode === "externo";

  const links: AreaLink[] = accesos
    .filter((row) => row.ID_AREA === areaId && noEliminado(row))
    .filter((row) => !soloExterno || !celdaBool(row.INTERNO))
    .sort(porOrden)
    .map((row) => ({
      titulo: String(row.TITULO || ""),
      url: String(row.URL || ""),
      tipo: String(row.TIPO || "LINK"),
      interno: celdaBool(row.INTERNO),
      seccionId: row.ID_SECCION ? String(row.ID_SECCION) : null
    }));

  const seccionesArea: AreaSection[] = secciones
    .filter((row) => row.ID_AREA === areaId && noEliminado(row))
    .sort(porOrden)
    .map((row) => ({ id: String(row.ID_SECCION || ""), nombre: String(row.NOMBRE || "") }));

  const equipoArea: TeamDirectoryMember[] = equipo
    .filter((row) => row.ID_AREA === areaId && noEliminado(row))
    .sort(porOrden)
    .map((row) => ({
      nombre: String(row.NOMBRE || ""),
      cargo: String(row.CARGO || ""),
      email: String(row.EMAIL || ""),
      movil: String(row.MOVIL || ""),
      estadoNota: String(row.ESTADO_NOTA || ""),
      estadoMostrado: estadoMostrado(row, hoy, ahoraHHMM)
    }));

  return {
    id: String(area.ID_AREA || ""),
    area: String(area.AREA || ""),
    abreviatura: String(area.ABREVIATURA || ""),
    simbolo: String(area.SIMBOLO || "folder"),
    header: Number(area.HEADER || 0),
    portadaUrl: String(area.PORTADA_URL || ""),
    encargado: {
      nombre: String(area.ENC_NOMBRE || ""),
      cargo: String(area.ENC_CARGO || ""),
      email: String(area.ENC_EMAIL || ""),
      movil: String(area.ENC_MOVIL || "")
    },
    whatsappCorp: String(area.WHATSAPP_CORP || ""),
    mailGrupal: String(area.MAIL_GRUPAL || ""),
    secciones: seccionesArea,
    links,
    equipo: equipoArea
  };
}
