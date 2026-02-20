import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import TextType from "@/components/text/TextType";
import ShinyText from "@/components/text/ShinyText";
import eye from "@/assets/icons/eye-icon.svg";
import GooeyNav from "@/components/GooeyNav";

function Home() {
  const items = [
    { label: "Home",      href: "#home" },
    { label: "Acerca De", href: "#acerca-de" },
    { label: "Ambientes", href: "#ambientes" },
    { label: "Collab",    href: "#collab" },
  ];

  const reference = useRef(null);
  const { scrollYProgress } = useScroll({ target: reference });

  const height = useTransform(
    scrollYProgress,
    [0, 0.8, 1],
    ["100vh", "20vh", "100vh"]
  );
  const heightBlur = useTransform(
    scrollYProgress,
    [0, 0.8, 0.8],
    ["100vh", "20vh", "0vh"]
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["-100px", "0px"]
  );

  return (

    <div ref={reference} className="bg-red-100 h-[400vh]">
      <nav className="navbar px-12.5 sticky top-4 z-20 h-15.5 flex justify-between items-center overflow-visible">
          <ShinyText
            text="face"
            className="font-plus text-[48px] font-light cursor-pointer"
          />

          <motion.div
            initial={{ translateY: "-100px" }}
            style={{ translateY }}
            className="font-plus"
          >
            <GooeyNav
              items={items}
              particleCount={5}
              particleDistances={[90, 10]}
              particleR={500}
              initialActiveIndex={0}
              animationTime={600}
              timeVariance={400}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />
          </motion.div>

          <a href="#" className="logo h-15 bg-white rounded-full w-15 cursor-pointer">
            <img className="object-cover -translate-x-0.5" src="/logo-sena.png" alt="" />
          </a>
        </nav>
      {/*  SECCIÓN HOME */}
      <section
        id="home"
        className=" top-0 px-12.5 bg-white bg-cover h-screen z-20 bg-center flex flex-col justify-between"
      >
        <motion.div
          className="bg-[url('/sena-dia.png')] h-full w-full z-0 bg-cover bg-center absolute top-[50%] -translate-y-[50%] left-0"
          initial={{ height: "100vh" }}
          style={{ height }}
        >
          <motion.div
            initial={{ height: "100vh" }}
            style={{ height: heightBlur }}
            className="backdrop-blur-xs h-full pointer-events-none"
          />
        </motion.div>
        

        {/* TEXT TYPING */}
        <TextType
          className="font-plus text-white relative z-20 text-[115px]/[120px] font-bold"
          loop={false}
          text={[
            "Bienvenido a face Skyview.",
            "Auditoría y monitoreo en tiempo real de ambientes del SENA.",
            "Visualiza la ocupación desde una perspectiva aérea e inteligente.",
          ]}
        />

        <div className="buttons flex gap-4">
          <a
            href=""
            className="backdrop-blur-xs border-[0.01px] rounded-[3px] border-white h-17.5 w-17.5 flex items-center justify-center"
          >
            <img className="w-[50%]" src={eye} alt="" />
          </a>
          <a
            href=""
            className="backdrop-blur-xs border-[0.01px] rounded-[3px] border-white h-17.5 px-7.5 flex items-center justify-center text-white text-[24px]"
          >
            Ver Ambientes
          </a>
        </div>
      </section>

      {/*  SECCIÓN ACERCA DE */}
      <section id="acerca-de" className="h-screen bg-red-500 flex items-center justify-center">
        <h2 className="text-white text-4xl font-bold">Acerca De</h2>
      </section>

      {/*  SECCIÓN AMBIENTES */}
      <section id="ambientes" className="h-screen bg-red-600 flex items-center justify-center">
        <h2 className="text-white text-4xl font-bold">Ambientes</h2>
      </section>

      {/*  SECCIÓN COLLAB */}
      <section id="collab" className="h-screen bg-red-700 flex items-center justify-center">
        <h2 className="text-white text-4xl font-bold">Collab</h2>
      </section>

    </div>
  );
}

export default Home;