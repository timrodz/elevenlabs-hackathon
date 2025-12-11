/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, ArrowUpRight } from "lucide-react";

interface FloatingDocumentsProps {
  documents: any[];
  initialActiveId?: number | null;
  onClose?: () => void;
}

export function FloatingDocuments({
  documents,
  initialActiveId = null,
  onClose,
}: FloatingDocumentsProps) {
  const [activeDocId, setActiveDocId] = useState<number | null>(
    initialActiveId
  );
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // If we have an initial active ID, set it
    if (initialActiveId) {
      setActiveDocId(initialActiveId);
    }
  }, [initialActiveId]);

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => (prev + 0.15) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center perspective-container">
      {/* The Galaxy / Orbit System */}
      <div className="relative w-[800px] h-[600px] flex items-center justify-center">
        {/* Central Anchor Point */}
        <div
          className={`transition-all duration-1000 ${
            activeDocId ? "opacity-0 scale-50" : "opacity-100 scale-100"
          }`}
        >
          <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]" />

          {/* Tilted Rings (Visual Guide for the Plane) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 border border-indigo-200/50 rounded-[100%] animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 border border-indigo-200/30 rounded-[100%] animate-[spin_15s_linear_infinite_reverse]" />
        </div>

        {/* Render Orbiting Cards */}
        {documents.map((doc, index) => {
          const isActive = activeDocId === doc.id;
          const isOtherActive = activeDocId && !isActive;

          // --- 3D Orbit Logic ---
          const angleDeg = rotation + index * (360 / documents.length);
          const angleRad = (angleDeg * Math.PI) / 180;

          // Orbit Dimensions
          const radiusX = 260;
          const radiusY = 80;

          // Calculate Position
          const rawX = Math.cos(angleRad) * radiusX;
          const rawY = Math.sin(angleRad) * radiusY;

          // Depth simulation
          const depthFactor = (rawY + radiusY) / (radiusY * 2); // 0 (far) to 1 (near)
          const scale = 0.75 + depthFactor * 0.25;
          const zIndex = Math.round(depthFactor * 100);
          const blur = (1 - depthFactor) * 2;

          // Override for Active State
          const x = isActive ? 0 : rawX;
          const y = isActive ? 0 : rawY;
          const finalScale = isActive ? 1 : scale;
          const finalZ = isActive ? 1000 : zIndex;
          const finalBlur = isActive ? 0 : blur;

          return (
            <div
              key={doc.id}
              onClick={() => !activeDocId && setActiveDocId(doc.id)}
              className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                cursor-pointer
                ${isActive ? "w-[400px]" : "w-52 hover:brightness-105"}
                ${
                  isOtherActive
                    ? "opacity-0 scale-50 pointer-events-none"
                    : "opacity-100"
                }
              `}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${finalScale})`,
                zIndex: finalZ,
                filter: `blur(${finalBlur}px)`,
              }}
            >
              {/* The Card Visual */}
              <div
                className={`
                  relative overflow-hidden transition-all duration-500 rounded-2xl
                  ${
                    isActive
                      ? "bg-white/90 backdrop-blur-xl border border-indigo-200 shadow-2xl shadow-indigo-200/50 h-auto min-h-[300px]"
                      : "bg-white/60 backdrop-blur-md border border-white/50 shadow-xl shadow-slate-200/50 h-20 hover:border-indigo-300/50 hover:bg-white/80"
                  }
                `}
              >
                {/* Card Header */}
                <div
                  className={`flex items-center gap-3 p-4 ${
                    isActive ? "border-b border-slate-100" : "h-full"
                  }`}
                >
                  <div
                    className={`
                      p-2 rounded-xl transition-colors shrink-0
                      ${
                        isActive
                          ? "bg-slate-50"
                          : "bg-white shadow-sm border border-slate-100"
                      }
                    `}
                  >
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold truncate ${
                        isActive
                          ? "text-lg text-slate-800"
                          : "text-sm text-slate-700"
                      }`}
                    >
                      {doc.title}
                    </h3>
                    {isActive ? (
                      <p className="text-xs text-indigo-500 font-medium mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Analysis Ready
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-medium">
                        {doc.type}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDocId(null);
                        if (onClose) onClose();
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                <div
                  className={`
                    px-6 py-4 transition-all duration-500
                    ${
                      isActive
                        ? "opacity-100 delay-200"
                        : "opacity-0 h-0 hidden"
                    }
                  `}
                >
                  <div className="mb-5 text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {doc.summary}
                  </div>
                  {doc.content}

                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                      Open Source <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-lg transition-all shadow-sm">
                      Share Context
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
