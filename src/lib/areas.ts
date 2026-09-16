import "server-only";
import { notFound } from "next/navigation";
import { DB_SCHEMA, defaultBrand } from "@/lib/config";
import { query } from "@/lib/db";
import type { AreaLink, AreaSection, AreaSummary, Brand, PublicArea, TeamMember } from "@/types";

const schema = /^[a-z_][a-z0-9_]*$/i.test(DB_SCHEMA) ? DB_SCHEMA : "accesoslink";

type BrandRow = {
  campo: string;
  valor: string;
};

type AreaSummaryRow = {
  id_area: string;
  area: string;
  abreviatura: string;
  simbolo: string;
  header: number;
  count: string;
};

type AreaRow = {
  id_area: string;
  area: string;
  abreviatura: string;
  simbolo: string;
  header: number;
  portada_url: string;
  enc_nombre: string;
  enc_cargo: string;
  enc_email: string;
  enc_movil: string;
  whatsapp_corp: string;
  mail_grupal: string;
};

type SectionRow = {
  id_seccion: string;
  nombre: string;
};

type LinkRow = {
  titulo: string;
  url: string;
  tipo: string;
  interno: boolean;
  id_seccion: string | null;
};

type TeamRow = {
  nombre: string;
  cargo: string;
  email: string;
  movil: string;
};

export async function getBrand(): Promise<Brand> {
  const rows = await query<BrandRow>(
    `select campo, valor from ${schema}.config_marca`
  );
  const values = new Map(rows.map((row) => [row.campo, row.valor]));

  return {
    nombreEmpresa: values.get("NOMBRE_EMPRESA") || defaultBrand.nombreEmpresa,
    logoUrl: values.get("LOGO_URL") || defaultBrand.logoUrl,
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
  const rows = await query<AreaSummaryRow>(`
    select
      a.id_area,
      a.area,
      a.abreviatura,
      a.simbolo,
      a.header,
      count(l.id_acceso) filter (where l.estado_registro <> 'ELIMINADO') as count
    from ${schema}.areas a
    left join ${schema}.accesos l on l.id_area = a.id_area
    where a.estado_registro <> 'ELIMINADO'
    group by a.id_area, a.area, a.abreviatura, a.simbolo, a.header, a.orden
    order by a.orden asc, a.area asc
  `);

  return rows.map((row) => ({
    id: row.id_area,
    area: row.area,
    abreviatura: row.abreviatura,
    simbolo: row.simbolo,
    header: Number(row.header || 0),
    count: Number(row.count || 0)
  }));
}

export async function getPublicArea(
  areaId: string,
  mode: "externo" | "interno"
): Promise<PublicArea> {
  const [area] = await query<AreaRow>(
    `
      select *
      from ${schema}.areas
      where id_area = $1 and estado_registro <> 'ELIMINADO'
      limit 1
    `,
    [areaId]
  );

  if (!area) notFound();

  const [secciones, links, equipo] = await Promise.all([
    query<SectionRow>(
      `
        select id_seccion, nombre
        from ${schema}.secciones
        where id_area = $1 and estado_registro <> 'ELIMINADO'
        order by orden asc, nombre asc
      `,
      [areaId]
    ),
    query<LinkRow>(
      `
        select titulo, url, tipo, interno, id_seccion
        from ${schema}.accesos
        where id_area = $1
          and estado_registro <> 'ELIMINADO'
          and ($2::boolean = false or interno = false)
        order by orden asc, titulo asc
      `,
      [areaId, mode === "externo"]
    ),
    query<TeamRow>(
      `
        select nombre, cargo, email, movil
        from ${schema}.equipo
        where id_area = $1 and estado_registro <> 'ELIMINADO'
        order by orden asc, nombre asc
      `,
      [areaId]
    )
  ]);

  return {
    id: area.id_area,
    area: area.area,
    abreviatura: area.abreviatura,
    simbolo: area.simbolo,
    header: Number(area.header || 0),
    portadaUrl: area.portada_url,
    encargado: {
      nombre: area.enc_nombre,
      cargo: area.enc_cargo,
      email: area.enc_email,
      movil: area.enc_movil
    },
    whatsappCorp: area.whatsapp_corp,
    mailGrupal: area.mail_grupal,
    secciones: secciones.map<AreaSection>((row) => ({
      id: row.id_seccion,
      nombre: row.nombre
    })),
    links: links.map<AreaLink>((row) => ({
      titulo: row.titulo,
      url: row.url,
      tipo: row.tipo,
      interno: row.interno,
      seccionId: row.id_seccion
    })),
    equipo: equipo.map<TeamMember>((row) => ({
      nombre: row.nombre,
      cargo: row.cargo,
      email: row.email,
      movil: row.movil
    }))
  };
}
