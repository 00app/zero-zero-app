import { motion } from "framer-motion";

interface GlitchTextProps {
  children: React.ReactNode;
  isGlitching: boolean;
  style?: React.CSSProperties;
}

export function GlitchText({ children, isGlitching, style }: GlitchTextProps) {
  return (
    <motion.div
      className="relative"
      animate={isGlitching ? {
        x: [0, -1, 1, -1, 0],
        y: [0, 1, -1, 1, 0]
      } : { x: 0, y: 0 }}
      transition={{
        duration: 0.2,
        repeat: isGlitching ? Infinity : 0,
        ease: "linear"
      }}
      style={{ fontWeight: "700", ...style }}
    >
      {children}
      {isGlitching && (
        <>
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              color: "var(--zz-grey)",
              clipPath: "inset(40% 0 50% 0)",
              fontWeight: "700",
              userSelect: "none",
            }}
            animate={{
              x: [-2, 2, -2],
              opacity: [0.8, 0.3, 0.7],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {children}
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              color: "var(--zz-grey)",
              clipPath: "inset(20% 0 60% 0)",
              fontWeight: "700",
              userSelect: "none",
            }}
            animate={{
              x: [2, -2, 2],
              opacity: [0.6, 0.9, 0.4],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              delay: 0.1,
              ease: "linear",
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}