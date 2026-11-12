"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEPARTMENTS } from "@/lib/data";
import {
  ShieldAlert,
  Users,
  Activity,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Trash2,
  Sparkles,
  BarChart3,
  MapPin,
  RefreshCw,
} from "lucide-react";

export default function AdminView() {
  const {
    doctors,
    appointments,
    updateDoctorStatus,
    updateAppointmentStatus,
    cancelAppointment,
    setActiveDigitalToken,
    advanceSimulation,
    resetAllData,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Metrics
  const totalAppointments = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "waiting").length;
  const inConsultationCount = appointments.filter((a) => a.status === "in-consultation").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const activeRoomsCount = doctors.filter((d) => d.status === "In Consultation").length;
  const avgWaitMins = waitingCount > 0 ? (waitingCount * 11) : 5;

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesDept = selectedDept === "all" || a.departmentId === selectedDept;
    const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientPhone.includes(searchTerm);
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Hospital Operations Control
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Clinic Administrator Console</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time outpatient monitoring, OPD chamber occupancy, and queue orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={advanceSimulation}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-400/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Queue Step</span>
          </button>
          <button
            onClick={resetAllData}
            className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Today's Total</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalAppointments}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered appointments</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Active in Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{waitingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Patients waiting in lounge</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>In Consultation</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600">{inConsultationCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active inside chambers</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Avg Wait Time</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">~{avgWaitMins}m</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Current clinic throughput</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Chambers Active</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">
            {activeRoomsCount}/{doctors.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">OPD rooms operational</p>
        </div>
      </div>

      {/* OPD Rooms Monitoring Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Live OPD Counter & Chamber Status ({doctors.length} Chambers)
          </h3>
          <span className="text-xs text-slate-500">Auto-refreshing real-time state</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.map((doc) => {
            const isConsulting = doc.status === "In Consultation";
            const isBreak = doc.status === "On Break";
            const isOffline = doc.status === "Offline";
            const currentServingAppt = appointments.find(
              (a) => a.doctorId === doc.id && a.status === "in-consultation"
            );
            const docWaitingCount = appointments.filter(
              (a) => a.doctorId === doc.id && a.status === "waiting"
            ).length;

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isConsulting
                    ? "border-blue-400 ring-1 ring-blue-400/30 shadow-sm"
                    : isBreak
                    ? "border-amber-300"
                    : isOffline
                    ? "border-slate-200 opacity-70"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {doc.opdRoom.split(" ")[0]}
                  </span>
                  <select
                    value={doc.status}
                    onChange={(e) => updateDoctorStatus(doc.id, e.target.value)}
                    className="text-[11px] font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Available">Available</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="On Break">On Break</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[10px] text-teal-700 font-medium truncate">
                      {DEPARTMENTS.find((d) => d.id === doc.departmentId)?.name}
                    </p>
                  </div>
                </div>

                {/* Serving Token Banner */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Serving Token:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {currentServingAppt ? currentServingAppt.tokenNumber : "None"}
                    </span>
                  </div>
                  {currentServingAppt && (
                    <p className="text-[10px] text-slate-600 truncate mt-1">
                      Patient: {currentServingAppt.patientName}
                    </p>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Waiting Queue:</span>
                    <span className="font-bold text-teal-700">{docWaitingCount} Patients</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Appointment Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Outpatient Appointments Master Log</h3>
            <p className="text-xs text-slate-500">
              Audit and manage all consultations, tokens, and patient statuses
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search token, patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Specialties</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in-consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Token & Patient</th>
                <th className="py-3 px-4">Doctor & Room</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No appointments match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {appt.tokenNumber}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{appt.patientName}</p>
                          <p className="text-[11px] text-slate-500">
                            {appt.patientAge}y • {appt.patientGender} • {appt.patientPhone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{appt.doctorName}</p>
                      <p className="text-[11px] text-slate-500">{appt.opdRoom.split(" ")[0]}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{appt.date}</p>
                      <p className="text-teal-700 font-medium">{appt.timeSlot}</p>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={appt.status}
                        onChange={(e) => updateAppointmentStatus(appt.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border focus:outline-none ${
                          appt.status === "in-consultation"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : appt.status === "waiting"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : appt.status === "completed"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-rose-50 text-rose-700 border-rose-300"
                        }`}
                      >
                        <option value="waiting">Waiting</option>
                        <option value="in-consultation">In Consultation</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveDigitalToken(appt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                          title="View Digital Token Pass"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appt.status !== "cancelled" && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel token ${appt.tokenNumber}?`)) {
                                cancelAppointment(appt.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
