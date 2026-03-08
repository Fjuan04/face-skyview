import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento.trim()) return;
    setLoading(true);
    setError(null);
    try {

      const data = await api.post("/search/docent", { document: documento }) as DocenteInfo;
      onNext(data);
    } catch (err: any){
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">Paso 1</p>
        <h2 className="font-plus text-white font-bold" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Ingresa el documento
        </h2>
        <p className="text-white/40 text-sm font-plus mt-2">
          Consultaremos los datos del docente automáticamente.
        </p>
        <div className="mt-4 h-px bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase tracking-widest text-white/50">
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
              bg-white/5 border border-white/10 rounded-[3px]
              px-4 py-3 text-white text-sm font-plus
              placeholder:text-white/20
              focus:outline-none focus:border-white/40
              transition-all duration-200
            "
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-red-400 text-sm font-plus border border-red-400/20 bg-red-400/5 rounded-[3px] px-4 py-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading || !documento.trim()}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="
            mt-2 h-[54px] w-full backdrop-blur-sm border border-white/50 rounded-[3px]
            text-white text-sm font-plus tracking-widest uppercase
            hover:bg-white/10 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Consultando...</>
          ) : "Consultar docente →"}
        </motion.button>
      </form>
    </div>
  );
}

/* Step 2: Verificar datos */
function StepVerificar({ info, onNext, onBack }: { info: DocenteInfo; onNext: () => void; onBack: () => void }) {
  const fields: { label: string; value: string | undefined }[] = [
    { label: "Nombre completo", value: `${info.username}`},
    { label: "Documento",       value: info.document },
    { label: "Correo",          value: info.institutional_email },
    { label: "Teléfono",        value: info.phone },
    { label: "Genero",        value: info.gender },
  ].filter(f => f.value);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">Paso 2</p>
        <h2 className="font-plus text-white font-bold" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Verifica los datos
        </h2>
        <p className="text-white/40 text-sm font-plus mt-2">
          Confirma que la información es correcta antes de continuar.
        </p>
        <div className="mt-4 h-px bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex flex-col gap-1 bg-white/5 border border-white/10 rounded-[3px] px-4 py-3"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              {field.label}
            </span>
            <span className="text-white font-plus text-sm">
              {field.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="
            h-[54px] flex-1 border border-white/20 rounded-[3px]
            text-white/50 text-sm font-plus tracking-widest uppercase
            hover:bg-white/5 hover:text-white transition-colors
          "
        >
          ← Volver
        </button>
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="
            h-[54px] flex-[2] backdrop-blur-sm border border-white/50 rounded-[3px]
            text-white text-sm font-plus tracking-widest uppercase
            hover:bg-white/10 transition-colors
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
  const inputRef               = useRef<HTMLInputElement>(null);
  const [preview, setPreview]  = useState<string | null>(null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(info).forEach(([k, v]) => v && formData.append(k, v));
      if (inputRef.current?.files?.[0]) {
        formData.append("foto", inputRef.current.files[0]);
      }
      await api.post("/admin/docentes", formData as unknown as Record<string, unknown>);
      onDone();
    } catch {
      setError("Error al guardar el docente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 mb-2">Paso 3</p>
        <h2 className="font-plus text-white font-bold" style={{ fontSize: "clamp(24px, 3vw, 42px)", lineHeight: 1.1 }}>
          Foto del docente
        </h2>
        <p className="text-white/40 text-sm font-plus mt-2">
          Opcional — sube una foto de perfil para el docente.
        </p>
        <div className="mt-4 h-px bg-white/10" />
      </div>

      {/* Photo upload */}
      <div
        onClick={() => inputRef.current?.click()}
        className="
          group relative cursor-pointer
          border border-dashed border-white/20 rounded-[3px]
          hover:border-white/40 transition-colors
          h-44 flex flex-col items-center justify-center gap-3
          overflow-hidden
        "
      >
        {preview ? (
          <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/30 group-hover:text-white/50 transition-colors">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white/30 text-xs font-mono uppercase tracking-widest group-hover:text-white/50 transition-colors">
              Haz clic para subir
            </span>
          </>
        )}
        {preview && (
          <div className="relative z-10 bg-black/50 rounded px-3 py-1">
            <span className="text-white text-xs font-mono">Cambiar foto</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-red-400 text-sm font-plus border border-red-400/20 bg-red-400/5 rounded-[3px] px-4 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="
            h-[54px] flex-1 border border-white/20 rounded-[3px]
            text-white/50 text-sm font-plus tracking-widest uppercase
            hover:bg-white/5 hover:text-white transition-colors
            disabled:opacity-40
          "
        >
          ← Volver
        </button>
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="
            h-[54px] flex-[2] backdrop-blur-sm border border-white/50 rounded-[3px]
            text-white text-sm font-plus tracking-widest uppercase
            hover:bg-white/10 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
          ) : "Guardar docente ✓"}
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
  exit:    (dir: number) => ({ opacity: 0, x: dir * -32 }),
};



export default function FormularioRegistro() {
  const [step, setStep] = useState(0);
  const [dir, setDir]   = useState(1);
  const [info, setInfo] = useState<DocenteInfo | null>(null);
  const [done, setDone] = useState(false);

  const goNext = () => { setDir(1);  setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };
  const reset  = () => { setStep(0); setInfo(null); setDone(false); };

  const stepKey = done ? "success" : `step${step}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg"
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