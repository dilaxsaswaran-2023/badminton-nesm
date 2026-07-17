import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { Entrant } from "../lib/types";

const messages = ["Sealing entries", "Shuffling the field", "Setting the bracket"];

interface Props {
  active: boolean;
  entrants: Entrant[];
  onComplete: () => void;
}

export function DrawAnimation({ active, entrants, onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const reset = window.setTimeout(() => setStep(0), 0);
    const first = window.setTimeout(() => setStep(1), 1000);
    const second = window.setTimeout(() => setStep(2), 2000);
    const complete = window.setTimeout(onComplete, 3000);
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(complete);
    };
  }, [active, onComplete, reducedMotion]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="ceremony-overlay no-print"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="ceremony-panel">
            <div className="slip-box" aria-hidden="true">
              {entrants.slice(0, 9).map((entrant, index) => (
                <motion.span
                  key={entrant.entryId}
                  initial={{ x: 0, y: 0, rotate: index % 2 ? 3 : -3 }}
                  animate={reducedMotion ? {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    filter: "blur(0px)",
                  } : {
                    x: [0, (index % 3 - 1) * 38, (index % 2 ? -1 : 1) * 24, 0],
                    y: [0, (index % 2 ? -1 : 1) * 22, 7, 0],
                    rotate: [0, index % 2 ? 11 : -9, index % 3 ? -5 : 7, 0],
                    filter: ["blur(0px)", "blur(1.5px)", "blur(.5px)", "blur(0px)"],
                  }}
                  transition={{ duration: 2.7, delay: index * 0.025, ease: "easeInOut" }}
                >
                  {entrant.displayName}
                </motion.span>
              ))}
            </div>
            <motion.div
              key={messages[step]}
              className="ceremony-message"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>Official procedure</span>
              <strong>{messages[step]}</strong>
              <i><b style={{ width: `${(step + 1) * 33.333}%` }} /></i>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
