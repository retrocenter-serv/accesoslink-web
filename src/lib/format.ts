/** Helpers de formato puros, compartidos entre componentes de servidor y de cliente. */

/** Mismo criterio que initials() en AccesosClient.html: iniciales de las 2 primeras palabras "largas". */
export function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(" ").filter((w) => w.length > 2).slice(0, 2);
  const out = parts.map((w) => w[0]).join("") || n.slice(0, 2);
  return out.toUpperCase();
}

/** Mismo criterio que waDigits()/waHref() en AccesosClient.html (CC por defecto: Peru). */
export function waHref(v: string) {
  let digits = (v || "").replace(/[^0-9]/g, "");
  if (digits.length === 9) digits = "51" + digits;
  return `https://wa.me/${digits}`;
}

export function mailHref(v: string) {
  return `mailto:${v || ""}`;
}

export function qrSrc(url: string) {
  return (
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&ecc=M&color=1c2b4a&bgcolor=ffffff&data=" +
    encodeURIComponent(url)
  );
}

/** Mismo catalogo que Catalogs_tipos_() en GAS (Catalogs.gs). */
export const TIPO_GLYPH: Record<string, string> = {
  FORM: "assignment",
  DOC: "description",
  SHEET: "table_chart",
  DRIVE: "folder",
  CAL: "calendar_month",
  MAIL: "mail",
  MEET: "videocam",
  DIR: "contacts",
  MAP: "location_on",
  LINK: "link"
};

export const ESTADO_PILL: Record<string, { etiqueta: string; cls: string }> = {
  PRESENTE: { etiqueta: "Presente", cls: "m-estado-ok" },
  AUSENTE: { etiqueta: "Ausente", cls: "m-estado-muted" },
  REFRIGERIO: { etiqueta: "En refrigerio", cls: "m-estado-warn" },
  OTRO: { etiqueta: "Otro", cls: "m-estado-warn" }
};
