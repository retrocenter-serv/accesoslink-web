"use client";

import { useState } from "react";
import { Modal as ModalShell } from "@/components/Modal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_CHANGELOG, APP_VERSION, APP_VERSION_FECHA } from "@/lib/config";

type ModalKind = "novedades" | "privacidad" | "reportar" | null;

function NovedadesModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Novedades" onClose={onClose} wide>
      <div className="modal-desc">Versión actual: {APP_VERSION}</div>
      {APP_CHANGELOG.map((n) => (
        <div className="novedad-item" key={n.version}>
          <div className="novedad-head">
            <span className="novedad-version">v{n.version}</span>
            <span className="novedad-fecha">{n.fecha}</span>
          </div>
          {n.titulo ? <div className="novedad-titulo">{n.titulo}</div> : null}
          <ul className="novedad-lista">
            {n.cambios.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      ))}
      <div className="modal-actions">
        <button className="btn-main" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </ModalShell>
  );
}

function PrivacidadModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Política de Privacidad" onClose={onClose} wide>
      <p className="modal-desc" style={{ textAlign: "left" }}>
        Este directorio muestra datos de contacto y disponibilidad del equipo de cada área
        (nombre, cargo, correo, celular y estado del día) para que cualquier persona pueda ubicar
        rápidamente a quién consultar, incluso cuando el encargado del área no está disponible.
      </p>
      <p className="modal-desc" style={{ textAlign: "left" }}>
        Esta información la ingresa y mantiene el propio encargado o editor del área desde el
        panel de administración de GAS — no se recopila de ninguna otra fuente. Este sitio solo
        lee esa información; no la edita.
      </p>
      <p className="modal-desc" style={{ textAlign: "left" }}>
        El acceso a cada ficha de área es mediante enlace directo o código QR: cualquier persona
        que lo tenga puede ver ese contenido. Por eso, evita registrar información sensible
        adicional (contraseñas, documentos de identidad, datos bancarios) en los campos de
        nombre, cargo o nota de estado.
      </p>
      <p className="modal-desc" style={{ textAlign: "left" }}>
        Para corregir, actualizar o solicitar la eliminación de algún dato personal mostrado
        aquí, contacta al Área TIC.
      </p>
      <div className="modal-actions">
        <button className="btn-main" onClick={onClose}>
          Entendido
        </button>
      </div>
    </ModalShell>
  );
}

function ReportarModal({ areaActual, onClose }: { areaActual: string; onClose: () => void }) {
  const [area, setArea] = useState(areaActual);
  const [descripcion, setDescripcion] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function enviar() {
    if (!descripcion.trim()) {
      setError("Describe el problema antes de enviarlo.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/reportar-problema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, descripcion, correoContacto })
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "No se pudo enviar el reporte.");
        setBusy(false);
        return;
      }
      setOk(true);
    } catch {
      setError("Error de comunicación con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <ModalShell title="¡Gracias!" onClose={onClose}>
        <div className="modal-desc">Tu reporte fue enviado. El equipo TIC lo revisará.</div>
        <div className="modal-actions">
          <button className="btn-main" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Reportar un problema" onClose={onClose}>
      <div className="modal-desc">
        Cuéntanos qué encontraste mal — un enlace roto, un dato incorrecto, algo que no carga.
      </div>
      <div className="lbl">Área (opcional)</div>
      <input
        className="inp"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        placeholder="¿En qué área lo notaste?"
        disabled={busy}
      />
      <div className="lbl">
        Describe el problema <span className="req-mark">*</span>
      </div>
      <textarea
        className="inp"
        rows={4}
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="¿Qué pasó? ¿Dónde?"
        disabled={busy}
      />
      <div className="lbl">Tu correo (opcional, solo si quieres que te respondamos)</div>
      <input
        className="inp"
        value={correoContacto}
        onChange={(e) => setCorreoContacto(e.target.value)}
        placeholder="tu.correo@empresa.com"
        disabled={busy}
      />
      {error ? <div className="err-text">{error}</div> : null}
      <div className="modal-actions">
        <button className="btn-sec" onClick={onClose} disabled={busy}>
          Cancelar
        </button>
        <button className="btn-main" onClick={enviar} disabled={busy}>
          {busy ? "Enviando…" : "Enviar reporte"}
        </button>
      </div>
    </ModalShell>
  );
}

export function Footer({ areaActual = "" }: { areaActual?: string }) {
  const [modal, setModal] = useState<ModalKind>(null);

  return (
    <>
      <footer className="app-footer">
        <span className="app-footer-version">
          v{APP_VERSION} · {APP_VERSION_FECHA}
        </span>
        <ThemeToggle />
        <button type="button" className="app-footer-btn" onClick={() => setModal("novedades")}>
          Novedades
        </button>
        <button type="button" className="app-footer-btn" onClick={() => setModal("reportar")}>
          <span className="material-symbols-rounded">bug_report</span>
          Reportar un problema
        </button>
        <button type="button" className="app-footer-btn" onClick={() => setModal("privacidad")}>
          Política de Privacidad
        </button>
      </footer>
      {modal === "novedades" ? <NovedadesModal onClose={() => setModal(null)} /> : null}
      {modal === "privacidad" ? <PrivacidadModal onClose={() => setModal(null)} /> : null}
      {modal === "reportar" ? (
        <ReportarModal areaActual={areaActual} onClose={() => setModal(null)} />
      ) : null}
    </>
  );
}
