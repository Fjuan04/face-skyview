import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check, Server } from "lucide-react";
import { api } from "@/lib/api";

interface CreateAmbientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface CronodeAmbient {
  id: number;
  name: string;
}

export default function CreateAmbientModal({ onClose, onSuccess }: CreateAmbientModalProps) {
  const [ambientes, setAmbientes] = useState<CronodeAmbient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAmbientId, setSelectedAmbientId] = useState<number | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCronodeAmbients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get("/ambients/cronode");
        // Check if data is array or has a data property
        if (Array.isArray(data)) {
          setAmbientes(data);
        } else if (data && Array.isArray(data.data)) {
          setAmbientes(data.data);
        }
      } catch (err: any) {
        console.error("Error fetching cronode ambients:", err);
        setError("Error al obtener ambientes de Cronode.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCronodeAmbients();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAmbientId || !ipAddress) return;
    
    const selectedAmbient = ambientes.find(a => a.id === selectedAmbientId);
    if (!selectedAmbient) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/ambients", {
        ambient_id: selectedAmbientId,
        name: selectedAmbient.name,
        ip_address: ipAddress,
      });
      setSuccess(true);
      onSuccess();
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrar el ambiente.");
      setIsSubmitting(false);
    }
  };

  const filteredAmbients = ambientes.filter((amb) =>
    amb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pt-24">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSubmitting && !success ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-plus font-bold text-white">Registrar Ambiente</h3>
            <p className="text-white/50 text-sm font-plus">Selecciona un ambiente de Cronode y asigna una IP</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || success}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        {success ? (
          <div className="p-10 flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Check size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-plus text-lg font-bold">Ambiente registrado exitosamente</p>
          </div>
        ) : (
          <div 
            className="p-6 overflow-y-auto flex-1 flex flex-col gap-6"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            
            {/* Sec 1: Ambient Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Search size={14} /> Selecciona el ambiente
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar ambiente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-lg pl-11 pr-4 py-3 text-white text-[15px] outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div 
                className="border border-white/10 rounded-lg bg-black/20 flex flex-col max-h-52 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
              >
                {isLoading ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">Cargando ambientes...</p>
                ) : filteredAmbients.length === 0 ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">No se encontraron ambientes.</p>
                ) : (
                  <div className="flex flex-col p-2 gap-1">
                    {filteredAmbients.map((amb) => {
                      const isSelected = selectedAmbientId === amb.id;
                      return (
                        <button
                          key={amb.id}
                          onClick={() => setSelectedAmbientId(amb.id)}
                          className={`
                            relative text-left px-4 py-3 rounded-md flex justify-between items-center transition-all duration-300
                            cursor-pointer hover:bg-white/[0.04]
                            ${isSelected ? "bg-emerald-500/10 border border-emerald-500/20" : "border border-transparent"}
                          `}
                        >
                          <span className={`font-plus font-medium ${isSelected ? "text-emerald-400" : "text-white"} text-sm transition-colors`}>
                            {amb.name}
                          </span>
                          
                          <div className={`
                            shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all
                            ${isSelected ? "border-emerald-500 bg-emerald-500" : "border-white/10"}
                          `}>
                            {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sec 2: IP Address Input */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Server size={14} /> Dirección IP
              </label>
              <input
                type="text"
                placeholder="Ej: 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white text-[15px] outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Error handling inline */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm font-plus">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* Footer Actions */}
        {!success && (
          <div className="p-5 border-t border-white/10 bg-white/[0.02] flex gap-3 justify-end items-center">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-white/60 hover:text-white font-plus text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAmbientId || !ipAddress || isSubmitting}
              className={`
                px-6 py-2.5 rounded-lg font-plus font-bold text-sm tracking-wide transition-all shadow-lg flex items-center gap-2
                ${(!selectedAmbientId || !ipAddress || isSubmitting) 
                  ? "bg-white/10 text-white/40 cursor-not-allowed" 
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"}
              `}
            >
              {isSubmitting ? (
                 <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Registrando...</>
              ) : "Registrar Ambiente"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
