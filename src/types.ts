export type Brand = {
  nombreEmpresa: string;
  logoUrl: string;
  loginBgUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  colorTexto: string;
  colorMuted: string;
  colorAppBg: string;
  colorSurface: string;
  colorBorde: string;
};

export type AreaSummary = {
  id: string;
  area: string;
  abreviatura: string;
  simbolo: string;
  header: number;
  count: number;
};

export type AreaLink = {
  titulo: string;
  url: string;
  tipo: string;
  interno: boolean;
  seccionId: string | null;
};

export type AreaSection = {
  id: string;
  nombre: string;
};

export type TeamMember = {
  nombre: string;
  cargo: string;
  email: string;
  movil: string;
};

/** Integrante del directorio de equipo, con su estado de disponibilidad (ver DEC-017 en GAS). */
export type TeamDirectoryMember = TeamMember & {
  estadoNota: string;
  estadoMostrado: "PRESENTE" | "AUSENTE" | "REFRIGERIO" | "OTRO";
};

export type FlujoAtencion = {
  titulo: string;
  headers: string[];
  rows: string[][];
};

export type PublicArea = {
  id: string;
  area: string;
  abreviatura: string;
  simbolo: string;
  header: number;
  portadaUrl: string;
  encargado: TeamMember;
  whatsappCorp: string;
  mailGrupal: string;
  secciones: AreaSection[];
  links: AreaLink[];
  equipo: TeamDirectoryMember[];
};
