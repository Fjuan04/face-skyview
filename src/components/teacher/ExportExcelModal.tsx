import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { X, Calendar, FileDown, AlertCircle, Loader2 } from "lucide-react";

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStartDate?: string;
}

export default function ExportExcelModal({ isOpen, onClose, defaultStartDate }: ExportExcelModalProps) {
  const [startDate, setStartDate] = useState(defaultStartDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Por favor selecciona ambas fechas.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const filename = `Reporte_Clases_${startDate}_a_${endDate}.xlsx`;
      await api.download(`/schedules/export?start_date=${startDate}&end_date=${endDate}`, filename);
      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err?.message || "No se pudo generar el reporte. Verifica el rango de fechas.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/5 bg-white/[0.02]">
            <button
              onClick={onClose}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <FileDown size={16} className="text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Exportar a Excel</h2>
              </div>
              <p className="text-xs text-white/40 mt-1">Selecciona el rango de fechas para generar el reporte de clases y asistencia.</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-5">
              {/* Start Date */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 ml-1 flex items-center gap-2">
                  <Calendar size={12} className="text-emerald-400/50" /> Fecha Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-full [color-scheme:dark]"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 ml-1 flex items-center gap-2">
                  <Calendar size={12} className="text-emerald-400/50" /> Fecha Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-full [color-scheme:dark]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex flex-col gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] border
                ${isExporting 
                  ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400/20 text-white'
                }
              `}
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generando archivo...
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  Descargar Reporte
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
