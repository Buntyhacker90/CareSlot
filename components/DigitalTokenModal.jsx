"use client";

import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  QrCode,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Hourglass,
} from "lucide-react";

export default function DigitalTokenModal() {
  const { activeDigitalToken, setActiveDigitalToken, cancelAppointment, appointments } = useApp();
  const printRef = useRef(null);

  if (!activeDigitalToken) return null;

  // Find updated appointment data in context
  const currentAppt = appointments.find((a) => a.id === activeDigitalToken.id) || activeDigitalToken;

  // Calculate live queue position if waiting
  const waitingAhead = appointments.filter(
    (a) =>
      a.doctorId === currentAppt.doctorId &&
      a.status === "waiting" &&
      new Date(a.bookedAt) < new Date(currentAppt.bookedAt)
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (currentAppt.status) {
      case "in-consultation":
        return {
          bg: "bg-emerald-500 text-white animate-pulse",
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "NOW SERVING - PLEASE ENTER OPD ROOM",
          desc: `Dr. ${currentAppt.doctorName} is waiting for you in ${currentAppt.opdRoom}.`,
        };
      case "waiting":
        return {
          bg: "bg-amber-500 text-white",
          icon: <Hourglass className="w-4 h-4" />,
          label: `WAITING IN QUEUE (${waitingAhead} Patient${waitingAhead === 1 ? "" : "s"} Ahead)`,
          desc: `Estimated wait time: ~${(waitingAhead + 1) * 12} minutes. Please remain near the OPD lounge.`,
        };
      case "completed":
        return {
          bg: "bg-slate-700 text-white",
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "CONSULTATION COMPLETED",
          desc: "Consultation finished. Pharmacy & billing tokens sent to your registered phone.",
        };
      case "cancelled":
        return {
          bg: "bg-rose-500 text-white",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "APPOINTMENT CANCELLED",
          desc: "This token is no longer active in the OPD queue.",
        };
      default:
        return {
          bg: "bg-slate-500 text-white",
          icon: <Hourglass className="w-4 h-4" />,
          label: currentAppt.status?.toUpperCase() || "PENDING",
          desc: "Queue verification in progress.",
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Digital OPD Queue Token</h3>
              <p className="text-xs text-teal-200">CareSlot Verified Consultation Pass</p>
            </div>
          </div>
          <button
            onClick={() => setActiveDigitalToken(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div ref={printRef} className="p-6 space-y-5">
          
          {/* Status Bar */}
          <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 ${statusInfo.bg}`}>
            <span className="shrink-0">{statusInfo.icon}</span>
            <div className="text-xs">
              <p className="font-bold tracking-wide uppercase">{statusInfo.label}</p>
              <p className="opacity-90">{statusInfo.desc}</p>
            </div>
          </div>

          {/* Token Card */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden shadow-inner">
            <div className="absolute top-2 right-3 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Live Token ID
            </div>
            
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Token Number
            </p>
            <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tracking-wider my-2 text-teal-800">
              {currentAppt.tokenNumber}
            </div>

            {currentAppt.isPriority && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Priority Patient
              </span>
            )}

            {/* Simulated barcode */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col items-center">
              <div className="h-9 w-48 bg-[repeating-linear-gradient(90deg,#1e293b,#1e293b_2px,transparent_2px,transparent_5px,#1e293b_5px,#1e293b_8px,transparent_8px,transparent_11px)] opacity-70"></div>
              <p className="font-mono text-[10px] text-slate-500 mt-1">
                AUTH-{currentAppt.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Doctor & Location Info */}
          <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-100/80 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-medium">Consulting Doctor:</span>
              <span className="font-bold text-slate-900">{currentAppt.doctorName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-medium">Department:</span>
              <span className="font-semibold text-teal-800">{currentAppt.departmentName}</span>
            </div>
            <div className="flex items-start justify-between gap-2 pt-1 border-t border-teal-100">
              <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                OPD Room:
              </span>
              <span className="font-semibold text-slate-800 text-right text-xs">
                {currentAppt.opdRoom}
              </span>
            </div>
          </div>

          {/* Appointment Timing & Patient Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Date & Time
              </p>
              <p className="font-bold text-slate-800">{currentAppt.date}</p>
              <p className="font-medium text-teal-700">{currentAppt.timeSlot}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Patient Details
              </p>
              <p className="font-bold text-slate-800 truncate">{currentAppt.patientName}</p>
              <p className="text-slate-600">
                {currentAppt.patientAge}y • {currentAppt.patientGender}
              </p>
            </div>
          </div>

          {currentAppt.reason && (
            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">Reason for visit: </span>
              {currentAppt.reason}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download</span>
            </button>

            {currentAppt.status === "waiting" && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this appointment and release your queue token?")) {
                    cancelAppointment(currentAppt.id);
                  }
                }}
                className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                Cancel Token
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
