"use client";

import { useState } from "react";
import type { TeamMember } from "@/types";

/** Escapa valores de vCard (RFC 6350): coma, punto y coma y salto de línea. */
function vcardEscape(v: string) {
  return (v || "").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

function buildVCard(area: string, encargado: TeamMember) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vcardEscape(encargado.nombre || area)}`,
    `ORG:${vcardEscape(area)}`
  ];
  if (encargado.cargo) lines.push(`TITLE:${vcardEscape(encargado.cargo)}`);
  if (encargado.movil) lines.push(`TEL;TYPE=CELL:${vcardEscape(encargado.movil)}`);
  if (encargado.email) lines.push(`EMAIL:${vcardEscape(encargado.email)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function ShareActions({
  area,
  url,
  encargado
}: {
  area: string;
  url: string;
  encargado: TeamMember;
}) {
  const [aviso, setAviso] = useState("");

  async function compartir() {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: area, url });
      } catch {
        // el usuario cerró el panel de compartir del sistema: no es un error, no hacer nada más.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setAviso("Enlace copiado");
    } catch {
      setAviso("No se pudo copiar el enlace");
    }
    setTimeout(() => setAviso(""), 2200);
  }

  function guardarContacto() {
    if (!encargado.nombre) return;
    const vcard = buildVCard(area, encargado);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(encargado.nombre || area).replace(/[^\w\s-]/g, "").trim() || "contacto"}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="share-actions">
      <button type="button" className="share-btn" onClick={compartir}>
        <span className="material-symbols-rounded">ios_share</span>
        Compartir
      </button>
      {encargado.nombre ? (
        <button type="button" className="share-btn" onClick={guardarContacto}>
          <span className="material-symbols-rounded">contact_page</span>
          Guardar contacto
        </button>
      ) : null}
      {aviso ? <span className="share-aviso">{aviso}</span> : null}
    </div>
  );
}
