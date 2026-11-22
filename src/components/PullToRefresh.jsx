import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY;
  }, []);
  const onTouchMove = useCallback(
    (e) => {
      if (startY.current === null || refreshing) return;
      const d = e.touches[0].clientY - startY.current;
      if (d > 0) setPull(Math.min(d * 0.4, THRESHOLD + 20));
    },
    [refreshing],
  );
  const onTouchEnd = useCallback(async () => {
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
  }, [pull, refreshing, onRefresh]);

  const progress = Math.min(pull / THRESHOLD, 1);
  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: pull > 0 ? pull : 48 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <RefreshCw
              className={`w-5 h-5 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${progress * 360}deg)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
