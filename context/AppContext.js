"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_DOCTORS, INITIAL_APPOINTMENTS, DEPARTMENTS } from "@/lib/data";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  DOCTORS: "careslot_doctors_v1",
  APPOINTMENTS: "careslot_appointments_v1",
  ROLE: "careslot_user_role_v1",
  ACTIVE_DOC: "careslot_active_doc_v1",
};

export function AppProvider({ children }) {
  const [role, setRole] = useState("patient"); // "patient" | "doctor" | "admin"
  const [activeDoctorId, setActiveDoctorId] = useState("doc-1");
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [activeDigitalToken, setActiveDigitalToken] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage if available
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      const storedDocId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC);
      const storedDoctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      const storedAppts = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);

      if (storedRole) setRole(storedRole);
      if (storedDocId) setActiveDoctorId(storedDocId);
      if (storedDoctors) setDoctors(JSON.parse(storedDoctors));
      if (storedAppts) setAppointments(JSON.parse(storedAppts));
    } catch (e) {
      console.warn("Could not load stored CareSlot state, using defaults:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC, activeDoctorId);
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.error("Failed to persist CareSlot state:", e);
    }
  }, [role, activeDoctorId, doctors, appointments, isLoaded]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr?.id ? null : curr));
    }, 4000);
  };

  // Change user view/role
  const switchRole = (newRole) => {
    setRole(newRole);
    showToast(`Switched to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} Mode`, "info");
  };

  // Update doctor real-time availability status
  const updateDoctorStatus = (doctorId, newStatus) => {
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            status: newStatus,
            currentServingToken: newStatus === "Offline" || newStatus === "On Break" ? null : doc.currentServingToken,
          };
        }
        return doc;
      })
    );
    showToast(`Doctor status updated to "${newStatus}"`, "info");
  };

  // Book an appointment & issue real-time token
  const bookAppointment = ({
    doctorId,
    date,
    timeSlot,
    patientName,
    patientAge,
    patientGender,
    patientPhone,
    reason,
    isPriority = false,
  }) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) {
      showToast("Selected doctor not found.", "error");
      return null;
    }

    // Check conflict: slot already booked for this doctor and date
    const existingConflict = appointments.find(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        a.timeSlot === timeSlot &&
        a.status !== "cancelled" &&
        a.status !== "no-show"
    );

    if (existingConflict) {
      showToast(`Conflict: The ${timeSlot} slot is already booked for ${doctor.name}. Please select another time.`, "error");
      return null;
    }

    // Generate Token Number e.g., CS-CARD-105
    const deptPrefix = doctor.departmentId.substring(0, 4).toUpperCase();
    const tokenSeq = 100 + appointments.length + 1;
    const tokenNumber = `CS-${deptPrefix}-${tokenSeq}`;

    // Calculate queue waiting position
    const waitingBefore = appointments.filter(
      (a) => a.doctorId === doctorId && a.status === "waiting"
    ).length;

    const departmentObj = DEPARTMENTS.find((dept) => dept.id === doctor.departmentId);

    const newAppointment = {
      id: `apt-${Date.now()}`,
      tokenNumber,
      doctorId,
      doctorName: doctor.name,
      departmentId: doctor.departmentId,
      departmentName: departmentObj?.name || doctor.departmentId,
      opdRoom: doctor.opdRoom,
      patientName,
      patientAge: Number(patientAge) || 30,
      patientGender,
      patientPhone,
      reason: reason || "Routine Consultation",
      date,
      timeSlot,
      status: "waiting",
      queuePosition: waitingBefore + 1,
      bookedAt: new Date().toISOString(),
      isPriority: Boolean(isPriority),
    };

    // Update appointments
    setAppointments((prev) => [newAppointment, ...prev]);

    // Update doctor's slot status
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === doctorId) {
          return {
            ...d,
            slots: d.slots.map((s) => (s.time === timeSlot ? { ...s, isBooked: true } : s)),
          };
        }
        return d;
      })
    );

    setActiveDigitalToken(newAppointment);
    showToast(`Appointment booked successfully! Token: ${tokenNumber}`, "success");
    return newAppointment;
  };

  // Cancel an appointment
  const cancelAppointment = (appointmentId) => {
    const target = appointments.find((a) => a.id === appointmentId);
    if (!target) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: "cancelled" } : a))
    );

    // Free up doctor's slot if cancelled
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === target.doctorId) {
          return {
            ...d,
            slots: d.slots.map((s) => (s.time === target.timeSlot ? { ...s, isBooked: false } : s)),
          };
        }
        return d;
      })
    );

    showToast(`Appointment & Token ${target.tokenNumber} cancelled.`, "info");
  };

  // Update appointment status (Doctor & Admin actions)
  const updateAppointmentStatus = (appointmentId, newStatus) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
    );

    // Update Doctor current serving token
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === apt.doctorId) {
          if (newStatus === "in-consultation") {
            return { ...d, currentServingToken: apt.tokenNumber, status: "In Consultation" };
          }
          if (newStatus === "completed" || newStatus === "no-show") {
            return {
              ...d,
              currentServingToken: d.currentServingToken === apt.tokenNumber ? null : d.currentServingToken,
              status: "Available",
            };
          }
        }
        return d;
      })
    );

    showToast(`Token ${apt.tokenNumber} marked as ${newStatus}`, "success");
  };

  // Doctor: Call next patient in queue
  const callNextPatient = (doctorId) => {
    const waitingList = appointments.filter(
      (a) => a.doctorId === doctorId && a.status === "waiting"
    );

    if (waitingList.length === 0) {
      showToast("No waiting patients in the queue for this doctor.", "info");
      return;
    }

    // Pick top priority or first in queue
    const nextPatient = waitingList.find((a) => a.isPriority) || waitingList[0];

    // Mark current in-consultation as completed
    const currentInConsultation = appointments.find(
      (a) => a.doctorId === doctorId && a.status === "in-consultation"
    );

    setAppointments((prev) =>
      prev.map((a) => {
        if (currentInConsultation && a.id === currentInConsultation.id) {
          return { ...a, status: "completed" };
        }
        if (a.id === nextPatient.id) {
          return { ...a, status: "in-consultation" };
        }
        return a;
      })
    );

    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === doctorId) {
          return {
            ...d,
            status: "In Consultation",
            currentServingToken: nextPatient.tokenNumber,
          };
        }
        return d;
      })
    );

    showToast(`Called Token ${nextPatient.tokenNumber} (${nextPatient.patientName}) to OPD Room!`, "success");
  };

  // Demonstration: simulate clinic flow
  const advanceSimulation = () => {
    const activeDoc = doctors.find((d) => d.id === activeDoctorId) || doctors[0];
    callNextPatient(activeDoc.id);
  };

  // Reset to initial demo data
  const resetAllData = () => {
    setDoctors(INITIAL_DOCTORS);
    setAppointments(INITIAL_APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    showToast("Reset all CareSlot clinic data to initial demo state.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        role,
        switchRole,
        activeDoctorId,
        setActiveDoctorId,
        doctors,
        updateDoctorStatus,
        appointments,
        bookAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        callNextPatient,
        advanceSimulation,
        resetAllData,
        selectedDoctorForBooking,
        setSelectedDoctorForBooking,
        activeDigitalToken,
        setActiveDigitalToken,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
