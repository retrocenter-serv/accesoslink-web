import Link from "next/link";
import { getAreaSummaries, getBrand } from "@/lib/areas";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [brand, areas] = await Promise.all([getBrand(), getAreaSummaries()]);

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
      <div className="hdr">
        <div className="hdr-brand">
          {brand.logoUrl ? (
            <div className="hdr-logo-group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hdr-logo" src={brand.logoUrl} alt={brand.nombreEmpresa} />
              <div className="hdr-logo-sep" />
            </div>
          ) : null}
          <div>
            <h1 className="hdr-title">{brand.nombreEmpresa}</h1>
            <div className="hdr-sub">Directorio de accesos por área</div>
          </div>
        </div>
      </div>

      <div className="area-list" aria-label="Áreas disponibles">
        {areas.map((area) => (
          <Link className="area-row" href={`/${area.id}`} key={area.id}>
            <span className="area-ico">
              <span className="material-symbols-rounded">{area.simbolo || "folder"}</span>
            </span>
            <span className="area-meta">
              <div className="area-name">{area.area}</div>
              <div className="area-count">
                {area.count} acceso{area.count === 1 ? "" : "s"}
              </div>
            </span>
            <span className="material-symbols-rounded chev">chevron_right</span>
          </Link>
        ))}

        {!areas.length ? <div className="empty">Aún no hay áreas publicadas.</div> : null}
      </div>

      <Footer />
    </div>
  );
}
