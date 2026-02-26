import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextType from "@/components/text/TextType";
import eye from "@/assets/icons/eye-icon.svg";
import Navbar from "@/components/Navbar";

gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  startAnimation: boolean;
}

function Home({ startAnimation }: HomeProps) {
  /* ─── Refs ─────────────────────────────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const btn1Ref = useRef<HTMLAnchorElement>(null);
  const btn2Ref = useRef<HTMLAnchorElement>(null);

  /* ─── Step 1: Pin initial states before first paint ─────────
     Runs immediately so elements never flash at visible opacity  */
  useLayoutEffect(() => {
    gsap.set(bgRef.current, { opacity: 0, scale: 1.1 });
    gsap.set("#navbar", { y: -50, opacity: 0 });
    gsap.set(headingRef.current, { y: 80, opacity: 0 });
    gsap.set([btn1Ref.current, btn2Ref.current], { y: 20, opacity: 0, scale: 0.9 });
  }, []);

  /* ─── Step 2: Run animations only when loader finishes ──────── */
  useEffect(() => {
    if (!startAnimation) return;

    const ctx = gsap.context(() => {

      /* ── Entry Timeline ──────────────────────────────────────── */
      // Only transform + opacity — GPU-friendly (no filter:blur, no clipPath)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl
        // 1. BG: fade in + subtle scale
        .to(bgRef.current,
          { opacity: 1, scale: 1, duration: 1.3, ease: "power2.out" }
        )
        // 2. Navbar drops from above
        .to("#navbar",
          { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)", clearProps: "transform" },
          "-=0.9"
        )
        // 5. Heading rises from below
        .to(headingRef.current,
          { y: 0, opacity: 1, duration: 0.9 },
          "-=0.45"
        )
        // 6. CTA buttons staggered
        .to([btn1Ref.current, btn2Ref.current],
          { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.8)" },
          "-=0.45"
        );

      /* ── ScrollTrigger: Hero exit (CSS Sticky tracking) ──────── */
      gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=100%", // track the first 100vh of scrolling
          scrub: 1.8,
        },
      })
        .to(headingRef.current, { y: -160, opacity: 0, ease: "none" }, 0)
        .to(buttonsRef.current, { y: 60, opacity: 0, ease: "none" }, 0)
        .to(bgRef.current, { scale: 1.07, ease: "none" }, 0)
        .to(whiteRef.current, { opacity: 1, ease: "none" }, 0);

    }, wrapperRef);

    return () => ctx.revert();
  }, [startAnimation]);

  /* ─── Magnetic hover ────────────────────────────────────────── */
  const onMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.35;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
    gsap.to(e.currentTarget, { x: dx, y: dy, duration: 0.3, ease: "power2.out", overwrite: true });
  };

  const onMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", overwrite: true });
  };


  return (
    <div ref={wrapperRef}>

      <Navbar />

      {/* ━━ Hero Section ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id="home"
        className="sticky top-0 z-0 h-screen overflow-hidden"
      >
        {/* BG image based on theme */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center z-0 transition-[background-image] duration-700 ease-in-out dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')]"
          style={{ willChange: "transform, opacity" }}
        />

        {/* Bottom gradient */}
        <div className="hero-gradient absolute inset-0 z-[1] pointer-events-none" />

        {/* Exit overlay (white in light mode, darkslate in dark mode) */}
        <div
          ref={whiteRef}
          className="absolute inset-0 z-[2] opacity-0 pointer-events-none dark:bg-[#0F172A] bg-white"
        />

        {/* Grain */}
        <div className="grain-overlay absolute inset-0 z-[3] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-12 pb-14">

          <div ref={headingRef} className="max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%]">
            <TextType
              className="font-plus text-white font-bold"
              style={{ fontSize: "clamp(42px, 7.5vw, 110px)", lineHeight: 1.04 }}
              loop={false}
              showCursor={true}
              cursorCharacter="|"
              initialDelay={2000}
              text={[
                "Bienvenido a face Skyview.",
                "Auditoría y monitoreo en tiempo real de ambientes del SENA.",
                "Visualiza la ocupación desde una perspectiva aérea e inteligente.",
              ]}
            />
          </div>

          <div ref={buttonsRef} className="flex gap-4 pt-12 lg:pt-20">
            <a
              ref={btn1Ref}
              href="#ambientes"
              className="backdrop-blur-sm border border-white/50 rounded-[3px]
                         h-[70px] w-[70px] flex items-center justify-center
                         hover:bg-white/15 transition-colors"
              onMouseMove={onMagneticMove}
              onMouseLeave={onMagneticLeave}
            >
              <img className="w-[46%]" src={eye} alt="Ver ambientes" />
            </a>

            <a
              ref={btn2Ref}
              href="#ambientes"
              className="backdrop-blur-sm border border-white/50 rounded-[3px]
                         h-[70px] px-8 flex items-center justify-center
                         text-white text-2xl font-plus
                         hover:bg-white/15 transition-colors"
              onMouseMove={onMagneticMove}
              onMouseLeave={onMagneticLeave}
            >
              Ver Ambientes
            </a>
          </div>
        </div>
      </section>

      {/* ━━ Placeholder sections ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="acerca-de" className="relative z-10 h-screen bg-background flex items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <h2 className="text-foreground text-4xl font-bold font-plus">Acerca De</h2>
      </section>

      <section id="ambientes" className="relative z-10 h-screen bg-muted flex items-center justify-center">
        <h2 className="text-foreground text-4xl font-bold font-plus">Ambientes</h2>
      </section>

      <section id="collab" className="relative z-10 h-screen bg-background flex items-center justify-center">
        <h2 className="text-foreground text-4xl font-bold font-plus">Collab</h2>
      </section>

    </div>
  );
}

export default Home;