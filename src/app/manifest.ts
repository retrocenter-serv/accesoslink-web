import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AccesosLink",
    short_name: "AccesosLink",
    description: "Directorio de accesos por area.",
    start_url: "/",
    display: "standalone",
    background_color: "#e9f3fc",
    theme_color: "#004a99",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
