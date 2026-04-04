import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check, CalendarIcon, Users } from "lucide-react";
import { api } from "@/lib/api";

interface PermissionModalProps {
  ambientId: number;
  ambientName: string;
  onClose: () => void;
}

interface ScheduleItem {
  id: number;
  class: string;
  start_time: string;
  end_time: string;
  teacher_name: string;
}

interface User {
  id: number;
  fullname: string;
  document: string;
}

export default function PermissionModal({ ambientId, ambientName, onClose }: PermissionModalProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch schedules when date changes
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("date", date);
        queryParams.append("ambient_id", ambientId.toString());

        const res = await api.get(`/schedules?${queryParams.toString()}`);
        if (res.success && res.data) {
          setSchedules(res.data);
        } else {
          setSchedules([]);
        }
      } catch (err: any) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoadingSchedules(false);
        setSelectedScheduleId(null); // Reset selection on date change
      }
    };
    fetchSchedules();
  }, [date, ambientId]);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get("/users");
        // Adapt depending on backend response struct. Assume array or { data: [] }
        if (Array.isArray(res)) setUsers(res);
        else if (res.data && Array.isArray(res.data)) setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (!selectedScheduleId || !selectedUserId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/schedules/${selectedScheduleId}/permission`, {
        admin_permission: true,
        user_allowed: selectedUserId,
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || "Error al asignar permiso.");
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLow = searchUser.toLowerCase();
    return (
      (u.fullname && u.fullname.toLowerCase().includes(searchLow)) ||
      (u.document && String(u.document).toLowerCase().includes(searchLow))
    );
  }).slice(0, 15); // Limit slightly to avoid huge DOM if many users



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
        className="relative w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-plus font-bold text-white">Otorgar Permiso</h3>
            <p className="text-white/50 text-sm font-plus">Ambiente: <span className="text-white/80 font-semibold">{ambientName}</span></p>
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
            <p className="text-white font-plus text-lg font-bold">Permiso otorgado exitosamente</p>
          </div>
        ) : (
          <div 
            className="p-6 overflow-y-auto flex-1 flex flex-col gap-6"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
            
            {/* Sec 1: Date & Search Schedule */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <CalendarIcon size={14} /> Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white text-[15px] outline-none focus:border-emerald-500/50 transition-colors"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Sec 2: Schedule List */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                Selecciona la sala de clase
              </label>
              
              <div 
                className="border border-white/10 rounded-lg overflow-hidden bg-black/20 flex flex-col max-h-52 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
              >
                {loadingSchedules ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">Cargando clases...</p>
                ) : schedules.length === 0 ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">No se encontraron clases para esta fecha.</p>
                ) : (
                  <div className="flex flex-col p-2 gap-1.5">
                    {schedules.map((sch) => {
                      const past = false; // Optionally disable past schedules
                      const isSelected = selectedScheduleId === sch.id;
                      return (
                        <button
                          key={sch.id}
                          disabled={past}
                          onClick={() => setSelectedScheduleId(sch.id)}
                          className={`
                            relative text-left px-4 py-3 rounded-md flex justify-between items-center transition-all duration-300
                            ${past ? "opacity-40 cursor-not-allowed bg-transparent" : "cursor-pointer hover:bg-white/[0.04]"}
                            ${isSelected ? "bg-emerald-500/10 border border-emerald-500/20" : "border border-transparent"}
                          `}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-md" />
                          )}
                          <div className="flex flex-col ml-1">
                            <span className={`font-plus font-bold ${isSelected ? "text-emerald-400" : "text-white"} text-sm leading-tight transition-colors`}>{sch.class}</span>
                            <span className="text-[11px] text-white/50 flex gap-2 font-mono mt-1">
                              <span>Instructor: {sch.teacher_name}</span>
                              <span className="opacity-50">|</span>
                              <span>{sch.start_time.substring(0,5)} - {sch.end_time.substring(0,5)}</span>
                            </span>
                          </div>
                          
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

            {/* Sec 3: User Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Users size={14} /> Selecciona el usuario a dar permiso
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-t-lg pl-11 pr-4 py-3 text-white text-[15px] outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div 
                className="border border-t-0 border-white/10 rounded-b-lg -mt-3 bg-black/20 flex flex-col max-h-60 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
              >
                {loadingUsers ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">Cargando usuarios...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="p-6 text-center text-white/40 text-sm font-plus">No hay resultados.</p>
                ) : (
                  <div className="flex flex-col">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUserId === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUserId(u.id)}
                          className={`
                            relative overflow-hidden text-left px-4 py-3 border-b border-white/5 last:border-none flex items-center gap-4 transition-all duration-300
                            ${isSelected 
                              ? "bg-emerald-500/10 border-emerald-500/20" 
                              : "hover:bg-white/[0.04]"}
                          `}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                          )}

                          {/* Avatar */}
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold tracking-wider font-plus transition-colors
                            ${isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/60"}
                          `}>
                            {u.fullname ? u.fullname.split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase() : "?"}
                          </div>
                          
                          {/* Details */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`font-plus text-sm truncate transition-colors ${isSelected ? "text-emerald-400 font-semibold" : "text-white"}`}>
                              {u.fullname}
                            </span>
                            {u.document && (
                              <span className="font-mono text-[10px] text-white/40 tracking-wider">
                                {u.document}
                              </span>
                            )}
                          </div>

                          {/* Checkbox */}
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
              disabled={!selectedScheduleId || !selectedUserId || isSubmitting}
              className={`
                px-6 py-2.5 rounded-lg font-plus font-bold text-sm tracking-wide transition-all shadow-lg flex items-center gap-2
                ${(!selectedScheduleId || !selectedUserId || isSubmitting) 
                  ? "bg-white/10 text-white/40 cursor-not-allowed" 
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"}
              `}
            >
              {isSubmitting ? (
                 <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Procesando...</>
              ) : "Asignar Permiso"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
