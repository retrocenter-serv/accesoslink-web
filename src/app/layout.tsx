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
  themeColor: "#004a99"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
