import { motion, useScroll, useTransform, vh } from "framer-motion";
import { useRef } from "react";
import TextType from "../components/text/TextType";
import ShinyText from "../components/text/ShinyText";
function Home(){

  return (
    <div className="bg-red-100 h-[200vh]">
      <div id="hero" className="bg-[url('/senadia.png')] bg-cover h-screen bg-center">
          <ShinyText text="face" className="font-(--font-mi) text-5xl font-"/>
      </div>
    </div>
  )
}

export default Home;