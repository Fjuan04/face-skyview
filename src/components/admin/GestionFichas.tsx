import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Users, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

export default function GestionFichas() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/management/import-students", formData);
      
      if (response.success) {
        setStatus({ type: "success", message: response.message || "Estudiantes importados correctamente." });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setStatus({ type: "error", message: response.message || "Error al importar estudiantes." });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message || "Ocurrió un error inesperado al subir el archivo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-white font-plus tracking-tight">Gestión de Fichas</h1>
        <p className="text-white/60 font-plus mt-2">Administra los grupos, importa estudiantes y asigna instructores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Import Section */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileSpreadsheet className="text-emerald-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white font-plus">Importar Estudiantes</h2>
          </div>

          <p className="text-white/50 text-sm font-plus mb-8">
            Sube un archivo Excel (.xlsx) o CSV con el listado de estudiantes para crear automáticamente sus cuentas y asignarlos a sus fichas.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer
              ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}
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
              <div className="text-center">
                <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 font-medium">Seleccionar archivo</p>
                <p className="text-white/30 text-xs mt-1">Excel o CSV solamente</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                  status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 className="shrink-0 w-5 h-5" /> : <AlertCircle className="shrink-0 w-5 h-5" />}
                <p className="text-sm font-plus">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="
              mt-8 w-full h-12 bg-white text-black rounded-lg font-bold font-plus tracking-wide
              hover:bg-gray-200 transition-all active:scale-[0.98]
              disabled:opacity-30 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              "Importar Listado"
            )}
          </button>
        </div>

        {/* Placeholder for Assign Teacher */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-8 flex flex-col justify-center items-center text-center group">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white/10 transition-colors">
            <UserPlus className="text-white/40 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white/80 font-plus mb-3">Asignar Instructores</h3>
          <p className="text-white/40 text-sm font-plus max-w-[240px] mb-8">
            Próximamente: Podrás vincular instructores a sus respectivas fichas para que gestionen sus asistencias.
          </p>
          <button 
            disabled 
            className="px-6 py-2 border border-white/10 rounded-full text-white/20 text-sm font-plus cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>

      </div>

      {/* Info Card */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Users className="text-blue-400 w-5 h-5" />
        </div>
        <div>
          <h4 className="text-blue-400 font-bold font-plus text-sm uppercase tracking-wider">Ayuda</h4>
          <p className="text-white/60 text-sm font-plus mt-1">
            Asegúrate de que el archivo Excel contenga las columnas obligatorias: document, fullname, email, codetab, gender. De lo contrario, la importación podría fallar o generar datos incompletos.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
