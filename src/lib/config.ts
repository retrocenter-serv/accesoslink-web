import type { Brand } from "@/types";

export const APP_NAME = "AccesosLink";
export const APP_BASE_URL =
  process.env.APP_BASE_URL || "https://accesos.tdemperu.com";

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
