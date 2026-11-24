import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_BIOMARKERS,
  INITIAL_DOCTORS,
  INITIAL_LAB_REPORTS,
  INITIAL_MESSAGES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_SLOTS_BY_DOCTOR,
  INITIAL_SOAP_NOTES,
} from '../data/initialData';
import {
  Appointment,
  AppointmentStatus,
  Biomarker,
  CareMessage,
  Doctor,
  LabReport,
  Prescription,
  RoleMode,
  SlotItem,
  SoapNote,
  VisitType,
} from '../types/aurelia';

interface CreateAppointmentInput {
  doctorId: string;
  patientName: string;
  date: string;
  slotId?: string;
  time: string;
  visitType: VisitType;
  symptoms: string[];
  notes?: string;
  uploadedFileName?: string;
  insuranceProvider?: string;
}

interface AureliaContextValue {
  role: RoleMode;
  setRole: (role: RoleMode) => void;
  doctors: Doctor[];
  slotsByDoctor: Record<string, SlotItem[]>;
  appointments: Appointment[];
  biomarkers: Biomarker[];
  prescriptions: Prescription[];
  labReports: LabReport[];
  messages: CareMessage[];
  soapNotes: Record<string, SoapNote>;
  bookingDoctorId: string | null;
  bookingPresetVisitType: VisitType | null;
  bookingPresetSymptom: string | null;
  urgentCareOpen: boolean;
  setUrgentCareOpen: (open: boolean) => void;
  openBookingDrawer: (
    doctorId: string,
    presetVisitType?: VisitType | null,
    presetSymptom?: string | null
  ) => void;
  closeBookingDrawer: () => void;
  createAppointment: (input: CreateAppointmentInput) => Appointment;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  cancelAppointment: (appointmentId: string) => void;
  requestPrescriptionRefill: (prescriptionId: string) => void;
  issuePrescription: (input: {
    medication: string;
    dosage: string;
    frequency: string;
  }) => void;
  orderLabPanel: (input: { title: string; notes: string }) => void;
  saveSoapNote: (note: SoapNote) => void;
  sendCareMessage: (
    sender: 'patient' | 'doctor' | 'coordinator',
    text: string,
    attachment?: string
  ) => void;
  toggleSlotBlocked: (doctorId: string, slotId: string) => void;
  toggleSlotMode: (doctorId: string, slotId: string) => void;
  openUrgentEveningSlot: (doctorId: string) => void;
}

const AureliaContext = createContext<AureliaContextValue | null>(null);

export const AureliaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<RoleMode>('public');
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [slotsByDoctor, setSlotsByDoctor] =
    useState<Record<string, SlotItem[]>>(INITIAL_SLOTS_BY_DOCTOR);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [biomarkers] = useState<Biomarker[]>(INITIAL_BIOMARKERS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [labReports, setLabReports] = useState<LabReport[]>(INITIAL_LAB_REPORTS);
  const [messages, setMessages] = useState<CareMessage[]>(INITIAL_MESSAGES);
  const [soapNotes, setSoapNotes] = useState<Record<string, SoapNote>>(INITIAL_SOAP_NOTES);

  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [bookingPresetVisitType, setBookingPresetVisitType] = useState<VisitType | null>(null);
  const [bookingPresetSymptom, setBookingPresetSymptom] = useState<string | null>(null);
  const [urgentCareOpen, setUrgentCareOpen] = useState(false);

  const setRole = (nextRole: RoleMode) => {
    setRoleState(nextRole);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingDrawer = (
    doctorId: string,
    presetVisitType: VisitType | null = null,
    presetSymptom: string | null = null
  ) => {
    setBookingDoctorId(doctorId);
    setBookingPresetVisitType(presetVisitType);
    setBookingPresetSymptom(presetSymptom);
    setUrgentCareOpen(false);
  };

  const closeBookingDrawer = () => {
    setBookingDoctorId(null);
    setBookingPresetVisitType(null);
    setBookingPresetSymptom(null);
  };

  const createAppointment = (input: CreateAppointmentInput): Appointment => {
    const doc = doctors.find((d) => d.id === input.doctorId) || doctors[0];
    const refCode = `AUR-${Math.floor(1000 + Math.random() * 8999)}`;
    const newId = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      id: newId,
      referenceCode: refCode,
      patientName: input.patientName.trim() || 'Elena Rostova',
      patientAge: 34,
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      date: input.date,
      time: input.time,
      visitType: input.visitType,
      status: input.visitType === 'HD Video Telehealth' ? 'Telehealth Ready' : 'Upcoming',
      symptoms: input.symptoms.length > 0 ? input.symptoms : ['Precision Consultation'],
      notes: input.notes,
      uploadedFileName: input.uploadedFileName,
      insuranceProvider: input.insuranceProvider || 'Aurelia Private Tier',
      isPrimaryDemoPatient: true,
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    if (input.slotId) {
      setSlotsByDoctor((prev) => ({
        ...prev,
        [doc.id]: (prev[doc.id] || []).map((slot) =>
          slot.id === input.slotId ? { ...slot, blocked: true } : slot
        ),
      }));
    }

    setSoapNotes((prev) => ({
      ...prev,
      [newId]: {
        appointmentId: newId,
        patientName: newAppointment.patientName,
        allergies: 'Penicillin (mild urticaria)',
        vitals: { bp: '118/76 mmHg', hr: '61 bpm', temp: '98.5 °F', spo2: '99%' },
        subjective: `Pre-visit intake: ${newAppointment.symptoms.join(', ')}.${
          input.notes ? ` Patient note: ${input.notes}` : ''
        }`,
        objective: input.uploadedFileName
          ? `Uploaded report attached: ${input.uploadedFileName}. Awaiting clinical exam.`
          : 'Awaiting intake vitals & clinical examination.',
        assessment: 'Pending consultation evaluation.',
        plan: 'To be finalized during consultation.',
      },
    }));

    return newAppointment;
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt))
    );
  };

  const rescheduleAppointment = (appointmentId: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              date: newDate,
              time: newTime,
              status: apt.visitType === 'HD Video Telehealth' ? 'Telehealth Ready' : 'Upcoming',
            }
          : apt
      )
    );
  };

  const cancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt))
    );
  };

  const requestPrescriptionRefill = (prescriptionId: string) => {
    const target = prescriptions.find((rx) => rx.id === prescriptionId);
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === prescriptionId ? { ...rx, status: 'Refill Requested' } : rx))
    );
    if (target) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'patient',
          senderName: 'Elena Rostova',
          timestamp: nowTime,
          text: `Requested electronic refill for ${target.medication} (${target.dosage}).`,
        },
      ]);
    }
  };

  const issuePrescription = (input: {
    medication: string;
    dosage: string;
    frequency: string;
  }) => {
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      medication: input.medication,
      dosage: input.dosage,
      frequency: input.frequency,
      prescribedBy: 'Dr. Julian Vance, MD',
      issuedDate: 'Today, Nov 24',
      refillsRemaining: 3,
      nextRefillDays: 30,
      status: 'Active',
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'doctor',
        senderName: 'Dr. Julian Vance, MD',
        timestamp: nowTime,
        text: `Issued new e-prescription: ${input.medication} (${input.dosage}) — ${input.frequency}. Sent to your concierge pharmacy.`,
      },
    ]);
  };

  const orderLabPanel = (input: { title: string; notes: string }) => {
    const newLab: LabReport = {
      id: `lab-${Date.now()}`,
      title: input.title,
      orderedBy: 'Dr. Julian Vance, MD',
      date: 'Today, Nov 24',
      status: 'Pending Sample',
      summary: input.notes || 'Ordered during clinical consultation. Express phlebotomy ready.',
      markers: [
        { name: 'Primary Panel Assay', result: 'Pending', reference: 'Awaiting draw', flag: 'Pending' },
      ],
    };
    setLabReports((prev) => [newLab, ...prev]);
  };

  const saveSoapNote = (note: SoapNote) => {
    const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSoapNotes((prev) => ({
      ...prev,
      [note.appointmentId]: { ...note, lastSavedAt: savedAt },
    }));
  };

  const sendCareMessage = (
    sender: 'patient' | 'doctor' | 'coordinator',
    text: string,
    attachment?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderName =
      sender === 'patient'
        ? 'Elena Rostova'
        : sender === 'doctor'
        ? 'Dr. Julian Vance, MD'
        : 'Clara · Care Concierge';
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender,
        senderName,
        timestamp: nowTime,
        text,
        attachment,
      },
    ]);
  };

  const toggleSlotBlocked = (doctorId: string, slotId: string) => {
    setSlotsByDoctor((prev) => ({
      ...prev,
      [doctorId]: (prev[doctorId] || []).map((s) =>
        s.id === slotId ? { ...s, blocked: !s.blocked } : s
      ),
    }));
  };

  const toggleSlotMode = (doctorId: string, slotId: string) => {
    setSlotsByDoctor((prev) => ({
      ...prev,
      [doctorId]: (prev[doctorId] || []).map((s) =>
        s.id === slotId
          ? {
              ...s,
              mode:
                s.mode === 'In-Person Sanctuary'
                  ? 'HD Video Telehealth'
                  : 'In-Person Sanctuary',
            }
          : s
      ),
    }));
  };

  const openUrgentEveningSlot = (doctorId: string) => {
    setSlotsByDoctor((prev) => {
      const existing = prev[doctorId] || [];
      if (existing.some((s) => s.time === '07:15 PM')) return prev;
      return {
        ...prev,
        [doctorId]: [
          ...existing,
          {
            id: `urgent-${Date.now()}`,
            time: '07:15 PM',
            period: 'Evening',
            mode: 'HD Video Telehealth',
            blocked: false,
            isUrgent: true,
          },
        ],
      };
    });
  };

  return (
    <AureliaContext.Provider
      value={{
        role,
        setRole,
        doctors,
        slotsByDoctor,
        appointments,
        biomarkers,
        prescriptions,
        labReports,
        messages,
        soapNotes,
        bookingDoctorId,
        bookingPresetVisitType,
        bookingPresetSymptom,
        urgentCareOpen,
        setUrgentCareOpen,
        openBookingDrawer,
        closeBookingDrawer,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        requestPrescriptionRefill,
        issuePrescription,
        orderLabPanel,
        saveSoapNote,
        sendCareMessage,
        toggleSlotBlocked,
        toggleSlotMode,
        openUrgentEveningSlot,
      }}
    >
      {children}
    </AureliaContext.Provider>
  );
};

export function useAurelia() {
  const ctx = useContext(AureliaContext);
  if (!ctx) throw new Error('useAurelia must be used inside AureliaProvider');
  return ctx;
}
