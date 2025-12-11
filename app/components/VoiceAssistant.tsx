/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useConversation, useScribe } from "@elevenlabs/react";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Cpu } from "lucide-react";

import { DOCUMENTS } from "../documents-database";
import { FloatingDocuments } from "./FloatingDocuments";

const AGENT_ID = "agent_3301kc61k8jbe8tr7swp6tc5a4r0";

export function VoiceAssistant() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");
  const [agentStatus, setAgentStatus] = useState<
    "listening" | "speaking" | "idle"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // New state for Documents Galaxy
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [visibleDocuments, setVisibleDocuments] = useState<any[]>([]);
  const [galaxyActiveDocId, setGalaxyActiveDocId] = useState<number | null>(
    null
  );

  // State for speech-to-text transcription
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [currentPartialTranscript, setCurrentPartialTranscript] = useState<
    string | null
  >(null);
  const [scribeToken, setScribeToken] = useState<string | null>(null);

  // Fetch scribe token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/speech-to-text", {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          setScribeToken(data.token);
        } else {
          console.error("Failed to fetch scribe token");
        }
      } catch (err) {
        console.error("Error fetching scribe token:", err);
      }
    };
    fetchToken();
  }, []);

  // Initialize useScribe hook
  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    token: scribeToken || undefined,
    onPartialTranscript: (data) => {
      setCurrentPartialTranscript(data.text);
    },
    onCommittedTranscript: (data) => {
      setCurrentPartialTranscript(null);
      setTranscripts((prev) => [...prev, data.text]);
    },
  });

  const conversation = useConversation({
    agentId: AGENT_ID,
    onConnect: () => {
      setConnectionStatus("connected");
      setAgentStatus("listening");
      setError(null);
      // Connect scribe when conversation connects
      if (scribeToken) {
        scribe.connect({
          token: scribeToken,
          microphone: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      }
    },
    onDisconnect: () => {
      setConnectionStatus("disconnected");
      setAgentStatus("idle");
      setShowGalaxy(false);
      setVisibleDocuments([]);
      // Disconnect scribe and clear transcripts
      scribe.disconnect();
      setTranscripts([]);
      setCurrentPartialTranscript(null);
    },
    onError: (err) => {
      console.error(err);
      setError(typeof err === "string" ? err : "An error occurred");
      setConnectionStatus("disconnected");
      setAgentStatus("idle");
    },
    onMessage: (message) => {
      console.log("Agent Message:", message);
    },
    onDebug: (data) => {
      console.log("Agent Debug:", data);
    },
    onStatusChange: (status) => {
      console.log("Connection Status Change:", status);
      if (status.status === "connecting") {
        setConnectionStatus("connecting");
      }
    },
    onModeChange: (mode) => {
      console.log("Mode Change:", mode);
      setAgentStatus(mode.mode === "speaking" ? "speaking" : "listening");
    },
    clientTools: {
      showAllDocuments: async () => {
        setVisibleDocuments(DOCUMENTS);
        setShowGalaxy(true);
        setGalaxyActiveDocId(null);
      },
      fetchDocuments: async (
        parameters: { name: string } | string
      ): Promise<string> => {
        try {
          const query =
            typeof parameters === "string" ? parameters : parameters.name;
          console.log("Searching for document:", query);

          // Basic fuzzy search
          const lowercaseQuery = query.toLowerCase();

          // Filter documents based on query
          // If query is broad like "all" or empty, show all.
          // Otherwise filter by title or summary.
          const matches = DOCUMENTS.filter(
            (doc) =>
              doc.title.toLowerCase().includes(lowercaseQuery) ||
              doc.type.toLowerCase().includes(lowercaseQuery) ||
              doc.summary.toLowerCase().includes(lowercaseQuery)
          );

          console.log("matches", matches);

          // If no matches found, fallback to showing all documents but indicate none matched perfectly?
          // Or just show nothing? The user said "show based on query results".
          // Let's stick to: if matches, show matches. If no matches, maybe show all (fallback) or say not found.

          let responseMessage = "";

          if (matches.length > 0) {
            setVisibleDocuments(matches);
            setShowGalaxy(true);

            // Activate the first/best match
            setGalaxyActiveDocId(matches[0].id);

            responseMessage = `I found ${matches.length} document${
              matches.length > 1 ? "s" : ""
            }. Opening ${matches[0].title}.`;
          } else {
            // Fallback: If "Show me everything" is asked, maybe they used a keyword that didn't match.
            // If really nothing matches, we can clear the view or keep the previous view.
            console.log("No exact matches found.");
            // Optional: Show all if query implies "all"
            if (
              lowercaseQuery.includes("all") ||
              lowercaseQuery.includes("documents")
            ) {
              setVisibleDocuments(DOCUMENTS);
              setShowGalaxy(true);
              setGalaxyActiveDocId(null);
              responseMessage = "Here are all your documents.";
            } else {
              responseMessage = `I couldn't find a document matching "${query}".`;
              // Keep state as is, or clear it?
              // Let's clear it to be responsive to "based on query results"
              // setVisibleDocuments([]);
              // setShowGalaxy(false); // Maybe don't hide if we want to keep context
            }
          }

          return responseMessage;
        } catch (err) {
          console.error("Document search failed", err);
          return "I encountered an error while searching for documents.";
        }
      },
    },
  });

  const toggleConnection = useCallback(async () => {
    if (connectionStatus === "connected") {
      await conversation.endSession();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: "webrtc",
        });
      } catch (err) {
        console.error("Failed to start session:", err);
        setError("Failed to access microphone or connect.");
      }
    }
  }, [connectionStatus, conversation]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 flex flex-col items-center relative overflow-hidden">
      {/* Background Ambience (Light Mode) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-wide">
              JAMIE
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              Your Meeting Assistant
            </p>
          </div>
        </div>
        {connectionStatus === "connected" && (
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-bold tracking-wider">
              LIVE LISTENING
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="z-10 flex-1 w-full max-w-6xl flex flex-col items-center justify-center min-h-0 relative">
        {/* Dynamic Display Area / Galaxy */}
        <AnimatePresence mode="wait">
          {showGalaxy && visibleDocuments.length > 0 ? (
            <motion.div
              key="galaxy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-[600px] absolute inset-0 flex items-center justify-center"
            >
              <FloatingDocuments
                documents={visibleDocuments}
                initialActiveId={galaxyActiveDocId}
                onClose={() => setGalaxyActiveDocId(null)}
              />
            </motion.div>
          ) : (
            /* Fallback / Initial State UI */
            !showGalaxy &&
            connectionStatus === "connected" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                  Waiting for context...
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Voice Control (Bottom) */}
        <div className="absolute bottom-12 flex flex-col items-center gap-6 z-50">
          <button
            onClick={toggleConnection}
            disabled={connectionStatus === "connecting"}
            className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]
                    ${
                      connectionStatus === "connected"
                        ? "bg-rose-50 border-2 border-rose-200 text-rose-500 animate-pulse hover:bg-rose-100"
                        : connectionStatus === "connecting"
                        ? "bg-slate-100 text-slate-400"
                        : "bg-white border-2 border-indigo-100 text-indigo-600 hover:scale-110 hover:border-indigo-200"
                    }
                `}
          >
            {connectionStatus === "connected" ? (
              <motion.div
                animate={{
                  scale: agentStatus === "speaking" ? [1, 1.2, 1] : 1,
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Mic className="w-6 h-6" />
              </motion.div>
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            {connectionStatus === "connected"
              ? agentStatus === "speaking"
                ? "Speaking..."
                : "Listening..."
              : "Tap to Speak"}
          </p>

          {error && (
            <div className="absolute -bottom-16 px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs whitespace-nowrap">
              {error}
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {connectionStatus === "connected" &&
          (transcripts.length > 0 || currentPartialTranscript) && (
            <div className="absolute bottom-32 left-0 right-0 max-w-4xl mx-auto px-4 z-40">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {transcripts.map((transcript, index) => (
                    <p
                      key={index}
                      className="text-sm text-slate-700 leading-relaxed"
                    >
                      {transcript}
                    </p>
                  ))}
                  {currentPartialTranscript && (
                    <p className="text-sm text-slate-500 italic leading-relaxed">
                      {currentPartialTranscript}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
