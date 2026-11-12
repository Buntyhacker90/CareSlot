"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case "error":
        return {
          bg: "bg-rose-900/90 text-white border-rose-700",
          icon: <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />,
        };
      case "info":
        return {
          bg: "bg-slate-900/90 text-white border-slate-700",
          icon: <Info className="w-4 h-4 text-teal-300 shrink-0" />,
        };
      case "success":
      default:
        return {
          bg: "bg-teal-900/90 text-white border-teal-700",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${style.bg} text-xs font-medium`}
      >
        {style.icon}
        <span className="flex-1 leading-relaxed">{toast.message}</span>
      </div>
    </div>
  );
}
