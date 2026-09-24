import type { Metadata } from "next";
import { areaUrl } from "@/lib/config";
import { getBrand, getPublicArea } from "@/lib/areas";
import { getFlujoAtencion } from "@/lib/flujo";
import { mailHref, qrSrc, TIPO_GLYPH, waHref } from "@/lib/format";
import { Footer } from "@/components/Footer";
import { ShareActions } from "@/components/ShareActions";
import { TeamFlujoCards } from "@/components/TeamFlujoCards";
import type { AreaLink } from "@/types";

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

function AccesosList({ links, externo }: { links: AreaLink[]; externo: boolean }) {
  return (
    <div className="acc-list">
      {links.map((link, i) => (
        <a
          className="acc-row"
          href={link.url}
          key={`${link.titulo}-${link.url}`}
          target="_blank"
          rel="noreferrer"
          style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
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
          // Solo el color de marca real (accento) se inyecta — ver el mismo comentario en page.tsx.
          "--c-primario": brand.colorPrimario,
          "--c-secundario": brand.colorSecundario
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

          <ShareActions area={area.area} url={publicUrl} encargado={area.encargado} />

          <TeamFlujoCards equipo={area.equipo} flujo={flujo} />

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
