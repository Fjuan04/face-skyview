import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Users, UserPlus, Search, Check, Info } from "lucide-react";
import { api } from "@/lib/api";

interface Teacher {
  id: number;
  fullname: string;
  document: string;
  role_id: number;
}

interface Group {
  id: number;
  code_tab: string;
  name: string;
}

export default function GestionFichas() {
  // Import Students States
  const [file, setFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assign Teacher States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignStatus, setAssignStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [teachersRes, groupsRes] = await Promise.all([
          api.get("/management/teachers"),
          api.get("/management/groups")
        ]);
        
        // Teachers
        if (Array.isArray(teachersRes)) setTeachers(teachersRes);
        else if (teachersRes?.data) setTeachers(teachersRes.data);

        // Groups (Fichas)
        if (Array.isArray(groupsRes)) setGroups(groupsRes);
        else if (groupsRes?.data) setGroups(groupsRes.data);
      } catch (err) {
        console.error("Error loading management data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImportLoading(true);
    setImportStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/management/import-students", formData);
      if (response.success) {
        setImportStatus({ type: "success", message: response.message || "Estudiantes importados correctamente." });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setImportStatus({ type: "error", message: response.message || "Error al importar estudiantes." });
      }
    } catch (err: any) {
      setImportStatus({ type: "error", message: err?.message || "Ocurrió un error inesperado al subir el archivo." });
    } finally {
      setImportLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeacherId || selectedGroupIds.length === 0) return;
    setAssignLoading(true);
    setAssignStatus(null);
    try {
      const response = await api.post("/management/assign-teacher", {
        teacher_id: selectedTeacherId,
        group_ids: selectedGroupIds
      });
      if (response.success) {
        setAssignStatus({ type: "success", message: response.message || "Docente asignado correctamente." });
        setSelectedTeacherId(null);
        setSelectedGroupIds([]);
        setSearchTeacher("");
        setSearchGroup("");
      } else {
        setAssignStatus({ type: "error", message: response.message || "Error al asignar docente." });
      }
    } catch (err: any) {
      setAssignStatus({ type: "error", message: err?.message || "Error en la comunicación con el servidor." });
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleGroupSelection = (id: number) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const filteredTeachers = teachers.filter(t => 
    (t.role_id === 2) && (
      t.fullname?.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.document?.includes(searchTeacher)
    )
  ).slice(0, 10);

  const filteredGroups = groups.filter(g => 
    g.code_tab?.toLowerCase().includes(searchGroup.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-10 pb-20 px-4 mt-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white font-plus tracking-tight">Gestión de Fichas</h1>
          <p className="text-white/50 font-plus mt-2 text-lg">Administración central de grupos, estudiantes e instructores.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white/40 text-xs font-mono uppercase tracking-widest">
            <Info size={14} className="text-blue-400" /> Control Administrativo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Import Students Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                        <FileSpreadsheet className="text-emerald-400 w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white font-plus">Importar Estudiantes</h2>
                </div>

                <p className="text-white/40 text-sm font-plus mb-6 leading-relaxed">
                    Carga masiva de estudiantes mediante archivos Excel o CSV. Se crearán sus cuentas automáticamente.
                </p>

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                    relative flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 min-h-[180px] transition-all cursor-pointer group
                    ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
                    `}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                    />
                    
                    {file ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                            <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <p className="text-white font-medium truncate max-w-[180px] text-sm">{file.name}</p>
                            <p className="text-white/30 text-[10px] uppercase font-mono mt-1 tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="text-center opacity-60 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-10 h-10 text-white/20 mx-auto mb-4 group-hover:text-white/40 transition-colors" />
                            <p className="text-white font-medium text-sm">Seleccionar archivo</p>
                            <p className="text-white/30 text-xs mt-1">Excel o CSV</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {importStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                                importStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                        >
                            {importStatus.type === 'success' ? <CheckCircle2 className="shrink-0 w-5 h-5" /> : <AlertCircle className="shrink-0 w-5 h-5" />}
                            <p className="text-xs font-plus leading-relaxed">{importStatus.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleImport}
                    disabled={!file || importLoading}
                    className="
                    mt-6 w-full h-12 bg-white text-black rounded-lg font-bold font-plus tracking-wider uppercase text-xs
                    hover:bg-gray-200 transition-all active:scale-[0.98]
                    disabled:opacity-20 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 shadow-lg shadow-white/5
                    "
                >
                    {importLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Importar Datos"}
                </button>

                <div className="mt-8 pt-6 border-t border-white/5 flex gap-3 items-start">
                    <Info className="text-blue-400 w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-white/30 text-[11px] font-plus leading-relaxed">
                        Formato requerido: <span className="text-white/50">document, fullname, email, codetab, gender</span>.
                    </p>
                </div>
            </div>
        </div>

        {/* RIGHT: Assign Teacher Section */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/20">
                            <UserPlus className="text-blue-400 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white font-plus">Asignación de Instructores</h2>
                    </div>
                    {loadingData && <div className="flex gap-2 items-center text-white/30 text-xs font-mono uppercase tracking-widest"><div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" /> Sincronizando</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    {/* Step 1: Teacher Selection */}
                    <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/60">1</span>
                            Seleccionar Instructor
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Buscar por nombre o documento..."
                                value={searchTeacher}
                                onChange={(e) => setSearchTeacher(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-plus outline-none focus:border-white/30 transition-all shadow-inner"
                            />
                        </div>

                        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-[300px] max-h-[400px]">
                            <div className="overflow-y-auto flex-1 p-2 space-y-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                                {filteredTeachers.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTeacherId(t.id)}
                                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${selectedTeacherId === t.id ? 'bg-blue-500/20 border border-blue-500/30 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedTeacherId === t.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'}`}>
                                            {t.fullname && t.fullname.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-plus truncate ${selectedTeacherId === t.id ? 'text-white' : 'text-white/70'}`}>{t.fullname}</p>
                                            <p className="text-[10px] font-mono text-white/30 mt-0.5">{t.document}</p>
                                        </div>
                                        {selectedTeacherId === t.id && <Check className="ml-auto w-4 h-4 text-blue-400" />}
                                    </button>
                                ))}
                                {filteredTeachers.length === 0 && !loadingData && (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3 py-10 px-6 text-center">
                                        <Users className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-plus italic">No se encontraron instructores.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Group Selection */}
                    <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/60">2</span>
                            Seleccionar Fichas ({selectedGroupIds.length})
                        </label>

                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Buscar por número de ficha..."
                                value={searchGroup}
                                onChange={(e) => setSearchGroup(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm font-plus outline-none focus:border-white/30 transition-all shadow-inner"
                            />
                        </div>
                        
                        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl overflow-hidden flex flex-col min-h-[300px] max-h-[400px]">
                            <div className="overflow-y-auto flex-1 p-2 space-y-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                                {filteredGroups.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => toggleGroupSelection(g.id)}
                                        className={`w-full text-left p-3.5 rounded-lg flex items-center gap-3 transition-all ${selectedGroupIds.includes(g.id) ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-md' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedGroupIds.includes(g.id) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5'}`}>
                                            {selectedGroupIds.includes(g.id) && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[15px] font-plus font-bold ${selectedGroupIds.includes(g.id) ? 'text-emerald-400' : 'text-white/80'}`}>{g.code_tab || "S/N"}</p>
                                        </div>
                                    </button>
                                ))}
                                {filteredGroups.length === 0 && !loadingData && (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3 py-10 px-6 text-center">
                                        <Users className="w-8 h-8 opacity-20" />
                                        <p className="text-xs font-plus italic">No se encontraron fichas.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                    <AnimatePresence>
                        {assignStatus && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className={`p-4 rounded-xl flex items-center gap-3 ${
                                    assignStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                            >
                                {assignStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <p className="text-sm font-plus">{assignStatus.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleAssign}
                        disabled={!selectedTeacherId || selectedGroupIds.length === 0 || assignLoading}
                        className="
                        w-full h-14 bg-[#02AF00] text-white rounded-xl font-bold font-plus tracking-wider uppercase text-sm
                        hover:brightness-110 shadow-lg shadow-green-900/20 transition-all active:scale-[0.99]
                        disabled:opacity-20 disabled:cursor-not-allowed
                        flex items-center justify-center gap-3
                        "
                    >
                        {assignLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Procesar Asignación <Check size={20} /></>}
                    </button>
                </div>
            </div>
        </div>
      </div>

    </motion.div>
  );
}
