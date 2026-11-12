"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  FileText,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function BookingModal() {
  const {
    selectedDoctorForBooking,
    setSelectedDoctorForBooking,
    bookAppointment,
    appointments,
  } = useApp();

  const doctor = selectedDoctorForBooking;

  // Format dates: Today, Tomorrow, Day after tomorrow
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2);
  const dayAfterStr = dayAfter.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [errors, setErrors] = useState({});

  if (!doctor) return null;

  // Check which slots are already booked on the selected date
  const bookedSlotsOnDate = appointments
    .filter(
      (a) =>
        a.doctorId === doctor.id &&
        a.date === selectedDate &&
        a.status !== "cancelled" &&
        a.status !== "no-show"
    )
    .map((a) => a.timeSlot);

  // Group doctor slots into Morning, Afternoon, Evening
  const morningSlots = doctor.slots.filter((s) => s.time.includes("AM"));
  const afternoonSlots = doctor.slots.filter(
    (s) => s.time.includes("PM") && (s.time.startsWith("01") || s.time.startsWith("02") || s.time.startsWith("03"))
  );
  const eveningSlots = doctor.slots.filter(
    (s) => s.time.includes("PM") && !morningSlots.includes(s) && !afternoonSlots.includes(s)
  );

  const handleBook = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!patientName.trim()) newErrors.patientName = "Patient name is required";
    if (!patientAge || patientAge <= 0 || patientAge > 120) newErrors.patientAge = "Valid age is required";
    if (!patientPhone.trim() || patientPhone.length < 8) newErrors.patientPhone = "Valid contact phone is required";
    if (!selectedSlot) newErrors.slot = "Please select an available consultation slot";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = bookAppointment({
      doctorId: doctor.id,
      date: selectedDate,
      timeSlot: selectedSlot,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      reason,
      isPriority,
    });

    if (res) {
      setSelectedDoctorForBooking(null);
    }
  };

  const renderSlotPill = (s) => {
    const isBooked = bookedSlotsOnDate.includes(s.time);
    const isSelected = selectedSlot === s.time;

    return (
      <button
        key={s.time}
        type="button"
        disabled={isBooked}
        onClick={() => {
          setSelectedSlot(s.time);
          setErrors((prev) => ({ ...prev, slot: null }));
        }}
        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 ${
          isBooked
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
            : isSelected
            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-2 ring-teal-600/30"
            : "bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50"
        }`}
      >
        <span>{s.time}</span>
        {isBooked ? (
          <span className="text-[10px] text-slate-400 font-normal no-underline">Booked</span>
        ) : isSelected ? (
          <CheckCircle className="w-3.5 h-3.5 text-white" />
        ) : null}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg leading-tight">Book Outpatient Consultation</h3>
            <p className="text-xs text-teal-100 mt-0.5">
              Instant OPD token generation & real-time slot locking
            </p>
          </div>
          <button
            onClick={() => setSelectedDoctorForBooking(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Summary Bar */}
        <div className="bg-teal-50/70 p-4 border-b border-teal-100 flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-12 h-12 rounded-xl object-cover border border-teal-200 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{doctor.name}</h4>
            <p className="text-xs text-slate-600 truncate">{doctor.qualification}</p>
            <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {doctor.opdRoom} • ₹{doctor.consultationFee} Fee
            </p>
          </div>
        </div>

        <form onSubmit={handleBook} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Step 1: Date Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              1. Select Appointment Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(todayStr);
                  setSelectedSlot(null);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedDate === todayStr
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
                }`}
              >
                Today
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">{todayStr}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(tomorrowStr);
                  setSelectedSlot(null);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedDate === tomorrowStr
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
                }`}
              >
                Tomorrow
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">{tomorrowStr}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(dayAfterStr);
                  setSelectedSlot(null);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedDate === dayAfterStr
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
                }`}
              >
                Day After
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">{dayAfterStr}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Slot Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                2. Select Available Slot
              </label>
              {selectedSlot && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Selected: {selectedSlot}
                </span>
              )}
            </div>

            {errors.slot && (
              <p className="text-xs text-rose-600 mb-2 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {errors.slot}
              </p>
            )}

            <div className="space-y-3">
              {morningSlots.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Morning Session</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {morningSlots.map(renderSlotPill)}
                  </div>
                </div>
              )}

              {afternoonSlots.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Afternoon Session</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {afternoonSlots.map(renderSlotPill)}
                  </div>
                </div>
              )}

              {eveningSlots.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Evening Session</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {eveningSlots.map(renderSlotPill)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Patient Information */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              3. Patient Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setErrors((prev) => ({ ...prev, patientName: null }));
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.patientName ? "border-rose-400 bg-rose-50/50" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
                {errors.patientName && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{errors.patientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={patientPhone}
                  onChange={(e) => {
                    setPatientPhone(e.target.value);
                    setErrors((prev) => ({ ...prev, patientPhone: null }));
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.patientPhone ? "border-rose-400 bg-rose-50/50" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
                {errors.patientPhone && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{errors.patientPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Age *</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => {
                    setPatientAge(e.target.value);
                    setErrors((prev) => ({ ...prev, patientAge: null }));
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.patientAge ? "border-rose-400 bg-rose-50/50" : "border-slate-200"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Reason for Consultation / Symptoms
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe primary health issue, symptoms, or previous diagnosis..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Priority / Urgent Flag */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <input
                type="checkbox"
                id="isPriority"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <label htmlFor="isPriority" className="text-xs text-amber-900 cursor-pointer">
                <strong>Priority Case:</strong> Patient requires urgent triage or elderly assistance.
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedDoctorForBooking(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm & Generate Digital Token</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
