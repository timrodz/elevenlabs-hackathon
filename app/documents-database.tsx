import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";

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

export const DOCUMENTS = [
  {
    id: 1,
    title: "Q3 Financial Overview",
    type: "spreadsheet",
    icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    summary: "Revenue up 12% YoY. EBITDA margins stabilizing at 24%.",
    content: (
      <div className="space-y-4">
        <div className="flex justify-between items-end h-32 gap-2 px-4 pb-2 border-b border-slate-200">
          {[40, 65, 45, 80, 55, 90].map((h, i) => (
            <div
              key={i}
              className="w-full bg-emerald-100 hover:bg-emerald-200 transition-colors rounded-t-sm relative group"
            >
              <div
                style={{ height: `${h}%` }}
                className="absolute bottom-0 w-full bg-emerald-500 rounded-t-sm shadow-sm"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="bg-slate-100 p-3 rounded border border-slate-200">
            <span className="block text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Gross Revenue
            </span>
            <span className="text-xl font-bold text-slate-800">$4.2M</span>
          </div>
          <div className="bg-slate-100 p-3 rounded border border-slate-200">
            <span className="block text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Net Profit
            </span>
            <span className="text-xl font-bold text-emerald-600">+18%</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Project Titan Roadmap",
    type: "presentation",
    icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
    summary: "Phase 2 delayed by 2 weeks due to API integration issues.",
    content: (
      <div className="space-y-3">
        {[
          { step: "Design Phase", status: "complete", color: "bg-indigo-600" },
          { step: "API Integration", status: "blocked", color: "bg-rose-500" },
          { step: "UAT Testing", status: "pending", color: "bg-slate-300" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${item.color} ring-2 ring-offset-2 ring-${item.color}/20`}
            />
            <div className="flex-1 bg-slate-50 h-8 rounded border border-slate-200 flex items-center px-3 text-xs text-slate-600 font-medium">
              {item.step}
            </div>
          </div>
        ))}
        <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2 rounded border border-rose-100 font-medium">
          Critical Path: Backend team requires additional resources.
        </p>
      </div>
    ),
  },
  {
    id: 3,
    title: "Email: Client Feedback",
    type: "email",
    icon: <Mail className="w-5 h-5 text-blue-600" />,
    summary: "Client requesting changes to the dashboard layout before launch.",
    content: (
      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
            JD
          </div>
          <div>
            <div className="text-slate-800 font-bold">John Doe</div>
            <div className="text-slate-400 text-[10px]">Re: Dashboard V2</div>
          </div>
        </div>
        <p className="text-slate-600 leading-relaxed italic">
          "The new light mode looks clean, but the team feels the navigation is
          a bit hidden. Can we pull up the mocks?"
        </p>
      </div>
    ),
  },
  {
    id: 4,
    title: "Competitor Analysis",
    type: "pdf",
    icon: <FileText className="w-5 h-5 text-orange-500" />,
    summary: "Market shift towards AI-driven analytics tools observed.",
    content: (
      <div className="space-y-2">
        <div className="h-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100 flex items-center justify-center">
          <ImageIcon className="text-orange-300 w-8 h-8" />
        </div>
        <p className="text-xs text-slate-500">
          Key takeaway: Velocity is key. Competitors are shipping weekly
          updates.
        </p>
      </div>
    ),
  },
];
