import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/Navbar";
import FormularioRegistro from "@/components/admin/FormularioRegistro";
import ListadoAmbientes, {
  type Ambiente,
} from "@/components/admin/ListadoAmbientes";
import { api } from "@/lib/api"; // ajusta al path real

gsap.registerPlugin(ScrollTrigger);

/* Tabs */
type Tab = "docentes" | "ambientes";

const TABS: { key: Tab; label: string }[] = [
  { key: "docentes", label: "Registrar docente" },
  { key: "ambientes", label: "Ambientes" },
];

/* Component  */
export default function Administracion() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>("docentes");
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);

  /* Pin initial states  */
  useLayoutEffect(() => {
    gsap.set(bgRef.current, { opacity: 0, scale: 1.06 });
    gsap.set("#navbar", { y: -50, opacity: 0 });
    gsap.set(contentRef.current, { y: 40, opacity: 0 });
    gsap.set(overlayRef.current, { opacity: 0.55 }); // dark tint stays
  }, []);

  /* Entry animation  */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(bgRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.3,
        ease: "power2.out",
      })
        .to(
          "#navbar",
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.5)",
            clearProps: "transform",
          },
          "-=0.9",
        )
        .to(contentRef.current, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  /* ── Load ambientes  */
  useEffect(() => {
    if (activeTab !== "ambientes") return;
    api
      .get("/admin/ambientes")
      .then((data) => setAmbientes(data as Ambiente[]))
      .catch(console.error);
  }, [activeTab]);

  /* Toggle ambiente  */
  const handleToggle = async (id: number, abierto: boolean) => {
    try {
      await api.put(`/admin/ambientes/${id}`, { abierto });
      setAmbientes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, abierto } : a)),
      );
    } catch (err) {
      console.error("Error al actualizar ambiente", err);
    }
  };

  return (
    <div ref={wrapperRef} className="min-h-screen overflow-hidden ">
      <Navbar
        solidBg
        items={[
          { label: "Inicio", href: "/", type: "link" },
          {
            label: "Registrar docente",
            href: "docentes",
            type: "button",
            onClick: () => setActiveTab("docentes"),
            active: activeTab === "docentes",
          },
          {
            label: "Ambientes",
            href: "ambientes",
            type: "button",
            onClick: () => setActiveTab("ambientes"),
            active: activeTab === "ambientes",
          },
        ]}
      />

      {/* ── Full-height hero background (same pattern as Home) ── */}
      <div className="fixed  inset-0 top-0 z-0 h-dvh overflow-hidden pointer-events-none">
        <div
          ref={bgRef}
          className="transition-[background-image] duration-700 ease-in-out absolute inset-0 bg-cover bg-center dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')]"
          style={{ willChange: "transform, opacity" }}
        />
        {/* Persistent dark overlay for readability */}
        <div ref={overlayRef} className="absolute inset-0 bg-black" />
        <div className="hero-gradient absolute inset-0" />
        <div className="grain-overlay absolute inset-0" />
      </div>

      {/* ── Scrollable content on top of sticky bg ──────────── */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top spacer so content starts below navbar */}
        <div className="h-24" />

        <main className="flex-1 flex flex-col items-center px-6 justify-center">
          
          {/* Tab content */}
          {activeTab === "docentes" && <FormularioRegistro />}
          {activeTab === "ambientes" && (
            <ListadoAmbientes ambientes={ambientes} onToggle={handleToggle} />
          )}
        </main>
      </div>
    </div>
  );
}
