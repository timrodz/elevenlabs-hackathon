import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  FileText,
  BarChart3,
  Mail,
  Image as ImageIcon,
  X,
  Sparkles,
  Cpu,
  ArrowUpRight,
} from "lucide-react";

// --- Mock Data (Updated for Light Theme visibility) ---

export default function MeetingAssistant(DOCUMENTS) {
  const [activeDocId, setActiveDocId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [rotation, setRotation] = useState(0);

  const animationRef = useRef();

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => (prev + 0.15) % 360); // Slightly faster rotation for startup energy
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleTrigger = () => {
    if (activeDocId) {
      setActiveDocId(null);
      setTranscript("");
      return;
    }

    setIsListening(true);
    setTranscript("Listening...");

    setTimeout(() => {
      setTranscript("Agent, pull that up.");
      setTimeout(() => {
        setIsListening(false);
        setActiveDocId(2);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="relative w-full h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-indigo-100">
      {/* Backgrounds */}
      {/* <ParticleField /> */}

      {/* Light Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center perspective-container">
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
          {DOCUMENTS.map((doc, index) => {
            const isActive = activeDocId === doc.id;
            const isOtherActive = activeDocId && !isActive;

            // --- 3D Orbit Logic ---
            // To simulate a tilted galaxy (45deg), we squash the Y axis of the orbit.
            // But we keep the cards upright (billboarding).

            const angleDeg = rotation + index * (360 / DOCUMENTS.length);
            const angleRad = (angleDeg * Math.PI) / 180;

            // Orbit Dimensions (Elliptical to simulate tilt)
            const radiusX = 260;
            const radiusY = 80; // Squashed Y simulates tilt

            // Calculate Position
            const rawX = Math.cos(angleRad) * radiusX;
            const rawY = Math.sin(angleRad) * radiusY;

            // Determine Scale and Z-Index based on Y position (depth simulation)
            // In a tilted disk, items at the 'bottom' (positive Y) are closer to user
            const depthFactor = (rawY + radiusY) / (radiusY * 2); // 0 (far) to 1 (near)
            const scale = 0.75 + depthFactor * 0.25; // Scale from 0.75 to 1.0
            const zIndex = Math.round(depthFactor * 100);
            const blur = (1 - depthFactor) * 2; // Slight blur for items in back

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

      {/* Interaction Layer (Bottom) */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center justify-end z-50 pointer-events-none">
        {/* Transcript Bubble */}
        <div
          className={`
          mb-6 px-6 py-3 rounded-2xl backdrop-blur-md border 
          transition-all duration-300 transform shadow-xl
          ${
            transcript ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }
          ${
            isListening
              ? "bg-rose-50 border-rose-100 text-rose-600 shadow-rose-100/50"
              : "bg-white/90 border-indigo-100 text-indigo-600 shadow-indigo-100/50"
          }
        `}
        >
          <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
            {transcript}
          </span>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTrigger}
          disabled={isListening}
          className={`
            pointer-events-auto group relative flex items-center justify-center w-16 h-16 rounded-full 
            transition-all duration-300
            ${
              isListening
                ? "bg-rose-50 scale-110 border-rose-200"
                : activeDocId
                ? "bg-slate-800 hover:bg-slate-700 border-slate-800"
                : "bg-white hover:bg-indigo-50 border-indigo-100 hover:border-indigo-200"
            }
            border-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]
          `}
        >
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border border-rose-400/30 animate-[ping_1.5s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full border border-rose-400/20 animate-[ping_1.5s_linear_infinite_0.5s]" />
            </>
          )}

          {activeDocId ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Mic
              className={`w-6 h-6 transition-colors ${
                isListening
                  ? "text-rose-500"
                  : "text-indigo-600 group-hover:scale-110"
              }`}
            />
          )}
        </button>

        <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
          {activeDocId
            ? "Context Active"
            : 'Tap to simulate "Agent, pull that up"'}
        </p>
      </div>

      {/* Top Bar / Branding */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-wide">
              AETHER
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Contextual Meeting Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-bold tracking-wider">
            LIVE LISTENING
          </span>
        </div>
      </div>
    </div>
  );
}
