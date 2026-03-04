import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/* ─── Floating Label Input ──────────────────────────────────────── */
interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FloatingInput({ id, label, type = "text", value, onChange }: FloatingInputProps) {
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

      {/* Floating Label */}
      <label
        htmlFor={id}
        className={`
          absolute left-4 font-plus text-white/60 pointer-events-none
          transition-all duration-200 ease-out
          ${isFloating
            ? "top-1.5 text-[11px] text-white/80 tracking-wide"
            : "top-1/2 -translate-y-1/2 text-base"
          }
        `}
      >
        {label}
      </label>

      {/* Bottom glow line on focus */}
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

/* Login Page  */
function Login() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await login(email, password);
      navigate("/");
    } catch {
      // El error ya lo maneja el AuthProvider en `error`
    }
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden flex items-center justify-center">

      {/* ── Video Background ──────────────────────────────────── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/video-login.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* ── Overlays ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] bg-black/50" />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}
      />
      <div className="grain-overlay absolute inset-0 z-[3] pointer-events-none" />

      {/* ── Glass Card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="
          relative z-10
          w-full max-w-md mx-4
          bg-white/10 backdrop-blur-md
          border border-white/20
          rounded-lg
          px-10 py-12
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <p className="font-plus text-white/50 text-sm tracking-widest uppercase mb-1">
            Bienvenido
          </p>
          <h1 className="font-plus text-white font-bold text-3xl leading-tight">
            face Skyview
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col gap-5"
        >
          <FloatingInput
            id="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FloatingInput
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error message */}
          {error && (
            <p className="font-plus text-red-400 text-sm text-center -mt-1">
              {error}
            </p>
          )}

          {/* Forgot password */}
          <div className="flex justify-end -mt-2">
            <a href="#" className="font-plus text-white/50 text-sm hover:text-white/80 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="
              relative mt-2 w-full h-14
              backdrop-blur-sm border border-white/50
              rounded-[3px]
              bg-[#02AF00]
              cursor-pointer
              text-white font-plus text-base tracking-wide
              overflow-hidden group
              transition-all duration-300
              hover:border-white/80
              hover:opacity-80
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span className="relative z-10">
              {loading ? "Ingresando..." : "Ingresar"}
            </span>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 text-center font-plus text-white/40 text-sm"
        >
          ¿No tienes cuenta?{" "}
          <a href="#" className="text-white/70 hover:text-white transition-colors">
            Solicitar acceso
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Login;