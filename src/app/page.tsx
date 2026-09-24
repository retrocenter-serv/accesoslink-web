import { getAreaSummaries, getBrand } from "@/lib/areas";
import { Footer } from "@/components/Footer";
import { AreaList } from "@/components/AreaList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [brand, areas] = await Promise.all([getBrand(), getAreaSummaries()]);

  return (
    <div
      className="wrap"
      style={
        {
          // Solo el color de marca real (accento) se inyecta — los neutros (fondo, superficie,
          // texto, bordes) se quedan en la hoja de estilo para que el modo oscuro del visitante
          // pueda aplicar (ver globals.css: un valor inline nunca lo puede sobreescribir un @media).
          "--c-primario": brand.colorPrimario,
          "--c-secundario": brand.colorSecundario
        } as React.CSSProperties
      }
    >
      <div className="hdr hdr-hero">
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

      <AreaList areas={areas} />

      <Footer />
    </div>
  );
}
