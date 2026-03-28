import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin, Hash, BookOpen } from "lucide-react";

export interface ScheduleItem {
  id: number;
  ambient_id: number;
  user_id: number;
  teacher_name: string;
  codeTab: string;
  class: string;
  start_time: string;
  end_time: string;
  date: string;
  open_by: string | null;
  closed_by: string | null;
  break_time: boolean;
  start_break: string | null;
  end_break: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduleResponse {
  success: boolean;
  role: string;
  filters: {
    date: string;
    ambient_id: number | null;
    user_id: number;
    status: string | null;
  };
  count: number;
  data: ScheduleItem[];
}

interface ScheduleListProps {
  date?: string;
  ambientId?: number;
  status?: 'open' | 'closed';
}

/**
 * Component to display a list of scheduled classes for a teacher.
 * 
 * Supports filtering by date, ambient_id, and status.
 */
export default function ScheduleList({ date, ambientId, status }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (date) queryParams.append("date", date);
        if (ambientId) queryParams.append("ambient_id", ambientId.toString());
        if (status) queryParams.append("status", status);

        // Fetch data from the /schedules endpoint
        const response = await api.get(`/schedules?${queryParams.toString()}`) as ScheduleResponse;
        
        if (response.success) {
          setSchedules(response.data);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [date, ambientId, status]);

  return (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">
          Programación Diaria
        </p>
        <h2
          className="font-plus text-white font-bold"
          style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.1 }}
        >
          Mis Clases
        </h2>
        <div className="mt-4 h-px bg-white/10 w-full" />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-plus italic">Consultando programación...</p>
          </div>
        ) : schedules.length > 0 ? (
          schedules.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] transition-all duration-300"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                      <Hash size={10} /> {item.codeTab}
                    </span>
                    <h3 className="text-lg font-plus font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">
                      {item.class}
                    </h3>
                  </div>
                  <div className="shrink-0 bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                    <Clock size={12} className="text-blue-400" />
                    <span className="text-[11px] font-mono text-white/80 uppercase tracking-tighter">
                      {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <MapPin size={14} className="text-white/40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-white/20 font-bold">Ambiente</span>
                      <span className="text-xs font-plus text-white/70">ID: {item.ambient_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Calendar size={14} className="text-white/40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-white/20 font-bold">Fecha</span>
                      <span className="text-xs font-plus text-white/70">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-2 mt-2">
                  {item.open_by ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono tracking-widest leading-none py-1">
                      En Curso
                    </span>
                  ) : (
                    <span className="text-[9px] bg-white/5 text-white/30 border border-white/10 px-2 py-0.5 rounded uppercase font-mono tracking-widest leading-none py-1">
                      Programada
                    </span>
                  )}
                  {item.break_time && (
                    <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded uppercase font-mono tracking-widest leading-none py-1">
                      Descanso
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10 rounded-2xl">
            <BookOpen size={40} className="text-white/10" />
            <p className="text-white/30 text-sm font-plus italic">No tienes clases programadas para esta consulta.</p>
          </div>
        )}
      </div>
    </div>
  );
}
