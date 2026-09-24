"use client";

import { useState } from "react";

export function ShareActions({ area, url }: { area: string; url: string }) {
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

  return (
    <div className="share-actions">
      <button type="button" className="share-btn" onClick={compartir}>
        <span className="material-symbols-rounded">ios_share</span>
        Compartir
      </button>
      {aviso ? <span className="share-aviso">{aviso}</span> : null}
    </div>
  );
}
