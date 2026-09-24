import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AccesosLink",
    template: "%s | AccesosLink"
  },
  description: "Directorio de accesos por area.",
  applicationName: "AccesosLink",
  appleWebApp: {
    capable: true,
    title: "AccesosLink",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9f3fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Misma tipografia que el sistema GAS (GlobalStyles.html): Poppins + Material Symbols Rounded. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Bloqueante a propósito (sin async/defer): aplica el tema guardado ANTES del primer
            pintado, para que no haya un parpadeo del tema equivocado al cargar. Ver ThemeToggle.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('accesoslink-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
