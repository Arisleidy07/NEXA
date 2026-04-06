"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"grow" | "scan" | "fade">("grow");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Phase 1: Image grows (0 → 1s)
    // Phase 2: Laser scans (1s → 2.2s) + sound
    // Phase 3: Fade out (2.2s → 2.8s)
    const scanTimer = setTimeout(() => {
      setPhase("scan");
      // Play sound when laser starts
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("/plin.mp3");
          audioRef.current.volume = 0.7;
        }
        audioRef.current.play().catch(() => {});
      } catch {}
    }, 900);

    const fadeTimer = setTimeout(() => {
      setPhase("fade");
    }, 2200);

    const doneTimer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(scanTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 40%, #dbeafe 100%)",
      }}
    >
      {/* Centered content */}
      <div className="relative flex flex-col items-center">
        {/* Barcode image with scanner */}
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src="/barra.png"
            alt="NEXA"
            width={280}
            height={180}
            priority
            className={`object-contain transition-all duration-[900ms] ease-in-out ${
              phase === "grow"
                ? "scale-[0.3] opacity-30"
                : "scale-100 opacity-100"
            }`}
            style={{ willChange: "transform, opacity" }}
          />

          {/* Red laser line */}
          {(phase === "scan" || phase === "fade") && (
            <div
              className="absolute top-0 bottom-0 w-[2px]"
              style={{
                background: "rgba(255, 30, 30, 0.5)",
                boxShadow:
                  "0 0 6px 2px rgba(255, 30, 30, 0.35), 0 0 16px 5px rgba(255, 30, 30, 0.18), 0 0 36px 10px rgba(255, 30, 30, 0.08)",
                animation: "splash-laser 1.2s ease-in-out forwards",
              }}
            >
              {/* Laser glow trail */}
              <div
                className="absolute top-0 bottom-0 -left-3 w-8"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 30, 30, 0.05), transparent)",
                }}
              />
            </div>
          )}
        </div>

        {/* NEXA text below */}
        <p
          className={`mt-6 text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1e40af] to-[#3b82f6] bg-clip-text text-transparent transition-all duration-700 ${
            phase === "grow"
              ? "opacity-0 translate-y-3"
              : "opacity-100 translate-y-0"
          }`}
        >
          NEXA
        </p>
      </div>
    </div>
  );
}
