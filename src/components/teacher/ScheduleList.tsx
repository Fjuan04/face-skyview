import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin, Hash, BookOpen, Sun, Sunset, Moon } from "lucide-react";
import ScheduleDetail from "./ScheduleDetail";

export interface ScheduleItem {
  id: number;
  ambient_id: number;
  ambient: string;
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

/* ─── Jornada config ─────────────────────────────────────────── */
type Jornada = 'manana' | 'tarde' | 'noche';

const JORNADA_CONFIG: Record<Jornada, {
  label: string;
  icon: typeof Sun;
  range: string;
  accent: string;
  accentHover: string;
  textHover: string;
  clockColor: string;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  iconColor: string;
}> = {
  manana: {
    label: 'Mañana',
    icon: Sun,
    range: '6:00 – 12:00',
    accent: 'bg-amber-400/50',
    accentHover: 'group-hover:bg-amber-400',
    textHover: 'group-hover:text-amber-200',
    clockColor: 'text-amber-400',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-transparent',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  tarde: {
    label: 'Tarde',
    icon: Sunset,
    range: '12:00 – 18:00',
    accent: 'bg-orange-400/50',
    accentHover: 'group-hover:bg-orange-400',
    textHover: 'group-hover:text-orange-200',
    clockColor: 'text-orange-400',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-transparent',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
  noche: {
    label: 'Noche',
    icon: Moon,
    range: '18:00 – 22:00',
    accent: 'bg-indigo-400/50',
    accentHover: 'group-hover:bg-indigo-400',
    textHover: 'group-hover:text-indigo-200',
    clockColor: 'text-indigo-400',
    gradientFrom: 'from-indigo-500/20',
    gradientTo: 'to-transparent',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
  },
};

const JORNADA_ORDER: Jornada[] = ['manana', 'tarde', 'noche'];

function getJornada(startTime: string): Jornada {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return 'manana';
  if (hour < 18) return 'tarde';
  return 'noche';
}

/**
 * Component to display a list of scheduled classes for a teacher,
 * grouped by time-of-day: Mañana, Tarde, Noche.
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

  /* Group schedules by jornada */
  const grouped = useMemo(() => {
    const groups: Record<Jornada, ScheduleItem[]> = {
      manana: [],
      tarde: [],
      noche: [],
    };
    schedules.forEach((item) => {
      groups[getJornada(item.start_time)].push(item);
    });
    return groups;
  }, [schedules]);

  /* Determine which jornada the current hour belongs to — open it by default */
  const currentJornada = useMemo<Jornada>(() => {
    const h = new Date().getHours();
    if (h < 12) return 'manana';
    if (h < 18) return 'tarde';
    return 'noche';
  }, []);

  const [openSections, setOpenSections] = useState<Record<Jornada, boolean>>({
    manana: currentJornada === 'manana',
    tarde: currentJornada === 'tarde',
    noche: currentJornada === 'noche',
  });

  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const toggleSection = (j: Jornada) =>
    setOpenSections((prev) => ({ ...prev, [j]: !prev[j] }));

  /* Running card index for staggered animations across groups */
  let globalIndex = 0;

  return (
    <div className="w-full max-w-7xl">
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

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-plus italic">Consultando programación...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10 rounded-2xl">
          <BookOpen size={40} className="text-white/10" />
          <p className="text-white/30 text-sm font-plus italic">No tienes clases programadas para esta consulta.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {JORNADA_ORDER.map((jornada) => {
            const items = grouped[jornada];
            if (items.length === 0) return null;

            const cfg = JORNADA_CONFIG[jornada];
            const Icon = cfg.icon;
            const isOpen = openSections[jornada];

            return (
              <motion.section
                key={jornada}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
              >
                {/* ── Accordion Header (clickable) ── */}
                <button
                  onClick={() => toggleSection(jornada)}
                  className="w-full flex items-center gap-4 p-5 cursor-pointer select-none hover:bg-white/[0.03] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={cfg.iconColor} />
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-lg font-plus font-bold text-white">{cfg.label}</h3>
                    <span className="text-[11px] font-mono text-white/30 tracking-wider">{cfg.range}</span>
                  </div>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="text-xs font-mono text-white/20">
                      {items.length} {items.length === 1 ? 'clase' : 'clases'}
                    </span>
                    {/* Chevron */}
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/30"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  </span>
                </button>

                {/* Gradient divider */}
                <div className={`h-px bg-gradient-to-r ${cfg.gradientFrom} via-white/10 ${cfg.gradientTo}`} />

                {/* ── Collapsible Content ── */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`content-${jornada}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                        {items.map((item) => {
                          const idx = globalIndex++;
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                              onClick={() => setSelectedScheduleId(item.id)}
                              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer hover:border-white/20 shadow-md hover:shadow-xl hover:shadow-black/20"
                            >
                              {/* Decorative accent — jornada-colored */}
                              <div className={`absolute top-0 left-0 w-1 h-full ${cfg.accent} ${cfg.accentHover} transition-colors`} />

                              <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                                      <Hash size={10} /> {item.codeTab}
                                    </span>
                                    <h3 className={`text-lg font-plus font-bold text-white leading-tight ${cfg.textHover} transition-colors`}>
                                      {item.class}
                                    </h3>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                      <MapPin size={14} className="text-white/40" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] uppercase tracking-wider text-white/20 font-bold">Ambiente</span>
                                      <span className="text-xs font-plus text-white/70">{item.ambient}</span>
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

                                {/* Status & Time indicator */}
                                <div className="flex items-center gap-2.5 mt-2">
                                  <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                                    <Clock size={14} className={cfg.clockColor} />
                                    <span className="text-[12px] font-mono text-white/70 uppercase tracking-tighter">
                                      {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
                                    </span>
                                  </div>

                                  {item.closed_by ? (
                                    <span className="text-[12px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full uppercase font-mono tracking-widest leading-none">
                                      Finalizada
                                    </span>
                                  ) : item.open_by && item.break_time ? (
                                    <span className="text-[12px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full uppercase font-mono tracking-widest leading-none">
                                      Descanso
                                    </span>
                                  ) : item.open_by ? (
                                    <span className="text-[12px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase font-mono tracking-widest leading-none">
                                      En Curso
                                    </span>
                                  ) : (
                                    <span className="text-[12px] bg-white/5 text-white/40 border border-white/10 px-3 py-1 rounded-full uppercase font-mono tracking-widest leading-none">
                                      Programada
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScheduleId && (
          <ScheduleDetail 
            scheduleId={selectedScheduleId} 
            onClose={() => setSelectedScheduleId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
