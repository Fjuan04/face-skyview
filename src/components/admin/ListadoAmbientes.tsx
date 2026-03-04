import { motion } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────── */
export interface Ambiente {
  id: number;
  nombre: string;
  capacidad: number;
  ocupacion: number;
  abierto: boolean;
}

interface AmbientesListProps {
  ambientes: Ambiente[];
  onToggle: (id: number, abierto: boolean) => void;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ListadoAmbientes({ ambientes, onToggle }: AmbientesListProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">
          Gestión de ambientes
        </p>
        <h2
          className="font-plus text-white font-bold"
          style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1 }}
        >
          Ambientes
        </h2>
        <div className="mt-4 h-px bg-white/10 w-full" />
      </div>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {ambientes.map((amb, i) => (
          <motion.li
            key={amb.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: "easeOut" }}
            className="
              flex items-center justify-between
              bg-white/5 border border-white/10 rounded-[3px]
              px-5 py-4 gap-4
            "
          >
            {/* Info */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-white font-plus font-semibold truncate">
                {amb.nombre}
              </span>
              <span className="text-white/40 text-xs font-mono">
                {amb.ocupacion} / {amb.capacidad} ocupantes
              </span>
            </div>

            {/* Status badge */}
            <span
              className={`
                text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-[2px] shrink-0
                ${amb.abierto
                  ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                  : "text-red-400 bg-red-400/10 border border-red-400/20"}
              `}
            >
              {amb.abierto ? "Abierto" : "Cerrado"}
            </span>

            {/* Toggle button */}
            <button
              onClick={() => onToggle(amb.id, !amb.abierto)}
              className="
                shrink-0 h-9 px-4
                backdrop-blur-sm border border-white/20 rounded-[3px]
                text-white text-xs font-plus uppercase tracking-wider
                hover:bg-white/10 transition-colors
              "
            >
              {amb.abierto ? "Cerrar" : "Abrir"}
            </button>
          </motion.li>
        ))}

        {ambientes.length === 0 && (
          <p className="text-white/30 text-sm font-plus text-center py-10">
            No hay ambientes registrados
          </p>
        )}
      </ul>
    </div>
  );
}