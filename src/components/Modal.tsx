"use client";

/** Modal compartido: fondo oscuro + tarjeta centrada + X arriba a la derecha, click afuera cierra. */
export function Modal({
  title,
  onClose,
  children,
  wide,
  extraClassName
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  extraClassName?: string;
}) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div
        className={`modal-card${wide ? " modal-card-wide" : ""}${extraClassName ? ` ${extraClassName}` : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close-x" onClick={onClose} aria-label="Cerrar">
          <span className="material-symbols-rounded">close</span>
        </button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}
