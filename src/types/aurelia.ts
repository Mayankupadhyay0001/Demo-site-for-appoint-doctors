export type RoleMode = 'public' | 'patient' | 'doctor';

export type VisitType = 'In-Person Sanctuary' | 'HD Video Telehealth';

export type AppointmentStatus =
  | 'Checked In'
  | 'In Consultation'
  | 'Upcoming'
  | 'Telehealth Ready'
  | 'Completed'
  | 'Cancelled';

export interface Doctor {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  subspecialties: string[];
  experienceYears: number;
  fee: number;
  rating: number;
  reviewCount: number;
  image: string;
  location: string;
  bio: string;
  visitModes: VisitType[];
  nextAvailable: string;
  symptomKeywords: string[];
  urgentAvailable: boolean;
}

export interface SlotItem {
  id: string;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  mode: VisitType;
  blocked: boolean;
  isUrgent?: boolean;
}

export interface Appointment {
  id: string;
  referenceCode: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  visitType: VisitType;
  status: AppointmentStatus;
  symptoms: string[];
  notes?: string;
  uploadedFileName?: string;
  insuranceProvider?: string;
  isPrimaryDemoPatient?: boolean;
}

export interface Biomarker {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: 'Optimal' | 'Review Needed';
  delta: string;
  updatedAt: string;
  history: number[];
  targetRange: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  issuedDate: string;
  refillsRemaining: number;
  nextRefillDays: number;
  status: 'Active' | 'Refill Requested';
}

export interface LabReport {
  id: string;
  title: string;
  orderedBy: string;
  date: string;
  status: 'Ready' | 'Pending Sample' | 'Processing';
  summary: string;
  markers: {
    name: string;
    result: string;
    reference: string;
    flag: 'Optimal' | 'Borderline' | 'Pending';
  }[];
}

export interface CareMessage {
  id: string;
  sender: 'patient' | 'doctor' | 'coordinator';
  senderName: string;
  timestamp: string;
  text: string;
  attachment?: string;
}

export interface SoapNote {
  appointmentId: string;
  patientName: string;
  allergies: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    spo2: string;
  };
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  lastSavedAt?: string;
}
