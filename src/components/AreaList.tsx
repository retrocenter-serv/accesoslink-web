"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AreaSummary } from "@/types";

export function AreaList({ areas }: { areas: AreaSummary[] }) {
  const [query, setQuery] = useState("");

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter((a) => a.area.toLowerCase().includes(q));
  }, [areas, query]);

  return (
    <>
      {areas.length > 5 ? (
        <div className="search">
          <span className="material-symbols-rounded">search</span>
          <input
            placeholder="Buscar área…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar área"
          />
        </div>
      ) : null}

      <div className="area-list" aria-label="Áreas disponibles">
        {filtradas.map((area, i) => (
          <Link
            className="area-row"
            href={`/${area.id}`}
            key={area.id}
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <span className="area-ico">
              <span className="material-symbols-rounded">{area.simbolo || "folder"}</span>
            </span>
            <span className="area-meta">
              <div className="area-name">{area.area}</div>
              <div className="area-count">
                {area.count} acceso{area.count === 1 ? "" : "s"}
              </div>
            </span>
            <span className="material-symbols-rounded chev">chevron_right</span>
          </Link>
        ))}

        {!filtradas.length ? (
          <div className="empty">
            {areas.length ? "Ningún área coincide con la búsqueda." : "Aún no hay áreas publicadas."}
          </div>
        ) : null}
      </div>
    </>
  );
}
