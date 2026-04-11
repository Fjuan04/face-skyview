import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import PermissionModal from "./PermissionModal";
import CreateAmbientModal from "./CreateAmbientModal";
import { Search, X, Plus, Trash2 } from "lucide-react";

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
  extraordinary?: boolean;
  extraordinary_message?: string;
}

/* Component  */
export default function ListadoAmbientes() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionAmbient, setPermissionAmbient] = useState<Ambiente | null>(null);
  const [isAddingAmbient, setIsAddingAmbient] = useState(false);

  const fetchAmbientes = () => {
    setIsLoading(true);
    api
      .get("/ambients")
      .then((data) => setAmbientes(data as Ambiente[]))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAmbientes();
  }, []);
 
  const filteredAmbientes = ambientes.filter((amb) =>
    amb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (ambientId: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el ambiente "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/ambients/${ambientId}`);
      setAmbientes(prev => prev.filter(a => a.id !== ambientId));
    } catch (error) {
      console.error("Error deleting ambient:", error);
      alert("No se pudo eliminar el ambiente.");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">
              Gestión de ambientes
            </p>
            <h2
              className="font-plus text-white font-bold"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", lineHeight: 1.1 }}
            >
              Ambientes
            </h2>
          </div>
          <button
            onClick={() => setIsAddingAmbient(true)}
            className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-lg font-plus font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Nuevo Ambiente</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-white/20 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar ambiente por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/20 hover:text-white/60 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-6 h-px bg-white/10 w-full" />
      </div>

      {/* List */}
      <ul className="flex flex-col gap-3">
        {isLoading && (
          <p className="text-white/40 text-sm font-plus text-center py-10">Cargando...</p>
        )}
        {!isLoading && filteredAmbientes.map((amb, i) => {
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
                  {!amb.extraordinary && amb.clase && (
                    <p className="truncate" title={amb.clase}>
                      <span className="text-white/30">Clase:</span> <span className="text-white/80">{amb.clase}</span>
                    </p>
                  )}
                  {!amb.extraordinary && amb.docente && (
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

              {/* Extraordinary Alert for Admin */}
              {amb.extraordinary && amb.extraordinary_message && (
                <div className="mt-2.5 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-[3px] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-widest text-indigo-400 font-bold mb-0.5">Aviso importante</span>
                    <p className="text-[10px] text-indigo-300 font-mono leading-tight">
                      {amb.extraordinary_message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <span
                className={`
                  text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-[2px]
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
                    h-8 px-3
                    backdrop-blur-sm border border-white/20 rounded-[3px]
                    text-white/80 hover:text-white text-[10px] font-plus uppercase tracking-wider
                    transition-colors hover:bg-white/10
                  `}
                >
                  Permisos
                </button>
                <button
                  onClick={() => handleDelete(amb.id, amb.name)}
                  className="h-8 w-8 flex items-center justify-center border border-red-500/20 rounded-[3px] text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar ambiente"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.li>
        )})}

        {!isLoading && filteredAmbientes.length === 0 && (
          <p className="text-white/30 text-sm font-plus text-center py-10 italic">
            {searchTerm ? `No se encontraron ambientes que coincidan con "${searchTerm}"` : 'No hay ambientes registrados'}
          </p>
        )}
      </ul>

      <AnimatePresence>
        {permissionAmbient && (
          <PermissionModal 
            ambientId={permissionAmbient.id}
            ambientName={permissionAmbient.name}
            onClose={() => setPermissionAmbient(null)}
          />
        )}

        {isAddingAmbient && (
          <CreateAmbientModal 
            onClose={() => setIsAddingAmbient(false)}
            onSuccess={fetchAmbientes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
