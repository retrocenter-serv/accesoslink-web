/**
 * Slugs "bonitos" para accesos.tdemperu.com/{slug} — mapeo manual, uno por área, porque el
 * ID real del área en el Sheet (columna ID_AREA) suele ser algo generado como
 * "nueva-area-9c3dcd", no algo que se quiera imprimir en un QR o compartir en una auditoría.
 *
 * Es un REWRITE (no un redirect): la URL que ve el visitante se queda tal cual
 * (accesos.tdemperu.com/tic), nunca salta a la URL real por debajo — a diferencia de lo que se
 * podía lograr con GAS detrás de un .htaccess de cPanel (ahí solo era posible un redirect
 * visible, porque cPanel y GAS son servidores distintos). Acá Netlify SÍ es el servidor real,
 * así que puede resolver esto internamente sin que el navegador note nada.
 *
 * Para agregar un área nueva: una línea más abajo, con su propio ID_AREA real. Como esto vive en
 * el código (no en el Sheet), un cambio acá requiere un nuevo commit + deploy — no hace falta
 * tocar cPanel para nada de esto.
 */
const SLUGS = {
  tic: "nueva-area-9c3dcd"
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return Object.entries(SLUGS).map(([slug, areaId]) => ({
      source: `/${slug}`,
      destination: `/${areaId}`
    }));
  }
};

export default nextConfig;
