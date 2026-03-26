import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

/* ─── Types ──────────────────────────────────────────────────── */
export interface Ambiente {
  id: number;
  name: string;
  state: string;
  capacity: number;
  isOccupied: boolean;
}

/* Component  */
export default function ListadoAmbientes() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ambients")
      .then((data) => setAmbientes(data as Ambiente[]))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (id: number, currentOccupied: boolean) => {
    try {
      const newOccupiedState = !currentOccupied;
      await api.put(`/admin/ambientes/${id}`, { isOccupied: newOccupiedState });
      setAmbientes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isOccupied: newOccupiedState } : a)),
      );
    } catch (err) {
      console.error("Error al actualizar ambiente", err);
    }
  };

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
        {isLoading && (
          <p className="text-white/40 text-sm font-plus text-center py-10">Cargando...</p>
        )}
        {!isLoading && ambientes.map((amb, i) => {
          const isDisponible = !amb.isOccupied;
          return (
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
                {amb.name}
              </span>
              <span className="text-white/40 text-xs font-mono">
                {amb.capacity > 0 ? `${amb.capacity} personas de capacidad` : 'Capacidad sin definir'}
              </span>
            </div>

            {/* Status badge */}
            <span
              className={`
                text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-[2px] shrink-0
                ${isDisponible
                  ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                  : "text-orange-400 bg-orange-400/10 border border-orange-400/20"}
              `}
            >
              {isDisponible ? "Disponible" : "Ocupado"}
            </span>

            {/* Toggle button */}
            <button
              onClick={() => handleToggle(amb.id, amb.isOccupied)}
              className={`
                shrink-0 h-9 px-4
                backdrop-blur-sm border border-white/20 rounded-[3px]
                text-white text-xs font-plus uppercase tracking-wider
                transition-colors
                ${isDisponible ? "hover:bg-emerald-500/20" : "hover:bg-orange-500/20"}
              `}
            >
              {isDisponible ? "Dar ingreso" : "Liberar"}
            </button>
          </motion.li>
        )})}

        {!isLoading && ambientes.length === 0 && (
          <p className="text-white/30 text-sm font-plus text-center py-10">
            No hay ambientes registrados
          </p>
        )}
      </ul>
    </div>
  );
}