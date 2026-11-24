import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ChevronRight,
  FileUp,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';
import { SANCTUARY_IMAGE, UPCOMING_DATES } from '../data/initialData';
import { Appointment, VisitType } from '../types/aurelia';

const SYMPTOM_OPTIONS = [
  'Preventive Longevity Review',
  'Persistent Migraine / Fatigue',
  'Palpitations / HRV Shift',
  'Sleep Disruption',
  'Lab Result Interpretation',
  'Prescription Consultation',
];

const DeterministicQR: React.FC<{ code: string }> = ({ code }) => {
  const cells = useMemo(() => {
    const grid: boolean[] = [];
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed = (seed * 31 + code.charCodeAt(i)) % 9973;
    }
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const isCorner =
          (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
        if (isCorner) {
          const border =
            r === 0 || r === 2 || r === 6 || r === 8 || c === 0 || c === 2 || c === 6 || c === 8;
          const center = (r === 1 && c === 1) || (r === 1 && c === 7) || (r === 7 && c === 1);
          grid.push(border || center);
        } else {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          grid.push((seed >> 16) % 2 === 0);
        }
      }
    }
    return grid;
  }, [code]);

  return (
    <svg
      viewBox="0 0 90 90"
      className="h-24 w-24 rounded-lg bg-white p-2"
      aria-label={`Check-in QR code for ${code}`}
    >
      {cells.map((filled, idx) => {
        if (!filled) return null;
        const r = Math.floor(idx / 9);
        const c = idx % 9;
        return (
          <rect
            key={idx}
            x={c * 10}
            y={r * 10}
            width={9}
            height={9}
            rx={1.5}
            fill="#0a0a0a"
          />
        );
      })}
    </svg>
  );
};

export const BookingDrawer: React.FC = () => {
  const {
    doctors,
    slotsByDoctor,
    bookingDoctorId,
    bookingPresetVisitType,
    bookingPresetSymptom,
    closeBookingDrawer,
    createAppointment,
    setRole,
  } = useAurelia();

  const doctor = doctors.find((d) => d.id === bookingDoctorId) || null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [visitType, setVisitType] = useState<VisitType>('In-Person Sanctuary');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [patientName, setPatientName] = useState('Elena Rostova');
  const [insurance, setInsurance] = useState('Aurelia Private Tier');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    if (!doctor) return;
    setStep(1);
    setConfirmedAppointment(null);
    setVisitType(
      bookingPresetVisitType && doctor.visitModes.includes(bookingPresetVisitType)
        ? bookingPresetVisitType
        : doctor.visitModes[0]
    );
    setSelectedDateIdx(0);
    const available = (slotsByDoctor[doctor.id] || []).filter((s) => !s.blocked);
    setSelectedSlotId(available[0]?.id || '');
    setSelectedSymptoms(
      bookingPresetSymptom ? [bookingPresetSymptom] : ['Preventive Longevity Review']
    );
    setNotes('');
    setUploadedFileName('');
  }, [doctor, bookingPresetVisitType, bookingPresetSymptom, slotsByDoctor]);

  if (!doctor) return null;

  const doctorSlots = slotsByDoctor[doctor.id] || [];
  const filteredSlots = doctorSlots.filter((s) => !s.blocked);
  const activeSlot =
    filteredSlots.find((s) => s.id === selectedSlotId) || filteredSlots[0] || null;
  const activeDate = UPCOMING_DATES[selectedDateIdx];

  const toggleSymptom = (tag: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmBooking = () => {
    const created = createAppointment({
      doctorId: doctor.id,
      patientName,
      date: `${activeDate.label}, ${activeDate.dateStr}`,
      slotId: activeSlot?.id,
      time: activeSlot?.time || doctor.nextAvailable.split(', ')[1] || '02:30 PM',
      visitType,
      symptoms: selectedSymptoms,
      notes,
      uploadedFileName: uploadedFileName || undefined,
      insuranceProvider: insurance,
    });
    setConfirmedAppointment(created);
    setStep(4);
  };

  const periods: ('Morning' | 'Afternoon' | 'Evening')[] = [
    'Morning',
    'Afternoon',
    'Evening',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Book consultation with ${doctor.name}`}
    >
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-white/15 bg-[#0d0d10]/95 text-white backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="h-11 w-11 rounded-lg object-cover border border-white/15"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/55">
                Step {step} of 4
              </p>
              <h3 className="text-base font-medium text-white">{doctor.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBookingDrawer}
            aria-label="Close booking drawer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="grid grid-cols-4 gap-1.5 border-b border-white/10 px-6 py-3">
          {['Visit Type', 'Date & Slot', 'Pre-Check', 'Confirmed'].map((label, idx) => {
            const stepNum = idx + 1;
            const active = step >= stepNum;
            return (
              <div key={label} className="flex flex-col gap-1.5">
                <div
                  className={`h-1 rounded-full transition-colors duration-300 ${
                    active ? 'bg-white' : 'bg-white/15'
                  }`}
                />
                <span
                  className={`text-[11px] tracking-wide ${
                    active ? 'text-white/90' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-normal tracking-tight text-white">
                  Select your consultation environment
                </h4>
                <p className="mt-1.5 text-sm text-white/65">
                  Choose private sanctuary attendance or encrypted HD video telemetry.
                </p>
              </div>

              <div className="space-y-3.5">
                <button
                  type="button"
                  disabled={!doctor.visitModes.includes('In-Person Sanctuary')}
                  onClick={() => setVisitType('In-Person Sanctuary')}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                    visitType === 'In-Person Sanctuary'
                      ? 'border-white bg-white/15'
                      : 'border-white/15 bg-white/[0.06] hover:bg-white/10'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          In-Person Sanctuary
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-white/65">
                          {doctor.location} · Private arrival suite, express phlebotomy, zero waiting room.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-white">
                      ${doctor.fee}
                    </span>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={SANCTUARY_IMAGE}
                      alt="Aurelia Private Sanctuary Lounge"
                      className="h-28 w-full object-cover"
                    />
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!doctor.visitModes.includes('HD Video Telehealth')}
                  onClick={() => setVisitType('HD Video Telehealth')}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                    visitType === 'HD Video Telehealth'
                      ? 'border-white bg-white/15'
                      : 'border-white/15 bg-white/[0.06] hover:bg-white/10'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Video size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          HD Video Telehealth
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-white/65">
                          End-to-end encrypted diagnostic room with screen-shared lab review and instant e-Rx.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-white">
                      ${doctor.fee}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-normal tracking-tight text-white">
                  Choose date & clinical slot
                </h4>
                <p className="mt-1.5 text-sm text-white/65">
                  Live availability synchronized directly with {doctor.name.split(',')[0]}’s workspace.
                </p>
              </div>

              {/* Horizontal date picker */}
              <div className="grid grid-cols-5 gap-2">
                {UPCOMING_DATES.map((d, i) => {
                  const selected = i === selectedDateIdx;
                  return (
                    <button
                      key={d.full}
                      type="button"
                      onClick={() => setSelectedDateIdx(i)}
                      className={`flex flex-col items-center rounded-xl border py-3 transition-all duration-200 ${
                        selected
                          ? 'border-white bg-white text-black'
                          : 'border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/12'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider opacity-70">
                        {d.label}
                      </span>
                      <span className="mt-0.5 text-sm font-medium tabular-nums">
                        {d.dateStr}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots by period */}
              <div className="space-y-5">
                {periods.map((period) => {
                  const items = filteredSlots.filter((s) => s.period === period);
                  if (items.length === 0) return null;
                  return (
                    <div key={period}>
                      <p className="mb-2.5 text-[11px] uppercase tracking-[0.15em] text-white/55">
                        {period}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {items.map((slot) => {
                          const isSelected = activeSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                setSelectedSlotId(slot.id);
                                setVisitType(slot.mode);
                              }}
                              className={`flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 ${
                                isSelected
                                  ? 'border-white bg-white text-black'
                                  : 'border-white/15 bg-white/[0.06] text-white hover:bg-white/12'
                              }`}
                            >
                              <span className="text-sm font-medium tabular-nums">
                                {slot.time}
                              </span>
                              <span
                                className={`mt-0.5 text-[11px] ${
                                  isSelected ? 'text-black/70' : 'text-white/55'
                                }`}
                              >
                                {slot.mode === 'HD Video Telehealth' ? 'HD Video' : 'In-Person'}
                                {slot.isUrgent ? ' · Same-Day' : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredSlots.length === 0 && (
                  <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 text-sm text-white/70">
                    All today’s slots are currently reserved. Please select another date or use Urgent Care.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xl font-normal tracking-tight text-white">
                  Patient details & pre-visit intake
                </h4>
                <p className="mt-1.5 text-sm text-white/65">
                  Shared directly with your physician’s chart prior to arrival.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-white/60">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-white/60">
                    Coverage / Membership
                  </label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-[#15151a] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="Aurelia Private Tier">Aurelia Private Tier</option>
                    <option value="Cigna Global Executive">Cigna Global Executive</option>
                    <option value="Aetna Premier PPO">Aetna Premier PPO</option>
                    <option value="Direct Private Concierge">Direct Private Concierge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Focus Areas & Symptoms
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((tag) => {
                    const active = selectedSymptoms.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSymptom(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          active
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-white/20 bg-white/[0.06] text-white/75 hover:bg-white/12'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Clinical Context (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share recent wearable readings, symptom duration, or questions..."
                  className="w-full rounded-xl border border-white/20 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Prior Lab Report / Wearable Export
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/25 bg-white/[0.05] px-4 py-3.5 transition-colors hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <FileUp size={18} className="text-white/70" />
                    <span className="text-xs text-white/80">
                      {uploadedFileName
                        ? `Attached: ${uploadedFileName}`
                        : 'Upload PDF, DICOM summary, or Apple Health export'}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFileName(file.name);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 4 && confirmedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <Check size={18} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-300">
                    Booking Confirmed
                  </p>
                  <h4 className="text-xl font-normal text-white">
                    Your clinical suite is reserved
                  </h4>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/55">
                      Reference · {confirmedAppointment.referenceCode}
                    </p>
                    <p className="text-lg font-medium text-white">
                      {confirmedAppointment.doctorName}
                    </p>
                    <p className="text-sm text-white/75">
                      {confirmedAppointment.specialty} · {confirmedAppointment.visitType}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-sm tabular-nums text-white">
                      <Calendar size={15} className="text-white/60" />
                      <span>
                        {confirmedAppointment.date} at {confirmedAppointment.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <DeterministicQR code={confirmedAppointment.referenceCode} />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/55">
                      Sanctuary Check-In
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/10 p-4 text-xs leading-relaxed text-white/85">
                <div className="flex items-center gap-2 font-medium text-[#E2C285]">
                  <Sparkles size={14} />
                  <span>Live Demo State Updated</span>
                </div>
                <p className="mt-1 text-white/75">
                  This reservation is now live in Elena Rostova’s Patient Dashboard and Dr. Vance’s Doctor Workspace queue.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    closeBookingDrawer();
                    setRole('patient');
                  }}
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
                >
                  Open Patient Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeBookingDrawer();
                    setRole('doctor');
                  }}
                  className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  Inspect Doctor Queue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-white/15 px-6 py-4">
            <button
              type="button"
              onClick={() => (step === 1 ? closeBookingDrawer() : setStep((s) => (s - 1) as 1 | 2 | 3))}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 2 && !activeSlot}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85 disabled:opacity-40"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
              >
                <span>Confirm Reservation</span>
                <Check size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
