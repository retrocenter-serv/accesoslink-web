import type { Metadata } from "next";
import { areaUrl } from "@/lib/config";
import { getBrand, getPublicArea } from "@/lib/areas";

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

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function AreaPage({ params, searchParams }: Props) {
  const [{ areaId }, query] = await Promise.all([params, searchParams]);
  const mode = query.modo === "externo" ? "externo" : "interno";
  const [brand, area] = await Promise.all([
    getBrand(),
    getPublicArea(areaId, mode)
  ]);

  const sections = new Map(area.secciones.map((section) => [section.id, section.nombre]));
  const linksWithoutSection = area.links.filter((link) => !link.seccionId);
  const publicUrl = areaUrl(area.id, mode);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(publicUrl)}`;

  return (
    <main
      className="profile"
      style={
        {
          "--bg": brand.colorAppBg,
          "--surface": brand.colorSurface,
          "--ink": brand.colorTexto,
          "--muted": brand.colorMuted,
          "--primary": brand.colorPrimario,
          "--secondary": brand.colorSecundario,
          "--border": brand.colorBorde
        } as React.CSSProperties
      }
    >
      <header className="topbar">
        <a className="brandmark" href="/">
          <div className="brandmark__logo">{brand.logoUrl ? " " : "A"}</div>
          <div className="brandmark__name">{brand.nombreEmpresa}</div>
        </a>
      </header>

      <section className="profile-hero">
        <div
          className="profile-cover"
          style={
            area.portadaUrl
              ? { backgroundImage: `linear-gradient(120deg, rgb(0 74 153 / 0.72), transparent), url(${area.portadaUrl})` }
              : undefined
          }
        />
        <div className="profile-head">
          <h1>{area.area}</h1>
          <p className="profile-subtitle">
            {area.encargado.nombre
              ? `${area.encargado.nombre} · ${area.encargado.cargo || "Responsable"}`
              : "Accesos y contactos del area."}
          </p>
          <div className="contact-strip">
            {area.whatsappCorp ? <a href={`https://wa.me/${area.whatsappCorp}`}>WhatsApp</a> : null}
            {area.mailGrupal ? <a href={`mailto:${area.mailGrupal}`}>Correo</a> : null}
            <a href={qrUrl}>QR</a>
          </div>
        </div>
      </section>

      <LinkGroup title="Accesos" links={linksWithoutSection} />

      {area.secciones.map((section) => (
        <LinkGroup
          key={section.id}
          title={sections.get(section.id) || "Seccion"}
          links={area.links.filter((link) => link.seccionId === section.id)}
        />
      ))}

      {area.equipo.length ? (
        <section>
          <h2 className="section-title">Equipo</h2>
          <div className="team-list">
            {area.equipo.map((member) => (
              <div className="team-line" key={`${member.nombre}-${member.email}`}>
                <strong>{member.nombre}</strong>
                <span className="muted">{member.cargo}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function LinkGroup({ title, links }: { title: string; links: { titulo: string; url: string; tipo: string; interno: boolean }[] }) {
  if (!links.length) return null;

  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <div className="link-list">
        {links.map((link) => (
          <a
            className={`link-row${link.interno ? " link-row--internal" : ""}`}
            href={link.url}
            key={`${link.titulo}-${link.url}`}
            rel="noreferrer"
            target="_blank"
          >
            <span className="row-icon">{initials(link.tipo || "Link")}</span>
            <span>
              <span className="row-title">{link.titulo}</span>
              {link.interno ? <span className="row-meta">Interno</span> : null}
            </span>
            <span className="row-action">›</span>
          </a>
        ))}
      </div>
    </section>
  );
}
