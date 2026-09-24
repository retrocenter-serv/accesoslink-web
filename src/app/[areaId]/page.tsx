import type { Metadata } from "next";
import { areaUrl } from "@/lib/config";
import { getBrand, getPublicArea } from "@/lib/areas";
import { getFlujoAtencion } from "@/lib/flujo";
import { Footer } from "@/components/Footer";
import type { AreaLink, TeamDirectoryMember } from "@/types";

type Props = {
  params: Promise<{ areaId: string }>;
  searchParams: Promise<{ modo?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { areaId } = await params;
  const area = await getPublicArea(areaId, "externo");
  return {
    title: area.area,
    description: `Accesos rapidos de ${area.area}.`
  };
}

/** Mismo criterio que initials() en AccesosClient.html: iniciales de las 2 primeras palabras "largas". */
function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(" ").filter((w) => w.length > 2).slice(0, 2);
  const out = parts.map((w) => w[0]).join("") || n.slice(0, 2);
  return out.toUpperCase();
}

/** Mismo criterio que waDigits()/waHref() en AccesosClient.html (CC por defecto: Peru). */
function waHref(v: string) {
  let digits = (v || "").replace(/[^0-9]/g, "");
  if (digits.length === 9) digits = "51" + digits;
  return `https://wa.me/${digits}`;
}

function mailHref(v: string) {
  return `mailto:${v || ""}`;
}

function qrSrc(url: string) {
  return (
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&ecc=M&color=1c2b4a&bgcolor=ffffff&data=" +
    encodeURIComponent(url)
  );
}

/** Mismo catalogo que Catalogs_tipos_() en GAS (Catalogs.gs). */
const TIPO_GLYPH: Record<string, string> = {
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

const ESTADO_PILL: Record<string, { etiqueta: string; cls: string }> = {
  PRESENTE: { etiqueta: "Presente", cls: "m-estado-ok" },
  AUSENTE: { etiqueta: "Ausente", cls: "m-estado-muted" },
  REFRIGERIO: { etiqueta: "En refrigerio", cls: "m-estado-warn" },
  OTRO: { etiqueta: "Otro", cls: "m-estado-warn" }
};

function EstadoPill({ estado }: { estado: TeamDirectoryMember["estadoMostrado"] }) {
  const info = ESTADO_PILL[estado] || ESTADO_PILL.PRESENTE;
  return <span className={`m-estado ${info.cls}`}>{info.etiqueta}</span>;
}

function AccesosList({ links, externo }: { links: AreaLink[]; externo: boolean }) {
  return (
    <div className="acc-list">
      {links.map((link) => (
        <a
          className="acc-row"
          href={link.url}
          key={`${link.titulo}-${link.url}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="acc-ico">
            <span className="material-symbols-rounded">{TIPO_GLYPH[link.tipo] || "link"}</span>
          </span>
          <span className="acc-title">{link.titulo}</span>
          {link.interno && !externo ? <span className="badge-int">Interno</span> : null}
          <span className="material-symbols-rounded chev">chevron_right</span>
        </a>
      ))}
    </div>
  );
}

export default async function AreaPage({ params, searchParams }: Props) {
  const [{ areaId }, query] = await Promise.all([params, searchParams]);
  const mode = query.modo === "externo" ? "externo" : "interno";
  const externo = mode === "externo";
  const [brand, area, flujo] = await Promise.all([
    getBrand(),
    getPublicArea(areaId, mode),
    getFlujoAtencion()
  ]);

  const publicUrl = areaUrl(area.id, mode);

  // Mismo criterio que accesosHtml() en AccesosClient.html: primero los accesos sin sección
  // (o con sección inexistente), luego cada sección con su nombre.
  const seccionesValidas = new Set(area.secciones.map((s) => s.id));
  const sinSeccion = area.links.filter((l) => !l.seccionId || !seccionesValidas.has(l.seccionId));

  return (
    <div
      className="wrap"
      style={
        {
          "--c-app-bg": brand.colorAppBg,
          "--c-surface": brand.colorSurface,
          "--c-texto": brand.colorTexto,
          "--c-muted": brand.colorMuted,
          "--c-primario": brand.colorPrimario,
          "--c-secundario": brand.colorSecundario,
          "--c-borde": brand.colorBorde
        } as React.CSSProperties
      }
    >
      <div className="ficha">
        <div
          className="banner"
          style={{
            background: `linear-gradient(120deg, ${brand.colorPrimario}, ${brand.colorSecundario})`
          }}
        >
          {area.portadaUrl ? (
            <div className="banner-cover" style={{ backgroundImage: `url(${area.portadaUrl})` }} />
          ) : null}
          <div className="banner-scrim" />
          <div className="banner-caption">
            {brand.logoUrl ? (
              <div className="banner-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="banner-logo" src={brand.logoUrl} alt="" />
              </div>
            ) : null}
            <div className="banner-title">{area.area}</div>
            {area.abreviatura ? <div className="banner-abbr">{area.abreviatura}</div> : null}
          </div>
        </div>

        <div className="ficha-body">
          <div className="contact">
            {area.whatsappCorp ? (
              <div className="c-block">
                <span className="c-ico phone">
                  <span className="material-symbols-rounded">call</span>
                </span>
                <span className="c-val">{area.whatsappCorp}</span>
                <a className="wa-btn" href={waHref(area.whatsappCorp)} target="_blank" rel="noreferrer">
                  <span className="material-symbols-rounded">forum</span>
                  Escríbeme al WhatsApp
                </a>
              </div>
            ) : (
              <div className="c-block">
                <span className="c-ico phone disabled">
                  <span className="material-symbols-rounded">call</span>
                </span>
                <span className="c-val muted">Sin WhatsApp</span>
              </div>
            )}
            {area.mailGrupal ? (
              <div className="c-block">
                <a className="c-ico mail" href={mailHref(area.mailGrupal)} title="Manda un correo">
                  <span className="material-symbols-rounded">mail</span>
                </a>
                <a className="c-val link" href={mailHref(area.mailGrupal)}>
                  {area.mailGrupal}
                </a>
              </div>
            ) : (
              <div className="c-block">
                <span className="c-ico mail disabled" title="Sin correo">
                  <span className="material-symbols-rounded">mail</span>
                </span>
                <span className="c-val muted">Sin correo</span>
              </div>
            )}
          </div>

          {area.equipo.length ? (
            <details className="team-card-details">
              <summary className="team-card">
                <span className="team-ico ico-equipo">
                  <span className="material-symbols-rounded">groups</span>
                </span>
                <span className="t-meta">
                  <span className="t-title">Conocer al equipo</span>
                  <br />
                  <span className="t-sub">
                    {area.equipo.length} integrante{area.equipo.length === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="material-symbols-rounded chev">chevron_right</span>
              </summary>
              <div className="team-card-body">
                {area.equipo.map((member) => (
                  <div className="member" key={`${member.nombre}-${member.email}`}>
                    <div className="avatar">{initials(member.nombre)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="m-name">
                        {member.nombre}
                        <EstadoPill estado={member.estadoMostrado} />
                      </div>
                      {member.cargo ? <div className="m-cargo">{member.cargo}</div> : null}
                      {member.estadoNota ? <div className="m-nota">{member.estadoNota}</div> : null}
                      {member.email ? (
                        <div className="m-line">
                          <a href={mailHref(member.email)}>{member.email}</a>
                        </div>
                      ) : null}
                      {member.movil ? (
                        <div className="m-line">
                          <a href={waHref(member.movil)} target="_blank" rel="noreferrer">
                            {member.movil}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          {flujo && flujo.rows.length ? (
            <details className="team-card-details">
              <summary className="team-card">
                <span className="team-ico ico-flujo">
                  <span className="material-symbols-rounded">support_agent</span>
                </span>
                <span className="t-meta">
                  <span className="t-title">Flujo de atención</span>
                  <br />
                  <span className="t-sub">Guía rápida de contacto</span>
                </span>
                <span className="material-symbols-rounded chev">chevron_right</span>
              </summary>
              <div className="team-card-body flujo-table-wrap">
                <table className="flujo-table">
                  <thead>
                    <tr>
                      {flujo.headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flujo.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}

          <div className="acc-head">Accesos rápidos</div>
          {area.links.length ? (
            <>
              {sinSeccion.length ? <AccesosList links={sinSeccion} externo={externo} /> : null}
              {area.secciones.map((seccion) => {
                const grupo = area.links.filter((l) => l.seccionId === seccion.id);
                if (!grupo.length) return null;
                return (
                  <div key={seccion.id}>
                    <div className="acc-section-title">{seccion.nombre}</div>
                    <AccesosList links={grupo} externo={externo} />
                  </div>
                );
              })}
            </>
          ) : (
            <div className="empty">Sin accesos por ahora.</div>
          )}

          <div className="ficha-foot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="qr" src={qrSrc(publicUrl)} alt={`Código QR del área ${area.area}`} />
            <div className="foot-help">Este QR y enlace son para uso {externo ? "externo" : "interno"}.</div>
          </div>
        </div>
      </div>

      <Footer areaActual={area.area} />
    </div>
  );
}
