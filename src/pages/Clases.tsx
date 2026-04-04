import { useLayoutEffect, useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import type { NavItem } from "@/components/Navbar";
import ScheduleList from "@/components/teacher/ScheduleList";
import ExportExcelModal from "@/components/teacher/ExportExcelModal";
import { Search, Calendar as CalendarIcon, Filter, Layers, FileDown, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

interface Ambiente {
  id: number;
  name: string;
}

/* Component  */
export default function Clases() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = useMemo<NavItem[]>(() => [
    { label: 'Inicio', href: '/', type: 'link' },
    { label: 'Ambientes', href: '/#ambientes', type: 'link' },
    { label: 'Clases', href: '/clases', type: 'link', active: true },
    ...(user?.role_id === 1
      ? [{ label: 'Administración', href: '/administracion', type: 'link' as const }]
      : []),
  ], [user]);

  /* Filter states */
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ambientId, setAmbientId] = useState<string>("");
  const [status, setStatus] = useState<'open' | 'closed' | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /* Ambient selector states */
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [ambientSearch, setAmbientSearch] = useState("");
  const [selectedAmbient, setSelectedAmbient] = useState<Ambiente | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch ambients on mount
  useEffect(() => {
    api.get("/ambients")
      .then((data: any) => {
        const list: Ambiente[] = Array.isArray(data) ? data : (data?.data ?? []);
        setAmbientes(list);
      })
      .catch(console.error);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setAmbientSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAmbients = ambientes.filter(a =>
    a.name.toLowerCase().includes(ambientSearch.toLowerCase())
  );

  const handleSelectAmbient = (amb: Ambiente) => {
    setSelectedAmbient(amb);
    setAmbientId(amb.id.toString());
    setIsDropdownOpen(false);
    setAmbientSearch("");
  };

  const handleClearAmbient = () => {
    setSelectedAmbient(null);
    setAmbientId("");
    setAmbientSearch("");
    setIsDropdownOpen(false);
  };

  /* Pin initial states  */
  useLayoutEffect(() => {
    gsap.set(bgRef.current, { opacity: 0, scale: 1.06 });
    gsap.set("#navbar", { y: -50, opacity: 0 });
    gsap.set(contentRef.current, { y: 40, opacity: 0 });
    gsap.set(overlayRef.current, { opacity: 0.55 });
  }, []);

  /* Entry animation  */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(bgRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.3,
        ease: "power2.out",
      })
        .to(
          "#navbar",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.5)",
            clearProps: "transform",
          },
          "-=0.9",
        )
        .to(contentRef.current, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="min-h-screen overflow-hidden">
      <Navbar solidBg items={navItems} />

      {/* Full-height hero background */}
      <div className="fixed inset-0 top-0 z-0 h-dvh overflow-hidden pointer-events-none">
        <div
          ref={bgRef}
          className="transition-[background-image] duration-700 ease-in-out absolute inset-0 bg-cover bg-center dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')]"
          style={{ willChange: "transform, opacity" }}
        />
        <div ref={overlayRef} className="absolute inset-0 bg-black" />
        <div className="hero-gradient absolute inset-0" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="shrink-0 h-24" />
        <main ref={contentRef} className="flex-1 flex flex-col w-full items-center px-4 pb-12">
          <div className="w-full max-w-7xl flex flex-col gap-6">

            {/* Filter Bar */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-end relative z-[200]">

              {/* Date Picker */}
              <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                  <CalendarIcon size={12} /> Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-full [color-scheme:dark]"
                />
              </div>

              {/* Ambient Searchable Selector */}
              <div className="flex-1 min-w-[180px] flex flex-col gap-1.5 relative" ref={dropdownRef}>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                  <Layers size={12} /> Ambiente
                </label>

                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(prev => !prev); setAmbientSearch(""); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-white/[0.08]"
                >
                  <span className={`truncate ${selectedAmbient ? 'text-white' : 'text-white/40'}`}>
                    {selectedAmbient ? selectedAmbient.name : 'Todos los ambientes'}
                  </span>
                  <span className="shrink-0 flex items-center gap-1">
                    {selectedAmbient && (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleClearAmbient(); }}
                        className="p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`text-white/30 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {/* Dropdown panel */}
                {isDropdownOpen && (
                  <div className={`absolute top-full mt-1.5 left-0 right-0 z-[300] border rounded-xl overflow-hidden shadow-2xl shadow-black/50 ${isDark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-black/10'}`}>
                    {/* Search input */}
                    <div className={`p-2 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar ambiente..."
                          value={ambientSearch}
                          onChange={(e) => setAmbientSearch(e.target.value)}
                          className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 ${isDark ? 'bg-white/5 text-white placeholder:text-white/20 focus:ring-white/20' : 'bg-black/5 text-slate-900 placeholder:text-slate-400 focus:ring-black/20'}`}
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div
                      className="max-h-52 overflow-y-auto"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                    >
                      <button
                        onClick={handleClearAmbient}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors italic ${isDark ? 'text-white/30 hover:bg-white/5 hover:text-white/60' : 'text-slate-400 hover:bg-black/5 hover:text-slate-600'}`}
                      >
                        Todos los ambientes
                      </button>

                      {filteredAmbients.length === 0 ? (
                        <p className="px-4 py-4 text-xs text-white/20 text-center italic">Sin resultados</p>
                      ) : (
                        filteredAmbients.map(amb => (
                          <button
                            key={amb.id}
                            onClick={() => handleSelectAmbient(amb)}
                            className={`
                              w-full text-left px-4 py-2.5 text-sm font-plus transition-colors flex items-center justify-between gap-2
                              ${selectedAmbient?.id === amb.id
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-black/5 hover:text-slate-900'}
                            `}
                          >
                            <span className="truncate">{amb.name}</span>
                            <span className="text-[10px] font-mono text-white/20 shrink-0">#{amb.id}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                  <Filter size={12} /> Estado
                </label>
                <select
                  value={status || ""}
                  onChange={(e) => setStatus(e.target.value as any || undefined)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-full appearance-none cursor-pointer"
                >
                  <option value="" className={isDark ? "bg-[#0F172A]" : "bg-white text-slate-900"}>Todos</option>
                  <option value="open" className={isDark ? "bg-[#0F172A]" : "bg-white text-slate-900"}>En Curso</option>
                  <option value="closed" className={isDark ? "bg-[#0F172A]" : "bg-white text-slate-900"}>Finalizadas</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedAmbient || status || date !== new Date().toISOString().split('T')[0]) && (
                <button
                  onClick={() => {
                    setDate(new Date().toISOString().split('T')[0]);
                    handleClearAmbient();
                    setStatus(undefined);
                  }}
                  className="px-4 py-2.5 text-[11px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
                >
                  Limpiar
                </button>
              )}

              {/* Export Button */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl px-5 py-2.5 flex items-center gap-2 group transition-all"
              >
                <FileDown size={14} className="text-emerald-400" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-400">Exportar</span>
              </button>
            </div>

            {/* Schedule List */}
            <ScheduleList
              date={date}
              ambientId={ambientId ? parseInt(ambientId) : undefined}
              status={status}
            />
          </div>
        </main>
      </div>

      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultStartDate={date}
      />
    </div>
  );
}
