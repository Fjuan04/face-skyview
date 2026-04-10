import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  X, Clock, Calendar, MapPin, User, Hash,
  Activity, AlertCircle,
  LogOut, LogIn, Coffee, ClipboardList
} from "lucide-react";

interface LogEntry {
  id: number;
  user_id: number;
  device_id: number;
  ambient_id: number;
  event_type: string;
  created_at: string;
  updated_at: string | null;
}

interface DetailedSchedule {
  schedule_info: {
    id: number;
    ambient_id: number;
    user_id: number;
    teacher_name: string;
    codeTab: string;
    class: string;
    start_time: string;
    end_time: string;
    date: string;
    open_by: number | null;
    closed_by: number | null;
    break_time: boolean;
    start_break: string | null;
    end_break: string | null;
    created_at: string;
    updated_at: string;
    ambient: string;
  };
  tracking: {
    is_opened: boolean;
    is_closed: boolean;
    in_break: boolean;
  };
  logs: LogEntry[];
}

interface ScheduleDetailProps {
  scheduleId: number;
  onClose: () => void;
}

export default function ScheduleDetail({ scheduleId, onClose }: ScheduleDetailProps) {
  const [data, setData] = useState<DetailedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/schedules/${scheduleId}`) as { success: boolean, data: DetailedSchedule };
        if (response.success) {
          setData(response.data);
        } else {
          setError("No se pudo obtener la información de la clase.");
        }
      } catch (err) {
        console.error("Error fetching schedule detail:", err);
        setError("Error de conexión al servidor.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [scheduleId]);

  const handleMarkBreak = async () => {
    if (!data || data.schedule_info.break_time) return;

    try {
      await api.post(`/ambients/${data.schedule_info.ambient_id}/break`, {});
      // Re-fetch detail to get updated break_time and potentially start_break/end_break
      const response = await api.get(`/schedules/${scheduleId}`) as { success: boolean, data: DetailedSchedule };
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error al marcar descanso:", err);
      // alert no es lo mas premium, pero es efectivo para este caso de error
      alert("No se pudo marcar el descanso.");
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    const cleanTime = time.includes(" ") ? time.replace(" ", "T") : time;
    const dateObj = new Date(cleanTime);
    if (isNaN(dateObj.getTime())) return time.substring(0, 5);
    return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const s = new Date(start.replace(" ", "T")).getTime();
    const e = new Date(end.replace(" ", "T")).getTime();
    if (isNaN(s) || isNaN(e)) return null;
    const diffMins = Math.floor((e - s) / (1000 * 60));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return h > 0 ? `${h} h ${m} min` : `${m} minutos`;
  };

  // Using Portals to ensure the modal is relative to the viewport, not any container
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-10 backdrop-blur-md bg-black/60"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="relative p-5 px-8 border-b border-white/5 bg-white/[0.02] shrink-0">
          <button
            onClick={onClose}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all border border-transparent hover:border-white/5"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-[0.2em] font-bold">
                Control de Sesión
              </span>
              <div className="h-px w-8 bg-white/10" />
            </div>
            <h2 className="text-lg md:text-xl font-plus font-bold text-white tracking-tight leading-tight">
              {data?.schedule_info.class || "Cargando..."}
            </h2>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                <span className="text-[9px] uppercase font-bold text-white/40">Ficha</span>
                <span className="text-[10px] font-mono text-white/70">{data?.schedule_info.codeTab}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                <Hash size={10} className="text-white/40" />
                <span className="text-[10px] font-mono text-white/70">{scheduleId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Two Column Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 py-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-white/5 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-t-emerald-500 rounded-full animate-spin" />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-white/70 text-sm font-bold tracking-wide">Recuperando registros</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertCircle size={24} className="text-rose-500/60" />
              </div>
              <p className="text-white/60 text-sm max-w-xs">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white transition-all uppercase tracking-widest"
              >
                Regresar
              </button>
            </div>
          ) : data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Left Column: Details & Break */}
              <div className="flex flex-col gap-6">

                {/* Detalles de Programación */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={14} className="text-emerald-400" />
                    <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Programación</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Item 1: Instructor */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <User size={16} className="text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-[0.05em]">Instructor</span>
                        <span className="text-white font-plus text-sm font-bold leading-tight">{data.schedule_info.teacher_name}</span>
                      </div>
                    </div>

                    {/* Item 2: Ambiente */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <MapPin size={16} className="text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-[0.05em]">Ambiente</span>
                        <span className="text-white font-plus text-sm font-bold">{data.schedule_info.ambient}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Item 3: Fecha */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-white/20" />
                          <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Fecha Formación</span>
                        </div>
                        <span className="text-xs font-bold text-white/90">
                          {new Date(data.schedule_info.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Item 4: Horario */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-white/20" />
                          <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Horario Base</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400/90 font-mono">
                          {data.schedule_info.start_time.substring(0, 5)} - {data.schedule_info.end_time.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Estado del Descanso */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Coffee size={14} className="text-orange-400" />
                    <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Descanso</h3>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 text-orange-400/5 rotate-12">
                      <Coffee size={80} />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Estado</span>
                        <div className={`px-2 py-0.5 rounded text-[8px] uppercase font-mono tracking-widest ${data.schedule_info.break_time ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-white/5 text-white/20'}`}>
                          {data.schedule_info.break_time ? "Registrado" : "N/A"}
                        </div>
                      </div>

                      {data.schedule_info.break_time ? (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Salida</span>
                            <span className="text-base font-mono text-white tracking-tight">{formatTime(data.schedule_info.start_break)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Regreso</span>
                            <span className="text-base font-mono text-white tracking-tight">{formatTime(data.schedule_info.end_break)}</span>
                          </div>
                          <div className="col-span-2 py-2 bg-orange-400/5 border border-orange-400/10 rounded-xl flex items-center justify-between px-3 mt-1">
                            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Duración</span>
                            <span className="text-sm font-mono text-orange-400 font-bold">
                              {calculateDuration(data.schedule_info.start_break, data.schedule_info.end_break)}
                            </span>
                          </div>
                          
                          <button
                            disabled
                            className="col-span-2 mt-2 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500/10 text-orange-400/50 border border-orange-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-not-allowed"
                          >
                            <Coffee size={14} />
                            Descanso Registrado
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 py-2 justify-center">
                          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest italic">Sin reporte de descanso</p>
                          
                          {data.tracking.is_opened && !data.tracking.is_closed && (
                            <button
                              onClick={handleMarkBreak}
                              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-orange-500/5 hover:shadow-orange-500/20"
                            >
                              <Coffee size={14} />
                              Marcar Descanso Ahora
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: History */}
              <div className="flex flex-col h-full bg-white/[0.01] border border-white/5 rounded-2xl p-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Actividad</h3>
                  </div>
                  <span className="text-[8px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded">
                    Total: {data.logs.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 max-h-[45vh] lg:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {data.logs && data.logs.length > 0 ? (
                    data.logs.map((log, idx) => (
                      <div key={log.id} className="relative flex items-center gap-3">
                        {idx !== data.logs.length - 1 && (
                          <div className="absolute left-[17px] top-10 w-px h-4 bg-white/5" />
                        )}

                        <div className={`w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center shrink-0 z-10 bg-[#0F172A]
                          ${log.event_type === 'entry' ? 'text-emerald-400/80' : 'text-sky-400/80'}
                        `}>
                          {log.event_type === 'entry' ? <LogIn size={14} /> : <LogOut size={14} />}
                        </div>

                        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white/70">
                              {log.event_type === 'entry' ? 'Entrada' : 'Salida'}
                            </span>
                            <span className="text-[8px] text-white/20 font-mono">
                              Sensor: {log.device_id}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-mono font-bold text-emerald-400/70">
                              {new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.2em]">Sin eventos</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
            <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Skyview  v1</span>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-emerald-500/80 hover:bg-emerald-500 rounded-xl text-[10px] font-bold text-white transition-all shadow-lg active:scale-[0.98] border border-emerald-400/20"
          >
            Cerrar Vista
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
