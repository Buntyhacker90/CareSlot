"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Activity,
  User,
  Stethoscope,
  ShieldAlert,
  Ticket,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const {
    role,
    switchRole,
    appointments,
    setActiveDigitalToken,
    resetAllData,
    advanceSimulation,
  } = useApp();

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const waitingCount = appointments.filter((a) => a.status === "waiting").length;
  const inConsultationCount = appointments.filter((a) => a.status === "in-consultation").length;
  const myActiveAppt = appointments.find(
    (a) => a.status === "waiting" || a.status === "in-consultation"
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Live Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Care<span className="text-teal-600">Slot</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
                  OPD Live
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500">
                Real-Time Outpatient Availability & Queue Manager
              </p>
            </div>
          </div>

          {/* Clock & Queue Status Pill */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono text-slate-800">{currentTime || "09:00:00 AM"}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span><strong>{waitingCount}</strong> Waiting</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>{inConsultationCount}</strong> In Consultation</span>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => switchRole("patient")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                role === "patient"
                  ? "bg-white text-teal-700 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => switchRole("doctor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                role === "doctor"
                  ? "bg-white text-teal-700 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor OPD</span>
            </button>

            <button
              onClick={() => switchRole("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                role === "admin"
                  ? "bg-white text-teal-700 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clinic </span>Admin
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {myActiveAppt && (
              <button
                onClick={() => setActiveDigitalToken(myActiveAppt)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                title="View your active digital token pass"
              >
                <Ticket className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">Active Pass:</span>
                <span className="font-mono font-bold">{myActiveAppt.tokenNumber}</span>
              </button>
            )}

            {/* Quick Demo Simulator */}
            <button
              onClick={advanceSimulation}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              title="Simulate calling the next patient in queue"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Next Turn</span>
            </button>

            <button
              onClick={resetAllData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset Clinic Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
