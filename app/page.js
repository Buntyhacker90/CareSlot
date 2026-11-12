"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import PatientView from "@/components/patient/PatientView";
import DoctorView from "@/components/doctor/DoctorView";
import AdminView from "@/components/admin/AdminView";
import BookingModal from "@/components/BookingModal";
import DigitalTokenModal from "@/components/DigitalTokenModal";
import Toast from "@/components/Toast";
import { Activity, ShieldCheck, Heart, Globe } from "lucide-react";

function MainContent() {
  const { role } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === "patient" && <PatientView />}
        {role === "doctor" && <DoctorView />}
        {role === "admin" && <AdminView />}
      </main>

      <BookingModal />
      <DigitalTokenModal />
      <Toast />

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">
              Care<span className="text-teal-600">Slot</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Real-Time OPD Queue & Slot Booking Management</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Conflict-Safe Token Generation
            </span>
            <a
              href="https://github.com/Buntyhacker90/CareSlot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700 font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Buntyhacker90/CareSlot</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
