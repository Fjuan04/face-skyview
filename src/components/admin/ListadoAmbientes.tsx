import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import PermissionModal from "./PermissionModal";

export interface Ambiente {
  id: number;
  name: string;
  state: string;
  capacity: number;
  isOccupied: boolean;
  docente?: string;
  ficha?: string;
  clase?: string;
  horario?: string;
}

/* Component  */
export default function ListadoAmbientes() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionAmbient, setPermissionAmbient] = useState<Ambiente | null>(null);

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
            className={`
              flex justify-between
              bg-white/5 border border-white/10 rounded-[3px]
              px-5 py-4 gap-4
              ${isDisponible ? 'items-center' : 'items-start'}
            `}
          >
            {/* Info */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-white font-plus font-semibold truncate">
                {amb.name}
              </span>
              
              {!isDisponible ? (
                <div className="mt-2 flex flex-col gap-1.5 text-white/50 text-xs font-mono">
                  {amb.ficha && (
                    <p><span className="text-white/30">Ficha:</span> <span className="text-white/80">{amb.ficha}</span></p>
                  )}
                  {amb.clase && (
                    <p className="truncate" title={amb.clase}>
                      <span className="text-white/30">Clase:</span> <span className="text-white/80">{amb.clase}</span>
                    </p>
                  )}
                  {amb.docente && (
                    <p><span className="text-white/30">Docente:</span> <span className="text-white/80">{amb.docente}</span></p>
                  )}
                  {amb.horario && (
                    <p><span className="text-white/30">Horario:</span> <span className="text-white/80">{amb.horario}</span></p>
                  )}
                </div>
              ) : (
                <span className="text-white/40 text-xs font-mono">
                  {amb.capacity > 0 ? `${amb.capacity} personas de capacidad` : 'Capacidad sin definir'}
                </span>
              )}
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPermissionAmbient(amb)}
                className={`
                  shrink-0 h-9 px-4
                  backdrop-blur-sm border border-white/20 rounded-[3px]
                  text-white/80 hover:text-white text-xs font-plus uppercase tracking-wider
                  transition-colors hover:bg-white/10
                `}
              >
                Permisos
              </button>

              {!isDisponible && (
                <button
                  onClick={() => handleToggle(amb.id, amb.isOccupied)}
                  className="shrink-0 h-9 px-4 backdrop-blur-sm border border-white/20 rounded-[3px] text-white text-xs font-plus uppercase tracking-wider transition-colors hover:bg-orange-500/20"
                >
                  Liberar
                </button>
              )}
            </div>
          </motion.li>
        )})}

        {!isLoading && ambientes.length === 0 && (
          <p className="text-white/30 text-sm font-plus text-center py-10">
            No hay ambientes registrados
          </p>
        )}
      </ul>

      {permissionAmbient && (
        <PermissionModal 
          ambientId={permissionAmbient.id}
          ambientName={permissionAmbient.name}
          onClose={() => setPermissionAmbient(null)}
        />
      )}
    </div>
  );
}