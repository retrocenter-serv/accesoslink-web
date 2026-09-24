"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "accesoslink-theme";

/**
 * Switch de modo oscuro manual. El script bloqueante en layout.tsx ya aplicó data-theme antes
 * de pintar (evita el parpadeo de tema equivocado); este componente solo refleja ese estado y
 * permite cambiarlo. Sin elección guardada, el switch arranca en el estado real ya aplicado por
 * el navegador (@media prefers-color-scheme), y a partir del primer toque queda fijo.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");
    if (actual === "dark") setDark(true);
    else if (actual === "light") setDark(false);
    else setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage bloqueado (navegación privada, etc.): el tema igual cambia para esta vista.
    }
  }

  return (
    <button
      type="button"
      className="theme-switch"
      onClick={toggle}
      aria-pressed={dark}
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span className="theme-switch-track">
        <span className="theme-switch-thumb">
          <span className="material-symbols-rounded">{dark ? "dark_mode" : "light_mode"}</span>
        </span>
      </span>
    </button>
  );
}
