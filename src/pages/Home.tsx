import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import TextType from "../components/text/TextType";
import ShinyText from "../components/text/ShinyText";
import eye from "../assets/icons/eye-icon.svg";
function Home() {
  const reference = useRef(null);
  const { scrollYProgress } = useScroll({
    target: reference,
  });
  const height = useTransform(
    scrollYProgress,
    [0, 0.8, 1],
    ["100vh", "20vh", "100vh"],
  );
  const heightBlur = useTransform(
    scrollYProgress,
    [0, 0.8, 0.8],
    ["100vh", "20vh", "0vh"],
  );
  return (
    <div ref={reference} className="bg-red-100 h-[300vh]">
      <div
        id="hero"
        className="sticky top-0 px-12.5 py-6 bg-white bg-cover h-screen z-20 bg-center  flex flex-col justify-between"
      >
        <motion.div
          onClick={() => {
            alert();
          }}
          className="bg-[url('/sena-dia.png')] h-full w-full z-0 bg-cover bg-center absolute top-[50%] -translate-y-[50%] left-0 x"
          initial={{
            height: "100vh",
          }}
          style={{
            height,
          }}
        >
          <motion.div
            onClick={(e) => {
              e.stopPropagation();
            }}
            initial={{
              height: "100vh",
            }}
            style={{
              height: heightBlur,
            }}
            className={`backdrop-blur-xs h-full pointer-events-none`}
          ></motion.div>
        </motion.div>

        {/* NAVBAR */}
        <nav className="navbar relative z-20 h-15.5 flex justify-between items-center">
          <ShinyText
            text="face"
            className="font-plus text-[48px] font-light cursor-pointer "
          />
          <a href="#hola" className="logo h-15 bg-white rounded-full w-15 cursor-pointer">
            <img
              className="object-cover -translate-x-0.5"
              src="/logo-sena.png"
              alt=""
            />
          </a>
        </nav>

        {/* EFECTO TEXT TYPING  */}
        <TextType
          className="font-plus text-white relative z-20 text-[115px]/[135px] font-bold"
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
            className=" backdrop-blur-xs border-[0.01px] rounded-[3px] border-white h-17.5 w-17.5 flex items-center justify-center"
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
      </div>
      <div className="bg-red-500 h-[200vh] flex flex-col-reverse">
        <h2 id="hola">hola</h2>
      </div>
    </div>
  );
}

export default Home;
