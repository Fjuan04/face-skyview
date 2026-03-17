import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: "capture",
    label: "Captura",
    title: "ESP32-CAM en campo",
    description:
      "Una ESP32-CAM montada en el ambiente captura fotogramas en tiempo real. Su lente gran angular cubre el espacio completo sin puntos ciegos.",
  },
  {
    id: "transmit",
    label: "Transmision",
    title: "Envio por red",
    description:
      "Cada fotograma viaja por la red local al servidor central mediante HTTP. La latencia es menor a 200 ms por frame.",
  },
  {
    id: "detect",
    label: "Deteccion",
    title: "Reconocimiento facial",
    description:
      "El servidor ejecuta el modelo sobre el frame recibido. Cada rostro es identificado y asociado a un registro en la base de datos.",
  },
  {
    id: "report",
    label: "Reporte",
    title: "Monitoreo en tiempo real",
    description:
      "El resultado se refleja al instante en el panel de control: ocupacion del ambiente, historial y alertas de acceso.",
  },
];

export default function AcercaDe() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const wifiRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const gridCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ctx: gsap.Context | null = null;

    const buildAnimations = () => {
      // Clean previous context + triggers before rebuilding
      if (ctx) ctx.revert();
      ScrollTrigger.refresh();

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const totalScroll = window.innerHeight * (isDesktop ? 2.5 : 3);

      ctx = gsap.context(() => {
        /* ── Title: fast entrance animation (non-scrubbed, once) ──────────
           Fires as soon as the section reaches 90% of the viewport.
           No scroll-lag — just a clean 0.55s ease-in.                     */
        if (titleRef.current) {
          gsap.set(titleRef.current, { y: 40, opacity: 0 });
          gsap.to(titleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              // Fire only when section is fully pinned at the top
              start: "top top",
              once: true,
            },
          });
        }

        /* ── Columns: quick entrance, same trigger ────────────────────── */
        if (columnsRef.current) {
          gsap.set(columnsRef.current, { y: 30, opacity: 0 });
          gsap.to(columnsRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              once: true,
            },
          });
        }

        /* ── Card: subtle 3D entrance (non-scrubbed) ──────────────────── */
        if (cardRef.current) {
          gsap.set(cardRef.current, { rotateY: -18, scale: 0.92 });
          gsap.to(cardRef.current, {
            rotateY: 0,
            scale: 1,
            duration: 0.7,
            delay: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              once: true,
            },
          });
        }

        /* ── Paused timeline + ratchet pin ─────────────────────────────────
           The timeline is paused and NOT attached to a scrub. Instead, a
           dedicated ScrollTrigger drives it forward via onUpdate.
           Once completed (progress ≥ 1), reverse scroll is ignored — the
           animation stays frozen at its final state while the section
           remains pinned so the user can scroll back to Hero freely.       */
        const tl = gsap.timeline({ paused: true });

        // Phase 1 — title + columns exit  (0.16 – 0.28)
        if (titleRef.current) {
          tl.to(titleRef.current, { y: -40, opacity: 0, duration: 0.1 }, 0.16);
        }
        if (columnsRef.current) {
          tl.to(columnsRef.current, { y: -30, opacity: 0, duration: 0.1 }, 0.16);
        }

        // Phase 2 — WiFi rings  (0.32 – 0.54)
        if (wifiRef.current) {
          tl
            .fromTo(wifiRef.current,
              { opacity: 0, scale: 0.5 },
              { opacity: 1, scale: 1, duration: 0.1, ease: "back.out(1.6)" },
              0.32
            )
            .to(wifiRef.current, { opacity: 0, scale: 1.5, duration: 0.1 }, 0.54);
        }

        // Phase 3 — cards
        if (isDesktop) {
          gridCardsRef.current.forEach((el, i) => {
            if (!el) return;
            tl.fromTo(
              el,
              { y: 50, opacity: 0, scale: 0.93 },
              { y: 0, opacity: 1, scale: 1, duration: 0.12, ease: "power3.out" },
              0.60 + i * 0.07
            );
          });
        } else {
          const base = 0.40;
          const gap = 0.145;
          stepsRef.current.forEach((el, i) => {
            if (!el) return;
            const s = base + i * gap;
            tl
              .fromTo(el,
                { x: 90, opacity: 0, rotateY: 14 },
                { x: 0, opacity: 1, rotateY: 0, duration: 0.1, ease: "power3.out" },
                s
              )
              .to(el, { x: -90, opacity: 0, duration: 0.07 }, s + 0.11);
          });
        }

        // Progress bar
        if (progressRef.current) {
          tl.fromTo(progressRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.65, ease: "none", transformOrigin: "left center" },
            0.28
          );
        }

        // ScrollTrigger: handles PIN + drives the timeline forward (ratchet)
        let completed = false;
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${totalScroll}`,
          pin: pinRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate(self) {
            if (completed) return; // animation locked at final state
            // Drive timeline smoothly (equivalent to scrub:2)
            gsap.to(tl, {
              progress: self.progress,
              duration: 1.6,
              ease: "power2.out",
              overwrite: true,
            });
            if (self.progress >= 0.99) {
              completed = true;
              tl.progress(1); // snap to final state immediately
            }
          },
        });
      }, sectionRef);
    };

    // Initial setup
    buildAnimations();

    // Resize: rebuild when crossing the lg breakpoint
    const mql = window.matchMedia("(min-width: 1024px)");
    mql.addEventListener("change", buildAnimations);

    return () => {
      mql.removeEventListener("change", buildAnimations);
      if (ctx) ctx.revert();
    };
  }, []);

  // 3-D tilt on ESP32-CAM card
  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 20;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * -20;
    gsap.to(cardRef.current, { rotateX: dy, rotateY: dx, duration: 0.35, ease: "power2.out", overwrite: true });
  };
  const onTiltLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.4)", overwrite: true });
  };

  return (
    <section ref={sectionRef} id="acerca-de" className="relative pt-24">
      <div
        ref={pinRef}
        className="w-full h-dvh overflow-hidden bg-white dark:bg-[#0F172A] relative
                   flex flex-col items-center justify-center"
        style={{ perspective: "1400px" }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px,transparent 1px),linear-gradient(90deg,var(--foreground) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Title — starts hidden, enters fast via non-scrubbed trigger */}
        <div
          ref={titleRef}
          className="absolute top-[72px] left-0 right-0 flex flex-col items-center gap-2 z-20 px-4"
          style={{ opacity: 0 }}
        >
          <span className="text-xs font-plus font-semibold tracking-[0.3em] uppercase text-foreground/40">
            Acerca del sistema
          </span>
          <h2
            className="font-plus font-bold text-foreground text-center"
            style={{ fontSize: "clamp(26px, 4vw, 68px)", lineHeight: 1.06 }}
          >
            Como funciona face skyview
          </h2>
        </div>

        {/* Two-column layout — enters fast via non-scrubbed trigger */}
        <div
          ref={columnsRef}
          className="relative z-10 w-full max-w-7xl px-6 md:px-14
                     flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20"
          style={{ opacity: 0 }}
        >
          <div className="flex-1 flex flex-col gap-5 max-w-lg">
            <p
              className="font-plus font-bold text-foreground leading-tight"
              style={{ fontSize: "clamp(20px, 2.6vw, 40px)" }}
            >
              Reconocimiento facial aereo para ambientes del SENA
            </p>
            <p className="font-plus text-foreground/60 text-base lg:text-lg leading-relaxed">
              El modulo ESP32-CAM se instala en cada ambiente y transmite en tiempo
              real al servidor. El sistema identifica rostros, registra asistencia y
              emite alertas de acceso no autorizado, todo de forma automatica.
            </p>
            <div className="flex flex-wrap gap-2">
              {["OV2640 2MP", "WiFi 802.11 b/g/n", "MicroSD", "HTTP streaming"].map((s) => (
                <span
                  key={s}
                  className="font-plus text-xs font-semibold px-3 py-1.5 rounded-full
                             border border-border text-foreground/55 bg-muted"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* ESP32-CAM card */}
          <div
            ref={cardRef}
            onMouseMove={onTilt}
            onMouseLeave={onTiltLeave}
            className="relative flex-shrink-0 cursor-pointer"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          >
            <div
              className="relative rounded-2xl border border-border bg-card select-none overflow-hidden"
              style={{
                width: "clamp(240px, 28vw, 440px)",
                height: "clamp(240px, 28vw, 440px)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.2), 0 0 0 1px var(--border)",
              }}
            >
              <div
                className="absolute inset-0 z-10 pointer-events-none opacity-[0.05]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,var(--foreground) 0,var(--foreground) 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,var(--foreground) 0,var(--foreground) 1px,transparent 1px,transparent 24px)",
                }}
              />
              <img
                src="/esp32-cam.png"
                alt="ESP32-CAM module"
                className="absolute inset-0 w-full h-full object-contain p-5 z-20"
                style={{ filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.38))" }}
              />
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((p) => (
                <div key={p} className={`absolute ${p} w-2.5 h-2.5 rounded-full bg-foreground/25 border border-border z-30`} />
              ))}
              <div
                className="absolute inset-0 rounded-2xl -z-10"
                style={{ transform: "translateZ(-22px)", background: "var(--muted)" }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="font-plus font-bold text-foreground text-base tracking-tight">ESP32-CAM</p>
              <p className="font-plus text-foreground/40 text-sm">AI Thinker Module</p>
            </div>
          </div>
        </div>

        {/* WiFi rings */}
        <div
          ref={wifiRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          style={{ opacity: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary/35"
              style={{
                width: `${(i + 1) * 220}px`,
                height: `${(i + 1) * 220}px`,
                animation: `wifi-pulse 2s ease-out ${i * 0.45}s infinite`,
              }}
            />
          ))}
          <div className="text-center z-10 flex flex-col gap-1">
            <p className="font-plus font-bold text-foreground text-2xl">Transmitiendo</p>
            <p className="font-plus text-foreground/50 text-base">Frame enviado por red local</p>
          </div>
        </div>

        {/* DESKTOP: Grid 2×2 — revealed by scrub */}
        <div className="absolute inset-0 hidden lg:flex items-center justify-center z-20 pointer-events-none px-10">
          <div className="grid grid-cols-2 gap-5 w-full max-w-5xl">
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                ref={(el) => { gridCardsRef.current[i] = el; }}
                className="rounded-2xl border border-border bg-card shadow-2xl
                           flex overflow-hidden pointer-events-auto"
                style={{ opacity: 0 }}
              >
                <div className="w-1.5 flex-shrink-0 bg-primary" />
                <div className="flex flex-col gap-3 py-7 px-7">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                    bg-primary text-primary-foreground font-bold font-plus text-sm">
                      {i + 1}
                    </div>
                    <span className="text-xs font-plus font-semibold tracking-widest uppercase text-foreground/40">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="font-plus font-bold text-foreground text-xl leading-tight">
                    {step.title}
                  </h3>
                  <p className="font-plus text-foreground/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE: sequential cards */}
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => { stepsRef.current[i] = el; }}
            className="absolute z-20 rounded-2xl border border-border bg-card shadow-2xl
                       flex overflow-hidden lg:hidden"
            style={{ width: "clamp(290px, 52vw, 660px)", opacity: 0 }}
          >
            <div className="w-1.5 flex-shrink-0 bg-primary" />
            <div className="flex flex-col gap-3 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                                bg-primary text-primary-foreground font-bold font-plus text-sm">
                  {i + 1}
                </div>
                <span className="text-xs font-plus font-semibold tracking-widest uppercase text-foreground/40">
                  {step.label}
                </span>
              </div>
              <h3 className="font-plus font-bold text-foreground text-2xl md:text-3xl leading-tight">
                {step.title}
              </h3>
              <p className="font-plus text-foreground/60 text-base leading-relaxed">
                {step.description}
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(90deg,transparent,var(--primary),transparent)",
                  animation: "scan-line 2.4s linear infinite",
                }}
              />
            </div>
          </div>
        ))}

        {/* Progress bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-px bg-border rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-foreground rounded-full"
            style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
          />
        </div>
      </div>
    </section>
  );
}
