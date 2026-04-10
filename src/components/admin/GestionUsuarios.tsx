import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  CreditCard,
  Shield,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Trash2,
  Camera as CameraIcon
} from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import FormularioRegistro from "./FormularioRegistro";
import PhotoCaptureModal from "@/components/shared/PhotoCaptureModal";

interface User {
  id: number;
  fullname: string;
  document: string;
  email: string;
  role_id: number;
  is_active: boolean;
  photo?: string;
}

export default function GestionUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Photo Update State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [userForPhoto, setUserForPhoto] = useState<User | null>(null);

  const fetchUsers = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      // Assuming the backend agent now supports pagination and search queries
      const res = await api.get(`/users?page=${pageToFetch}&search=${search}`);
      if (res?.success) {
        // Handle Laravel pagination structure: res.data might be the paginator or contain it
        const paginator = res.data;
        if (paginator.data && Array.isArray(paginator.data)) {
            setUsers(paginator.data);
            setPage(paginator.current_page);
            setTotalPages(paginator.last_page);
            setTotalRecords(paginator.total);
        } else {
            // Fallback for non-paginated or unexpected structure
            setUsers(Array.isArray(res.data) ? res.data : []);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchUsers(1);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search]);

  // Since we are paginating on the server, we no longer need local filtering
  const displayUsers = users;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        'bg-amber-500/20 text-amber-500 border-amber-500/30',
        'bg-rose-500/20 text-rose-400 border-rose-500/30',
        'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return;
    
    try {
        const res = await api.delete(`/users/${id}`);
        if (res) fetchUsers(page);
    } catch (err) {
        console.error("Error deleting user:", err);
        alert("No se pudo eliminar el usuario.");
    }
  };

  const handleOpenPhotoModal = (user: User) => {
    setUserForPhoto(user);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoSuccess = () => {
    setIsPhotoModalOpen(false);
    fetchUsers(page);
  };

  const getRoleBadge = (roleId: number) => {
    switch (roleId) {
      case 1:
        return <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-tighter">Administrador</span>;
      case 2:
        return <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">Instructor</span>;
      default:
        return <span className="bg-white/5 text-white/40 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">Usuario</span>;
    }
  };

  if (showForm) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full max-w-lg flex items-center justify-between mb-4">
          <button 
            onClick={() => { setShowForm(false); fetchUsers(page); }}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-plus"
          >
            <ArrowLeft size={16} /> Volver al listado
          </button>
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Nuevo Registro</span>
             <span className="text-xs text-white/20">Instructor</span>
          </div>
        </div>
        <FormularioRegistro />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl space-y-6"
    >
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-plus tracking-tight">Gestión de Usuarios</h2>
              <p className="text-white/40 text-sm">Administra los instructores y el personal del sistema.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold font-plus uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          <UserPlus size={16} /> Registrar Instructor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre, documento o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-plus"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-white/40">Usuario</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-white/40">Identificación</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-white/40">Rol</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-white/40">Estado</th>
                <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-bold text-white/40">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <p className="text-white/20 text-xs font-plus uppercase tracking-widest">Cargando usuarios...</p>
                    </div>
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-white/20 text-sm font-plus italic">No se encontraron usuarios que coincidan con la búsqueda.</p>
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden font-mono text-xs font-bold ${getAvatarColor(user.fullname)}`}>
                          {getInitials(user.fullname)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white font-plus">{user.fullname}</span>
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-white/60">{user.document}</span>
                        <span className="text-[9px] uppercase tracking-tighter text-white/20 font-bold">Documento ID</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role_id)}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <XCircle size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">Inactivo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleOpenPhotoModal(user)}
                                className="p-2 rounded-lg hover:bg-blue-500/10 text-white/20 hover:text-blue-400 transition-all"
                                title="Actualizar Foto"
                            >
                                <CameraIcon size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(user.id, user.fullname)}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all"
                                title="Eliminar Usuario"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchUsers(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-1 mx-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchUsers(p)}
                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                  page === p 
                    ? "bg-white text-black" 
                    : "text-white/40 hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchUsers(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Siguiente
          </button>
        </div>
      )}

      <AnimatePresence>
        {isPhotoModalOpen && userForPhoto && (
            <PhotoCaptureModal 
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onSuccess={handlePhotoSuccess}
                uploadEndpoint={`/users/${userForPhoto.id}/photo`}
                title={`Actualizar Foto: ${userForPhoto.fullname.split(' ')[0]}`}
                description="Captura o sube una nueva foto de identificación para el usuario."
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
