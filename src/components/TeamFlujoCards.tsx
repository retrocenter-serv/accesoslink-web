"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { ESTADO_PILL, initials, mailHref, waHref } from "@/lib/format";
import type { FlujoAtencion, TeamDirectoryMember } from "@/types";

function EstadoPill({ estado }: { estado: TeamDirectoryMember["estadoMostrado"] }) {
  const info = ESTADO_PILL[estado] || ESTADO_PILL.PRESENTE;
  return <span className={`m-estado ${info.cls}`}>{info.etiqueta}</span>;
}

export function TeamFlujoCards({
  equipo,
  flujo
}: {
  equipo: TeamDirectoryMember[];
  flujo: FlujoAtencion | null;
}) {
  const [modal, setModal] = useState<null | "equipo" | "flujo">(null);
  const hayFlujo = !!(flujo && flujo.rows.length);

  return (
    <>
      {equipo.length ? (
        <button type="button" className="team-card" onClick={() => setModal("equipo")}>
          <span className="team-ico ico-equipo">
            <span className="material-symbols-rounded">groups</span>
          </span>
          <span className="t-meta">
            <span className="t-title">Conocer al equipo</span>
            <br />
            <span className="t-sub">
              {equipo.length} integrante{equipo.length === 1 ? "" : "s"}
            </span>
          </span>
          <span className="material-symbols-rounded chev">chevron_right</span>
        </button>
      ) : null}

      {hayFlujo ? (
        <button type="button" className="team-card" onClick={() => setModal("flujo")}>
          <span className="team-ico ico-flujo">
            <span className="material-symbols-rounded">support_agent</span>
          </span>
          <span className="t-meta">
            <span className="t-title">Flujo de atención</span>
            <br />
            <span className="t-sub">Guía rápida de contacto</span>
          </span>
          <span className="material-symbols-rounded chev">chevron_right</span>
        </button>
      ) : null}

      {modal === "equipo" ? (
        <Modal title="Conocer al equipo" onClose={() => setModal(null)}>
          <div className="team-card-body">
            {equipo.map((member) => (
              <div className="member" key={`${member.nombre}-${member.email}`}>
                <div className="avatar">{initials(member.nombre)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="m-name">
                    {member.nombre}
                    <EstadoPill estado={member.estadoMostrado} />
                  </div>
                  {member.cargo ? <div className="m-cargo">{member.cargo}</div> : null}
                  {member.estadoNota ? <div className="m-nota">{member.estadoNota}</div> : null}
                  {member.email ? (
                    <div className="m-line">
                      <a href={mailHref(member.email)}>{member.email}</a>
                    </div>
                  ) : null}
                  {member.movil ? (
                    <div className="m-line">
                      <a href={waHref(member.movil)} target="_blank" rel="noreferrer">
                        {member.movil}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {modal === "flujo" && flujo ? (
        <Modal title="Flujo de atención" onClose={() => setModal(null)}>
          <div className="team-card-body flujo-cards-wrap">
            {flujo.rows.map((row, i) => (
              <div className="flujo-card" key={i}>
                {row.map((cell, j) =>
                  cell ? (
                    <div className="flujo-card-row" key={j}>
                      <span className="flujo-card-label">{flujo.headers[j]}</span>
                      <span className="flujo-card-value">{cell}</span>
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
