"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCheck, IconSpark, IconX } from "./ui";

type Kind = "ok" | "warn" | "err";
type Toast = { id: number; msg: string; kind: Kind };

type Ctx = { push: (msg: string, kind?: Kind) => void };

const ToastCtx = createContext<Ctx>({ push: () => {} });

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const push = useCallback((msg: string, kind: Kind = "ok") => {
    const id = idRef.current++;
    setItems((s) => [...s.slice(-3), { id, msg, kind }]);
    setTimeout(() => {
      setItems((s) => s.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 start-5 z-[120] flex w-[min(380px,calc(100vw-40px))] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3.5 text-[14px] font-bold shadow-2xl backdrop-blur-md ${
                t.kind === "ok"
                  ? "border-limed/30 bg-ink2/95 text-bone"
                  : t.kind === "warn"
                    ? "border-amber/40 bg-ink2/95 text-amber"
                    : "border-red/40 bg-ink2/95 text-red"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full ${
                  t.kind === "ok"
                    ? "bg-lime text-ink"
                    : t.kind === "warn"
                      ? "bg-amber text-ink"
                      : "bg-red text-ink"
                }`}
              >
                {t.kind === "ok" ? (
                  <IconCheck className="size-4" />
                ) : t.kind === "warn" ? (
                  <IconSpark className="size-4" />
                ) : (
                  <IconX className="size-4" />
                )}
              </span>
              <span className="leading-snug">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
