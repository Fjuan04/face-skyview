import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Upload } from "lucide-react";
import { api } from "@/lib/api";

/*  Types  */
interface DocenteInfo {
  id: number,
  username: string,
  institutional_email: string,
  personal_email: string,
  document: string,
  birthdate: Date,
  phone: string,
  gender: string,
}

/* Step indicator  */
const STEPS = ["Documento", "Verificar datos", "Foto y guardar"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10 w-full">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          {/* Circle */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`
                w-7 h-7 rounded-full border flex items-center justify-center
                text-xs font-mono transition-all duration-300
                ${i < current
                  ? "bg-white border-white text-black"
                  : i === current
                    ? "border-white/80 text-white"
                    : "border-white/20 text-white/30"}
              `}
            >
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${i === current ? "text-white/70" : i < current ? "text-white/50" : "text-white/20"}`}>
              {label}
            </span>
          </div>

          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div className="flex-1 mx-3 mb-5">
              <div className="h-px bg-white/10 relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white/40"
                  initial={{ width: "0%" }}
                  animate={{ width: i < current ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* Step 1: Documento  */
function StepDocumento({ onNext }: { onNext: (info: DocenteInfo) => void }) {
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.post("/search/docent", { document: documento }) as DocenteInfo;
      
      let mappedGender = data.gender;
      if (data.gender === "M") mappedGender = "Masculino";
      else if (data.gender === "F") mappedGender = "Femenino";

      onNext({
        ...data,
        gender: mappedGender,
        document: data.document || documento
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 mb-2">Paso 1</p>
        <h2 className="font-plus text-white font-bold tracking-tight" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Ingresa el documento
        </h2>
        <p className="text-white/60 text-sm font-plus mt-2">
          Consultaremos los datos del docente automáticamente.
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-white/20 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-widest text-white/70 ml-1">
            N° de documento
          </label>
          <input
            type="text"
            value={documento}
            onChange={(e) => { setDocumento(e.target.value); setError(null); }}
            placeholder="Ej. 1234567890"
            autoFocus
            required
            className="
              bg-black/40 border border-white/20 rounded-[6px]
              px-5 py-4 text-white text-[15px] font-plus tracking-wide
              placeholder:text-white/20 shadow-inner
              focus:outline-none focus:border-white/60 focus:bg-black/60 focus:ring-4 focus:ring-white/5
              transition-all duration-300
            "
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-red-300 text-sm font-plus border border-red-500/30 bg-red-500/10 rounded-[6px] px-4 py-3 shadow-sm"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading || !documento.trim()}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="
            mt-2 h-[56px] w-full bg-white text-black rounded-[6px]
            text-[14px] font-plus font-bold tracking-[0.15em] uppercase
            hover:bg-gray-200 transition-colors shadow-lg shadow-white/10
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <><span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Consultando...</>
          ) : "Consultar docente →"}
        </motion.button>
      </form>
    </div>
  );
}

/* Step 2: Verificar datos */
function StepVerificar({ info, onNext, onBack }: { info: DocenteInfo; onNext: () => void; onBack: () => void }) {
  const fields: { label: string; value: string | undefined }[] = [
    { label: "Nombre completo", value: `${info.username}` },
    { label: "Documento", value: info.document },
    { label: "Correo", value: info.institutional_email },
    { label: "Teléfono", value: info.phone },
    { label: "Genero", value: info.gender },
  ].filter(f => f.value);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 mb-2">Paso 2</p>
        <h2 className="font-plus text-white font-bold tracking-tight" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Verifica los datos
        </h2>
        <p className="text-white/60 text-sm font-plus mt-2">
          Confirma que la información es correcta antes de continuar.
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-white/20 to-transparent" />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {fields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex flex-col gap-1 bg-black/40 border border-white/10 rounded-[6px] px-5 py-3.5 shadow-inner"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              {field.label}
            </span>
            <span className="text-white font-plus text-[15px] tracking-wide">
              {field.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={onBack}
          className="
            h-[56px] flex-1 border border-white/20 rounded-[6px] bg-black/20
            text-white/70 text-sm font-plus font-bold tracking-[0.15em] uppercase
            hover:bg-white/10 hover:text-white transition-colors
          "
        >
          ← Volver
        </button>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="
            h-[56px] flex-[2] bg-white text-black rounded-[6px] shadow-lg shadow-white/10
            text-[14px] font-plus font-bold tracking-[0.15em] uppercase
            hover:bg-gray-200 transition-colors
          "
        >
          Confirmar →
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Step 3: Foto y guardar ─────────────────────────────────── */
function StepFoto({ info, onBack, onDone }: { info: DocenteInfo; onBack: () => void; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store stream in a ref so changing it doesn't trigger re-renders
  const streamRef = useRef<MediaStream | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  // 'idle' | 'live' | 'frozen' | 'file'
  const [mode, setMode] = useState<"idle" | "live" | "frozen" | "file">("idle");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError(null);
    // First, set mode to 'live' so <video> becomes visible (it's always in DOM)
    setMode("live");
    // Then wait for the next animation frame so the video element is definitely
    // painted and its ref is accessible before we set srcObject
    requestAnimationFrame(async () => {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = ms;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = ms;
        // play() returns a promise; handle the rejection so it doesn't throw
        v.play().catch((e) => console.warn("video.play():", e));
      } catch (err: any) {
        setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
        setMode("idle");
      }
    });
  };

  const capturePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Mirror horizontally so the snapshot matches the mirrored viewfinder
    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    ctx.restore();

    stopStream();
    setMode("frozen");
    c.toBlob((blob) => { if (blob) setPhotoBlob(blob); }, "image/jpeg", 0.9);
  };

  const retake = () => {
    setPhotoBlob(null);
    setMode("idle");
  };

  const cancelCamera = () => {
    stopStream();
    setMode("idle");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBlob(file);
    setMode("file");
    const reader = new FileReader();
    reader.onload = () => {
      const c = canvasRef.current;
      if (!c) return;
      const img = new Image();
      img.onload = () => {
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d")?.drawImage(img, 0, 0);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Cleanup on unmount
  useEffect(() => () => stopStream(), []); // eslint-disable-line

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      // Formatear los campos según lo requerido por el controlador de Laravel
      fd.append("fullname", info.username);
      fd.append("email", info.institutional_email || info.personal_email || "");
      fd.append("document", info.document || "");
      if (info.gender) fd.append("gender", info.gender);
      if (info.id) fd.append("id", String(info.id));

      // Usar el documento como contraseña por defecto (debe ir confirmada)
      fd.append("password", info.document);
      fd.append("password_confirmation", info.document);

      if (photoBlob) fd.append("photo", photoBlob, "docente-foto.jpg");

      await api.post("/docent", fd);
      onDone();
    } catch (err: any) {
      console.error("Error saving docent:", err);
      const errorMessage = err.message || (typeof err === "string" ? err : "Error al guardar el docente. Intenta de nuevo.");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50 mb-2">Paso 3</p>
        <h2 className="font-plus text-white font-bold tracking-tight" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Foto del docente
        </h2>
        <p className="text-white/60 text-sm font-plus mt-2">
          Opcional — sube o toma una foto de perfil.
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-white/20 to-transparent" />
      </div>

      {/* ─── Single viewfinder container, always in DOM ─── */}
      <motion.div
        initial={false}
        animate={{ height: mode === "idle" ? 0 : "auto", opacity: mode === "idle" ? 0 : 1 }}
        style={{ overflow: "hidden" }}
        className="flex flex-col gap-4"
      >
        {/* Viewfinder Frame */}
        <div className="relative rounded-[12px] overflow-hidden border border-white/15 bg-black w-full aspect-video shadow-2xl">
          {/* Live video stream (mirrored) */}
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", display: mode === "live" ? "block" : "none" }}
          />
          {/* Canvas: frozen camera shot OR uploaded file preview */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              display: mode === "frozen" || mode === "file" ? "block" : "none",
              transform: mode === "frozen" ? "scaleX(-1)" : "none",
            }}
          />

          {/* Live scanning indicator effect */}
          {mode === "live" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border border-white/20 rounded-[24px]" />
              <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white/70 uppercase pt-px">Live</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls placed BELOW the viewfinder */}
        <div className="flex justify-center gap-3">
          {mode === "live" && (
            <AnimatePresence mode="popLayout">
              <motion.button
                key="cancel"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={cancelCamera}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white border border-white/10 text-sm font-plus transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                key="capture"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={capturePhoto}
                className="px-8 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
              >
                <Camera size={18} /> Capturar foto
              </motion.button>
            </AnimatePresence>
          )}

          {(mode === "frozen" || mode === "file") && (
            <AnimatePresence mode="popLayout">
              <motion.button
                key="retake"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={retake}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white border border-white/10 text-sm font-plus transition-colors"
              >
                {mode === "frozen" ? "Repetir foto" : "Eliminar archivo"}
              </motion.button>
              <motion.div
                key="status"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded-full text-sm font-plus flex items-center gap-2"
              >
                <Check size={16} /> {mode === "frozen" ? "Foto capturada" : "Archivo seleccionado"}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Idle chooser */}
      {mode === "idle" && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={startCamera}
            className="group border border-white/10 bg-black/40 rounded-[6px] hover:border-white/30 hover:bg-black/60 transition-all h-36 flex flex-col items-center justify-center gap-3"
          >
            <Camera size={30} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <span className="text-white/50 text-[11px] font-mono uppercase tracking-widest group-hover:text-white transition-colors">Usar cámara</span>
          </button>
          <div onClick={() => inputRef.current?.click()}
            className="group cursor-pointer border border-white/10 bg-black/40 rounded-[6px] hover:border-white/30 hover:bg-black/60 transition-all h-36 flex flex-col items-center justify-center gap-3"
          >
            <Upload size={30} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <span className="text-white/50 text-[11px] font-mono uppercase tracking-widest group-hover:text-white transition-colors">Subir archivo</span>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />


      {mode === "idle" && (
        <p className="text-center text-white/25 text-[11px] font-mono uppercase tracking-widest">— sin foto seleccionada —</p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-red-300 text-sm font-plus border border-red-500/30 bg-red-500/10 rounded-[6px] px-4 py-3"
          >{error}</motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mt-2">
        <button
          onClick={() => { cancelCamera(); onBack(); }}
          disabled={loading}
          className="h-[56px] flex-1 border border-white/20 rounded-[6px] bg-black/20 text-white/70 text-sm font-plus font-bold tracking-[0.15em] uppercase hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
        >← Volver</button>
        <motion.button
          onClick={handleSubmit} disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="h-[56px] flex-[2] bg-white text-black rounded-[6px] shadow-lg shadow-white/10 text-[14px] font-plus font-bold tracking-[0.15em] uppercase hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Guardando...</>
            : <>Guardar docente <Check size={18} /></>}
        </motion.button>
      </div>
    </div>
  );
}

/* Success screen  */

function StepSuccess({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
      <div>
        <h2 className="font-plus text-white font-bold text-2xl">Docente registrado</h2>
        <p className="text-white/40 text-sm font-plus mt-1">El docente fue creado exitosamente.</p>
      </div>
      <button
        onClick={onReset}
        className="
          h-[48px] px-8 border border-white/20 rounded-[3px]
          text-white/60 text-sm font-plus uppercase tracking-widest
          hover:bg-white/5 hover:text-white transition-colors
        "
      >
        Registrar otro
      </button>
    </motion.div>
  );
}

/* Wizard wrapper  */
const slideVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -32 }),
};



export default function FormularioRegistro() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [info, setInfo] = useState<DocenteInfo | null>(null);
  const [done, setDone] = useState(false);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };
  const reset = () => { setStep(0); setInfo(null); setDone(false); };

  const stepKey = done ? "success" : `step${step}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-[12px] shadow-2xl"
    >
      {!done && <StepIndicator current={step} />}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={stepKey}
          custom={dir}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {done ? (
            <StepSuccess onReset={reset} />
          ) : step === 0 ? (
            <StepDocumento onNext={(data) => { setInfo(data); goNext(); }} />
          ) : step === 1 ? (
            <StepVerificar info={info!} onNext={goNext} onBack={goBack} />
          ) : (
            <StepFoto info={info!} onBack={goBack} onDone={() => setDone(true)} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}