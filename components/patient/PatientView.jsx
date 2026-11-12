"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEPARTMENTS } from "@/lib/data";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Shield,
  Activity,
  UserCheck,
} from "lucide-react";

export default function PatientView() {
  const {
    doctors,
    appointments,
    setSelectedDoctorForBooking,
    setActiveDigitalToken,
    cancelAppointment,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filter appointments for the patient (waiting and in-consultation)
  const activeTokens = appointments.filter(
    (a) => a.status === "waiting" || a.status === "in-consultation"
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = selectedDept === "all" || doc.departmentId === selectedDept;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.opdRoom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = !onlyAvailable || doc.status === "Available";
    return matchesDept && matchesSearch && matchesAvailability;
  });

  const getStatusBadge = (status, currentServingToken) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Available Now
          </span>
        );
      case "In Consultation":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            In OPD {currentServingToken ? `(${currentServingToken})` : ""}
          </span>
        );
      case "On Break":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            On Break
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-teal-900/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Smart Real-Time OPD Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Book Doctor Consultation & Track Your Live Queue Token
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate hospital waiting room overcrowding. Check real-time doctor availability, lock conflict-free slots, and follow your live queue progress directly on your phone.
          </p>

          {/* Quick Search */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctors, symptoms, departments (e.g. Heart, Ortho, Dr. Mehta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              />
            </div>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                onlyAvailable
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30"
                  : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/15"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Available Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Passes / Tokens Section (If any) */}
      {activeTokens.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-teal-600" />
              Your Active OPD Tokens ({activeTokens.length})
            </h2>
            <span className="text-xs text-slate-500">Live queue synchronization active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTokens.map((appt) => {
              const waitingAhead = appointments.filter(
                (a) =>
                  a.doctorId === appt.doctorId &&
                  a.status === "waiting" &&
                  new Date(a.bookedAt) < new Date(appt.bookedAt)
              ).length;

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl p-5 border border-teal-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-black text-lg px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                        {appt.tokenNumber}
                      </span>
                      {appt.status === "in-consultation" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white animate-pulse">
                          Now Calling to OPD
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-amber-600" />
                          {waitingAhead === 0 ? "You're Next!" : `${waitingAhead} ahead of you`}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{appt.doctorName}</h3>
                    <p className="text-xs text-slate-600">
                      {appt.departmentName} • {appt.opdRoom}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Patient: <strong>{appt.patientName}</strong></span>
                      <span>Slot: <strong>{appt.timeSlot}</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setActiveDigitalToken(appt)}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Digital Pass</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Cancel token ${appt.tokenNumber}?`)) {
                          cancelAppointment(appt.id);
                        }
                      }}
                      className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Department Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Explore Medical Specialties</h2>
          <span className="text-xs text-slate-500">8 Departments Online</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedDept("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedDept === "all"
                ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
            }`}
          >
            All Specialties ({doctors.length})
          </button>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept.id;
            const count = doctors.filter((d) => d.departmentId === dept.id).length;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
                }`}
              >
                <span>{dept.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Available Specialists ({filteredDoctors.length})
          </h2>
          <span className="text-xs text-slate-500">
            Showing verified clinical consultants
          </span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No doctors match your filters</h3>
            <p className="text-xs text-slate-500">
              Try clearing the search query or selecting a different department.
            </p>
            <button
              onClick={() => {
                setSelectedDept("all");
                setSearchQuery("");
                setOnlyAvailable(false);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => {
              const dept = DEPARTMENTS.find((d) => d.id === doc.departmentId);
              const availableSlotsCount = doc.slots.filter((s) => !s.isBooked).length;
              const nextSlot = doc.slots.find((s) => !s.isBooked)?.time || "No slots today";

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              dept?.badgeClass || "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {dept?.name || "Specialist"}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{doc.rating}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{doc.qualification}</p>
                        <p className="text-[11px] text-slate-400">{doc.experienceYears} Years Clinical Exp.</p>
                      </div>
                    </div>

                    {/* Status & Room */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {getStatusBadge(doc.status, doc.currentServingToken)}
                      <span className="font-bold text-slate-900">₹{doc.consultationFee} <span className="font-normal text-[10px] text-slate-400">OPD</span></span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                      <p className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{doc.opdRoom}</span>
                      </p>
                      <p className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Next Slot: <strong>{nextSlot}</strong></span>
                        <span className="text-[10px] text-slate-400">({availableSlotsCount} open)</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>
                  </div>

                  {/* Booking CTA */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedDoctorForBooking(doc)}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs group-hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Book Consultation Slot</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments History Drawer/List */}
      {pastAppointments.length > 0 && (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">
            Past Consultation History ({pastAppointments.length})
          </h3>
          <div className="space-y-2">
            {pastAppointments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-700 mr-2">{a.tokenNumber}</span>
                  <span className="font-semibold text-slate-900">{a.doctorName}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-500">{a.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.status === "completed"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {a.status}
                  </span>
                  <button
                    onClick={() => setActiveDigitalToken(a)}
                    className="text-teal-600 hover:underline font-semibold"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
