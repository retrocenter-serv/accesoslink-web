import Link from "next/link";
import { getAreaSummaries, getBrand } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [brand, areas] = await Promise.all([getBrand(), getAreaSummaries()]);

  return (
    <main
      className="shell"
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
        <div className="brandmark">
          <div className="brandmark__logo">
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt="" width="32" height="32" />
            ) : (
              "A"
            )}
          </div>
          <div className="brandmark__name">{brand.nombreEmpresa}</div>
        </div>
      </header>

      <section className="area-index">
        <div>
          <h1>Accesos rapidos por area.</h1>
          <p className="area-index__copy">
            Directorio operativo para compartir herramientas, contactos y
            enlaces internos o externos desde un solo link.
          </p>
        </div>

        <div className="area-list" aria-label="Areas disponibles">
          {areas.map((area) => (
            <Link className="area-row" href={`/${area.id}`} key={area.id}>
              <span className="row-icon">{area.abreviatura || area.area.slice(0, 1)}</span>
              <span>
                <span className="row-title">{area.area}</span>
                <span className="row-meta">
                  {area.count} acceso{area.count === 1 ? "" : "s"}
                </span>
              </span>
              <span className="row-action">Abrir</span>
            </Link>
          ))}

          {!areas.length ? (
            <div className="empty-state">
              Aun no hay areas publicadas en el schema accesoslink.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
