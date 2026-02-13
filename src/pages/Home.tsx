import { motion, useScroll, useTransform } from "framer-motion";
import TextType from "../components/text/TextType";


export default function Home() {
  const { scrollYProgress } = useScroll();

  const width = useTransform(scrollYProgress, [0, 0.5], ["100%", "60%"]);
  const height = useTransform(scrollYProgress, [0, 0.5], ["700px", "400px"]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], ["0px", "24px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], ["1", "0"], {
    clamp: false,
  });

  return (
    <div className="h-[200vh] bg-white" >

      <TextType
        text={["Text typing effect", "for your websites", "Happy coding!"]}
        typingSpeed={75}
        pauseDuration={1000}
        showCursor
        cursorCharacter="_"
        loop={false}
        deletingSpeed={50}
        className="text-4xl font-bold text-green-700 dark:text-red-500"
        cursorBlinkDuration={0.5}
      />
      <div className=" sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{
            width,
            height,
            borderRadius,
            backgroundImage: "url('/sena_aerea.jpg')",
          }}
          className="bg-cover min-w-[90%] md:min-w-0 bg-center flex items-center justify-center shadow-2xl"
        >

            <motion.h2
              style={{ opacity }}
              className="text-white w-fit text-4xl font-bold bg-[#eee4] px-15 py-10 rounded-xl backdrop-blur-xs"
            >
              Nuestra Casa
            </motion.h2>

        </motion.div>
      </div>
      <motion.div>
        hola a todos
      </motion.div>
    </div>
  );
}
