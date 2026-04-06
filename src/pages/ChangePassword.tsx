import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Check, X, ShieldCheck } from "lucide-react";

/* ─── Floating Label Input ────────────────────────────────────────── */
interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        className="
          peer w-full h-14 px-4 pt-4 pb-1
          bg-white/10 backdrop-blur-md
          border border-white/30
          rounded-[3px]
          text-white font-plus text-base
          outline-none
          transition-all duration-200
          focus:border-white/70 focus:bg-white/15
          placeholder-transparent
        "
        style={{ WebkitTextFillColor: "white" }}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 font-plus text-white/60 pointer-events-none
          transition-all duration-200 ease-out
          ${
            isFloating
              ? "top-1.5 text-[11px] text-white/80 tracking-wide"
              : "top-1/2 -translate-y-1/2 text-base"
          }
        `}
      >
        {label}
      </label>
      <div
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full
          bg-gradient-to-r from-transparent via-white/80 to-transparent
          transition-all duration-300
          ${isFloating ? "w-full opacity-100" : "w-0 opacity-0"}
        `}
      />
    </div>
  );
}

/* Validation Rule Component */
function ValidationRule({ label, isValid }: { label: string; isValid: boolean }) {
    return (
        <div className="flex items-center gap-2 text-sm font-plus transition-colors duration-300">
            {isValid ? (
                <Check className="w-4 h-4 text-green-400" />
            ) : (
                <X className="w-4 h-4 text-white/30" />
            )}
            <span className={isValid ? "text-green-400/90" : "text-white/50"}>
                {label}
            </span>
        </div>
    );
}

function ChangePassword() {
  const { setMustChangePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation States
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  
  const isAllValid = hasMinLength && hasNumber && hasUppercase && hasSymbol && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAllValid) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/change-password", {
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        setMustChangePassword(false);
        navigate("/");
      }, 2000);
    } catch (err: any) {
        setError(err?.message || "Error al cambiar la contraseña. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden flex items-center justify-center">
      
      {/* ── Background Image ──────────────────────────────────── */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/cpic.jpg')" }}
      />

      {/* ── Overlays (Mirror Logic from Login.tsx) ────────────── */}
      <div className="absolute inset-0 z-[1] bg-black/60" />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
        }}
      />
      <div className="grain-overlay absolute inset-0 z-[3] pointer-events-none" />

      {/* ── Glass Card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="
          relative z-10
          w-full max-w-lg mx-4
          bg-white/10 backdrop-blur-md
          border border-white/20
          rounded-lg
          px-10 py-12
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        <AnimatePresence mode="wait">
            {!success ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header */}
                    <div className="mb-10 text-center md:text-left">
                        <p className="font-plus text-white/50 text-sm tracking-widest uppercase mb-1">
                            Seguridad
                        </p>
                        <h1 className="font-plus text-white font-bold text-3xl leading-tight">
                            Actualizar Contraseña
                        </h1>
                        <p className="text-white/60 text-sm mt-3 font-plus">
                            Es tu primer ingreso. Por favor establece una contraseña segura para continuar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-5">
                            <FloatingInput
                                id="new_password"
                                label="Nueva Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <FloatingInput
                                id="confirm_password"
                                label="Confirmar Contraseña"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Rules Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-5 rounded-[3px] border border-white/10">
                            <ValidationRule label="Min. 8 caracteres" isValid={hasMinLength} />
                            <ValidationRule label="1 número" isValid={hasNumber} />
                            <ValidationRule label="1 mayúscula" isValid={hasUppercase} />
                            <ValidationRule label="1 símbolo" isValid={hasSymbol} />
                            <div className="md:col-span-2 pt-1 border-t border-white/10 mt-1">
                                <ValidationRule label="Las contraseñas coinciden" isValid={passwordsMatch} />
                            </div>
                        </div>

                        {error && (
                            <p className="font-plus text-red-400 text-sm text-center">
                                {error}
                            </p>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={!isAllValid || loading}
                                className="
                                    relative w-full h-14
                                    backdrop-blur-sm border border-white/50
                                    rounded-[3px]
                                    bg-[#02AF00]
                                    cursor-pointer
                                    text-white font-plus text-base font-bold tracking-wide
                                    overflow-hidden group
                                    transition-all duration-300
                                    hover:brightness-110
                                    hover:shadow-[0_0_20px_rgba(2,175,0,0.3)]
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                "
                            >
                                {loading ? "Procesando..." : "Actualizar e Ingresar"}
                            </button>
                            
                            <button
                                type="button"
                                onClick={logout}
                                className="font-plus text-white/40 text-sm hover:text-white/70 transition-colors py-2 text-center"
                            >
                                Cancelar y salir
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                        <ShieldCheck className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-plus">¡Todo listo!</h2>
                    <p className="text-white/60 mb-8 font-plus">
                        Tu contraseña se ha configurado correctamente. Iniciando sesión...
                    </p>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2 }}
                            className="h-full bg-[#02AF00]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ChangePassword;
