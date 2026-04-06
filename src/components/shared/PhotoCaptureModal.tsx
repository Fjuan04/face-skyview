import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Upload, X } from "lucide-react";
import { api } from "@/lib/api";

/* ─── Types ──────────────────────────────────────────────────── */
interface PhotoCaptureModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  uploadEndpoint: string;
  extraData?: Record<string, any>;
  fieldName?: string; // name of the file field in FormData, defaults to 'photo'
}

/* ─── Component ──────────────────────────────────────────────── */
export default function PhotoCaptureModal({
  title = "Capturar Foto",
  description = "Toma o sube una foto para completar el perfil.",
  isOpen,
  onClose,
  onSuccess,
  uploadEndpoint,
  extraData = {},
  fieldName = "photo"
}: PhotoCaptureModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<"idle" | "live" | "frozen" | "file">("idle");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError(null);
    setMode("live");
    requestAnimationFrame(async () => {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = ms;
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = ms;
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(extraData).forEach(([key, val]) => fd.append(key, String(val)));
      if (photoBlob) fd.append(fieldName, photoBlob, "captured-photo.jpg");

      const response = await api.post(uploadEndpoint, fd);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-[12px] shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-plus text-white font-bold tracking-tight text-2xl">
              {title}
            </h2>
            <p className="text-white/60 text-sm font-plus mt-1">
              {description}
            </p>
            <div className="mt-5 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <motion.div
            initial={false}
            animate={{ height: mode === "idle" ? 0 : "auto", opacity: mode === "idle" ? 0 : 1 }}
            style={{ overflow: "hidden" }}
            className="flex flex-col gap-4"
          >
            <div className="relative rounded-[12px] overflow-hidden border border-white/15 bg-black w-full aspect-video shadow-2xl">
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)", display: mode === "live" ? "block" : "none" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{
                  objectFit: "cover",
                  display: mode === "frozen" || mode === "file" ? "block" : "none",
                  transform: mode === "frozen" ? "scaleX(-1)" : "none",
                }}
              />
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

            <div className="flex justify-center gap-3">
              {mode === "live" && (
                <>
                  <button onClick={cancelCamera} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white border border-white/10 text-sm font-plus transition-colors">
                    Cancelar
                  </button>
                  <button onClick={capturePhoto} className="px-8 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                    <Camera size={18} /> Capturar
                  </button>
                </>
              )}
              {(mode === "frozen" || mode === "file") && (
                <button onClick={retake} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white border border-white/10 text-sm font-plus transition-colors">
                  {mode === "frozen" ? "Repetir foto" : "Eliminar archivo"}
                </button>
              )}
            </div>
          </motion.div>

          {mode === "idle" && (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={startCamera} className="group border border-white/10 bg-black/40 rounded-[6px] hover:border-white/30 hover:bg-black/60 transition-all h-36 flex flex-col items-center justify-center gap-3">
                <Camera size={30} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <span className="text-white/50 text-[11px] font-mono uppercase tracking-widest group-hover:text-white transition-colors">Usar cámara</span>
              </button>
              <div onClick={() => inputRef.current?.click()} className="group cursor-pointer border border-white/10 bg-black/40 rounded-[6px] hover:border-white/30 hover:bg-black/60 transition-all h-36 flex flex-col items-center justify-center gap-3">
                <Upload size={30} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <span className="text-white/50 text-[11px] font-mono uppercase tracking-widest group-hover:text-white transition-colors">Subir archivo</span>
              </div>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-300 text-sm font-plus border border-red-500/30 bg-red-500/10 rounded-[6px] px-4 py-3">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <button onClick={onClose} disabled={loading} className="h-[56px] flex-1 border border-white/20 rounded-[6px] bg-black/20 text-white/70 text-sm font-plus font-bold tracking-[0.15em] uppercase hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40">
              Cerrar
            </button>
            <motion.button onClick={handleSubmit} disabled={loading || !photoBlob} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-[56px] flex-[2] bg-white text-black rounded-[6px] shadow-lg shadow-white/10 text-[14px] font-plus font-bold tracking-[0.15em] uppercase hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 /> : <>Actualizar foto <Check size={18} /></>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Loader2() {
  return <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />;
}
