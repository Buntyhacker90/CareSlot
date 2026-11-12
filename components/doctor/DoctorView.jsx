"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Stethoscope,
  User,
  Users,
  CheckCircle2,
  Hourglass,
  Phone,
  AlertTriangle,
  Play,
  Volume2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  MapPin,
  FileText,
} from "lucide-react";

export default function DoctorView() {
  const {
    doctors,
    activeDoctorId,
    setActiveDoctorId,
    updateDoctorStatus,
    appointments,
    updateAppointmentStatus,
    callNextPatient,
    setActiveDigitalToken,
  } = useApp();

  const [queueTab, setQueueTab] = useState("waiting"); // "waiting" | "all" | "completed"

  const doctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  // Appointments for this doctor
  const doctorAppointments = appointments.filter((a) => a.doctorId === doctor.id);
  const currentlyServing = doctorAppointments.find((a) => a.status === "in-consultation");
  const waitingPatients = doctorAppointments.filter((a) => a.status === "waiting");
  const completedPatients = doctorAppointments.filter((a) => a.status === "completed");

  const filteredQueue =
    queueTab === "waiting"
      ? waitingPatients
      : queueTab === "completed"
      ? completedPatients
      : doctorAppointments;

  return (
    <div className="space-y-6">
      
      {/* Doctor Header & Profile Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{doctor.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {doctor.opdRoom}
              </span>
            </div>
            <p className="text-xs text-slate-600">{doctor.qualification}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Rating: {doctor.rating} ⭐ ({doctor.reviewsCount} reviews) • {doctor.experienceYears} yrs experience
            </p>
          </div>
        </div>

        {/* Doctor Switcher & Status Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Switch Doctor */}
          <div className="relative">
            <select
              value={activeDoctorId}
              onChange={(e) => setActiveDoctorId(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Switch to: {d.name} ({d.opdRoom.split(" ")[0]})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {["Available", "In Consultation", "On Break", "Offline"].map((status) => {
              const isCurrent = doctor.status === status;
              return (
                <button
                  key={status}
                  onClick={() => updateDoctorStatus(doctor.id, status)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isCurrent
                      ? status === "Available"
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : status === "In Consultation"
                        ? "bg-blue-600 text-white shadow-xs font-bold"
                        : status === "On Break"
                        ? "bg-amber-600 text-white shadow-xs font-bold"
                        : "bg-slate-700 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Active Consultation (Left) vs Queue List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Patient In OPD & Calling Controls */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Currently In Room */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-teal-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-teal-300 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                Currently In Consultation Room
              </span>
              <span className="text-xs font-mono bg-teal-800/80 px-2 py-0.5 rounded text-teal-100">
                {doctor.opdRoom.split(" ")[0]}
              </span>
            </div>

            {currentlyServing ? (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-teal-200 font-semibold uppercase">Token Number</span>
                    {currentlyServing.isPriority && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                        Priority Patient
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-3xl font-black tracking-wider text-white my-1">
                    {currentlyServing.tokenNumber}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{currentlyServing.patientName}</h3>
                  <p className="text-xs text-slate-300">
                    {currentlyServing.patientAge} Years • {currentlyServing.patientGender} • Slot: {currentlyServing.timeSlot}
                  </p>
                  <p className="text-xs text-teal-100 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-teal-300" />
                    {currentlyServing.patientPhone}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-3 border border-white/10 text-xs">
                  <span className="font-semibold text-teal-200 block mb-0.5">Reported Symptoms:</span>
                  <p className="text-slate-300 italic">{currentlyServing.reason || "General review"}</p>
                </div>

                {/* Consultation Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => updateAppointmentStatus(currentlyServing.id, "completed")}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateAppointmentStatus(currentlyServing.id, "no-show")}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-medium text-xs transition-colors"
                    >
                      Mark No-Show
                    </button>
                    <button
                      onClick={() => setActiveDigitalToken(currentlyServing)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 font-medium text-xs transition-colors"
                    >
                      View Token Pass
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <Users className="w-12 h-12 text-teal-400/50 mx-auto" />
                <h4 className="font-bold text-white text-base">OPD Room is Free</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  There is currently no patient inside the consultation chamber. Call the next token from the queue below.
                </p>
              </div>
            )}

            {/* Quick Next Patient Call Button */}
            <div className="mt-5 pt-4 border-t border-white/15">
              <button
                onClick={() => callNextPatient(doctor.id)}
                disabled={waitingPatients.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                  waitingPatients.length > 0
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 shadow-amber-500/20 active:scale-[0.98]"
                    : "bg-white/10 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Volume2 className="w-5 h-5 animate-bounce" />
                <span>Call Next Patient to Room ({waitingPatients.length} Waiting)</span>
              </button>
            </div>
          </div>

          {/* Quick Schedule Overview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Today's Slot Utilization
              </h3>
              <span className="text-xs text-teal-700 font-bold">
                {doctor.slots.filter((s) => s.isBooked).length}/{doctor.slots.length} Booked
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {doctor.slots.map((s) => (
                <div
                  key={s.time}
                  className={`p-2 rounded-xl text-center text-xs border ${
                    s.isBooked
                      ? "bg-teal-50 border-teal-200 text-teal-800 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <p className="font-mono text-[11px]">{s.time}</p>
                  <p className="text-[10px] opacity-75">{s.isBooked ? "Reserved" : "Open"}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: OPD Live Queue List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Queue Tab Header */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Outpatient Patient Queue</h3>
              <p className="text-xs text-slate-500">Live order of consultation queue for today</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
              <button
                onClick={() => setQueueTab("waiting")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  queueTab === "waiting"
                    ? "bg-white text-teal-700 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Waiting ({waitingPatients.length})
              </button>
              <button
                onClick={() => setQueueTab("completed")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  queueTab === "completed"
                    ? "bg-white text-teal-700 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed ({completedPatients.length})
              </button>
              <button
                onClick={() => setQueueTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  queueTab === "all"
                    ? "bg-white text-teal-700 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({doctorAppointments.length})
              </button>
            </div>
          </div>

          {/* Queue Items */}
          {filteredQueue.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <Hourglass className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No patients in this view</h4>
              <p className="text-xs text-slate-400">
                {queueTab === "waiting"
                  ? "All waiting patients have been attended to!"
                  : "No appointments recorded in this category yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map((appt, idx) => {
                const isWaiting = appt.status === "waiting";
                const isInConsultation = appt.status === "in-consultation";

                return (
                  <div
                    key={appt.id}
                    className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isInConsultation
                        ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md bg-teal-50/20"
                        : "border-slate-200 hover:border-teal-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Token</span>
                        <span className="font-mono text-sm font-black text-slate-900">
                          {appt.tokenNumber.split("-")[2] || appt.tokenNumber}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{appt.patientName}</h4>
                          <span className="text-xs text-slate-400">({appt.patientAge}y, {appt.patientGender})</span>
                          {appt.isPriority && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Priority
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              appt.status === "in-consultation"
                                ? "bg-emerald-100 text-emerald-800 animate-pulse"
                                : appt.status === "waiting"
                                ? "bg-amber-100 text-amber-800"
                                : appt.status === "completed"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-teal-700">
                            <Clock className="w-3 h-3" />
                            {appt.timeSlot}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{appt.reason || "General visit"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isWaiting && (
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, "in-consultation")}
                          className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Call In</span>
                        </button>
                      )}

                      {isInConsultation && (
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, "completed")}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finish</span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveDigitalToken(appt)}
                        className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
