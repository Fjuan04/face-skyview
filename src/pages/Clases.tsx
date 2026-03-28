import { useLayoutEffect, useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import type { NavItem } from "@/components/Navbar";
import ScheduleList from "@/components/teacher/ScheduleList";
import { Search, Calendar as CalendarIcon, Filter, Layers } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/* Component  */
export default function Clases() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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

      {/* ── Full-height hero background ── */}
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

      {/* ── Scrollable content ── */}
      <div className="relative z-10 min-h-screen flex flex-col">
          <div className="shrink-0 h-24" />

          <main ref={contentRef} className="flex-1 flex flex-col w-full items-center px-4 pb-12">
              <div className="w-full max-w-7xl flex flex-col gap-6">
                
                {/* Filter Bar */}
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-end">
                    
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

                    {/* Ambient ID */}
                    <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                            <Layers size={12} /> Ambiente
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input 
                                type="number"
                                value={ambientId}
                                onChange={(e) => setAmbientId(e.target.value)}
                                placeholder="Ej: 101"
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-full"
                            />
                        </div>
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
                            <option value="" className="bg-[#0F172A]">Todos</option>
                            <option value="open" className="bg-[#0F172A]">En Curso</option>
                            <option value="closed" className="bg-[#0F172A]">Finalizadas</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {(ambientId || status || date !== new Date().toISOString().split('T')[0]) && (
                      <button 
                          onClick={() => {
                              setDate(new Date().toISOString().split('T')[0]);
                              setAmbientId("");
                              setStatus(undefined);
                          }}
                          className="px-4 py-2.5 text-[11px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
                      >
                          Limpiar
                      </button>
                    )}
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
    </div>
  );
}
