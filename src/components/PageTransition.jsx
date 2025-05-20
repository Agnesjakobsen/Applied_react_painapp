import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const pathname = location.pathname;

  const goingHome = pathname === "/";

  const variants = {
    initial: { x: goingHome ? "-60%" : "60%" },
    animate: { x: "0%" },
  };

  const transition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1], 
    duration: 0.45,
  };

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="animate"
      variants={variants}
      transition={transition}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}
    >
      {children}
    </motion.div>
  );
}
