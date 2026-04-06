import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import { 
  Search, 
  User, 
  Mail, 
  CreditCard, 
  BookOpen,
  Loader2,
  ChevronRight,
  Users,
  Check
} from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import PhotoCaptureModal from "@/components/shared/PhotoCaptureModal";

/* ─── Types ──────────────────────────────────────────────────── */
interface Group {
  id: number;
  code_tab: string;
  name: string;
}

interface Student {
  id: number;
  fullname: string;
  document: string;
  email: string;
  photo?: string;
}

/* ─── Page Component ─────────────────────────────────────────── */
export default function MisFichas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // State
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchGroup, setSearchGroup] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  
  // Photo Modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [studentForPhoto, setStudentForPhoto] = useState<Student | null>(null);

  // Initial animations
  useLayoutEffect(() => {
    gsap.set(bgRef.current, { opacity: 0, scale: 1.06 });
    gsap.set("#navbar", { y: -50, opacity: 0 });
    gsap.set(contentRef.current, { y: 40, opacity: 0 });
    gsap.set(overlayRef.current, { opacity: 0.55 });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(bgRef.current, { opacity: 1, scale: 1, duration: 1.3, ease: "power2.out" })
        .to("#navbar", { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)", clearProps: "transform" }, "-=0.9")
        .to(contentRef.current, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  // Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await api.get("/management/teacher/groups");
        if (Array.isArray(res)) setGroups(res);
        else if (res?.data) setGroups(res.data);
      } catch (err) {
        console.error("Error fetching teacher groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch Students
  useEffect(() => {
    if (!selectedGroupId) return;
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await api.get(`/management/teacher/groups/${selectedGroupId}/students`);
        if (Array.isArray(res)) setStudents(res);
        else if (res?.data) setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedGroupId]);

  // Derived filters
  const filteredGroups = groups.filter(g => 
    g.code_tab.toLowerCase().includes(searchGroup.toLowerCase()) ||
    (g.name && g.name.toLowerCase().includes(searchGroup.toLowerCase()))
  );

  const filteredStudents = students.filter(s => 
    s.fullname.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.document.includes(searchStudent)
  );

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const handleOpenPhotoModal = (student: Student) => {
    setStudentForPhoto(student);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoSuccess = (response: any) => {
    if (studentForPhoto) {
      const newPhotoUrl = response.photo_url || studentForPhoto.photo; // Use response if available
      setStudents(prev => prev.map(s => s.id === studentForPhoto.id ? { ...s, photo: newPhotoUrl } : s));
    }
  };

  const navItems = [
    { label: "Inicio", href: "/", type: "link" as const },
    { label: "Ambientes", href: "/#ambientes", type: "link" as const },
    { label: "Clases", href: "/clases", type: "link" as const },
    { label: "Fichas", href: "/mis-fichas", type: "link" as const, active: true },
  ];

  return (
    <div ref={wrapperRef} className="min-h-screen overflow-hidden">
      <Navbar solidBg items={navItems} />

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

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="shrink-0 h-24" />
        <main ref={contentRef} className="flex-1 flex flex-col w-full items-center px-4 pb-12">
          <div className="w-full max-w-7xl flex flex-col gap-8">
            
            <header className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white font-plus tracking-tight">Mis Fichas</h1>
              <p className="text-white/40 text-lg font-plus">Consulta de grupos y aprendices asignados.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* SIDEBAR */}
              <aside className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                        <BookOpen size={12} /> Mis Grupos
                    </label>
                    <div className="relative mt-2">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar por código..."
                            value={searchGroup}
                            onChange={(e) => setSearchGroup(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                  {loadingGroups ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-white/10" size={24} /></div>
                  ) : filteredGroups.length === 0 ? (
                    <p className="text-center py-10 text-white/20 text-xs italic font-plus">No se encontraron fichas.</p>
                  ) : filteredGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => { setSelectedGroupId(group.id); setSearchStudent(""); }}
                      className={`
                        w-full text-left p-4 rounded-xl border flex items-center justify-between group transition-all
                        ${selectedGroupId === group.id 
                          ? 'bg-blue-500/20 border-blue-500/30' 
                          : 'bg-white/[0.02] border-transparent hover:bg-white/5'}
                      `}
                    >
                      <div className="min-w-0">
                        <p className={`text-lg font-bold font-plus leading-none ${selectedGroupId === group.id ? "text-white" : "text-white/70"}`}>
                          {group.code_tab}
                        </p>
                        <p className={`text-[10px] uppercase font-bold tracking-widest mt-2 truncate ${selectedGroupId === group.id ? "text-blue-400" : "text-white/20"}`}>
                          {group.name || "Sin nombre"}
                        </p>
                      </div>
                      <ChevronRight size={16} className={`transition-transform duration-300 ${selectedGroupId === group.id ? "text-blue-400 translate-x-1" : "text-white/10 group-hover:text-white/30"}`} />
                    </button>
                  ))}
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <section className="lg:col-span-8 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  {!selectedGroupId ? (
                    <motion.div 
                        key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-40 flex flex-col items-center justify-center gap-4 text-center"
                    >
                        <Users className="text-white/10" size={32} />
                        <p className="text-white/30 font-plus italic">Selecciona un grupo para ver el listado de aprendices</p>
                    </motion.div>
                  ) : (
                    <motion.div
                        key={selectedGroupId} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col gap-6"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1 flex items-center gap-1.5">
                                <Users size={12} /> Ficha Seleccionada
                            </label>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white font-plus">{selectedGroup?.code_tab}</h2>
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/20">
                                    {students.length} Aprendices
                                </span>
                            </div>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Buscar aprendiz..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/20"
                            />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loadingStudents ? (
                            <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-white/10" size={32} /></div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="col-span-full py-20 text-center"><p className="text-white/20 text-sm italic">Sin resultados.</p></div>
                        ) : (
                          filteredStudents.map((student) => (
                            <div 
                                key={student.id}
                                onClick={() => handleOpenPhotoModal(student)}
                                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-all group flex flex-col gap-4 cursor-pointer relative overflow-hidden"
                            >
                                {/* Status Indicator Badge - Corner */}
                                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-mono uppercase tracking-widest border-l border-b transition-colors duration-300 ${
                                    student.photo 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-white/5 text-white/20 border-white/10'
                                }`}>
                                    {student.photo ? 'Foto registrada' : 'Pendiente'}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-12 h-12 relative rounded-xl border flex items-center justify-center transition-all duration-300
                                        ${student.photo 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                            : 'bg-white/5 border-white/10 text-white/20 group-hover:border-blue-500/50'
                                        }
                                    `}>
                                        <User size={24} className={student.photo ? 'opacity-100' : 'opacity-40 group-hover:text-blue-400'} />
                                        
                                        {/* Little success check badge */}
                                        {student.photo && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xl">
                                                <Check className="text-white w-2.5 h-2.5" strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-white font-bold font-plus truncate text-base leading-tight">
                                            {student.fullname}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <CreditCard size={12} className="text-white/20" />
                                            <span className="text-xs font-mono text-white/40">{student.document}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex items-center gap-3 text-white/40 group-hover:text-white/60 transition-colors">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="text-xs font-plus truncate">{student.email}</span>
                                </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isPhotoModalOpen && studentForPhoto && (
          <PhotoCaptureModal 
            isOpen={isPhotoModalOpen}
            onClose={() => setIsPhotoModalOpen(false)}
            onSuccess={handlePhotoSuccess}
            uploadEndpoint={`/management/teacher/students/${studentForPhoto.id}/photo`}
            title={`Foto de ${studentForPhoto.fullname.split(' ')[0]}`}
            description="Captura o sube una foto para actualizar la identidad del aprendiz."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
