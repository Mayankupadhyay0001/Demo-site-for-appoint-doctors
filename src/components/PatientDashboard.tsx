import React, { useState } from 'react';
import {
  Activity,
  Building2,
  Calendar,
  Check,
  Clock,
  Download,
  FileText,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  Pill,
  Send,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';
import { PATIENT_AVATAR, SANCTUARY_IMAGE, UPCOMING_DATES } from '../data/initialData';
import { Appointment, LabReport } from '../types/aurelia';

const Sparkline: React.FC<{ data: number[]; warning?: boolean }> = ({
  data,
  warning = false,
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const w = 160;
  const h = 44;
  const points = data
    .map((val, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * w;
      const y = h - 6 - ((val - min) / range) * (h - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const stroke = warning ? '#FBBF24' : '#6EE7B7';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const PatientDashboard: React.FC = () => {
  const {
    appointments,
    biomarkers,
    prescriptions,
    labReports,
    messages,
    doctors,
    openBookingDrawer,
    rescheduleAppointment,
    cancelAppointment,
    requestPrescriptionRefill,
    sendCareMessage,
  } = useAurelia();

  const patientAppointments = appointments.filter(
    (a) => a.isPrimaryDemoPatient && a.status !== 'Cancelled'
  );
  const nextAppointment = patientAppointments[0] || null;

  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('Wed, Nov 26');
  const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');

  const [videoRoomApt, setVideoRoomApt] = useState<Appointment | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [previewLab, setPreviewLab] = useState<LabReport | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;
    sendCareMessage(
      'patient',
      chatInput.trim() || 'Shared clinical file attachment.',
      chatAttachment || undefined
    );
    setChatInput('');
    setChatAttachment('');
  };

  const handleQuickReply = (text: string) => {
    sendCareMessage('patient', text);
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-24 pb-16 text-white sm:px-8 sm:pt-28 md:px-12">
      {/* Patient Header Strip */}
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <img
            src={PATIENT_AVATAR}
            alt="Elena Rostova"
            className="h-16 w-16 rounded-xl object-cover border border-white/20"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-normal tracking-tight text-white">
                Elena Rostova
              </h1>
              <span className="rounded-full border border-[#C5A059]/45 bg-[#C5A059]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#E2C285]">
                Aurelia Private Member
              </span>
            </div>
            <p className="mt-1 text-xs text-white/65">
              Lead Physician: Dr. Julian Vance, MD · Care Coordinator: Clara · Member ID: AUR-M-2049
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            <MapPin size={14} />
            <span>Sanctuary Suite Info</span>
          </button>
          <button
            type="button"
            onClick={() => openBookingDrawer(doctors[0].id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
          >
            <Calendar size={14} />
            <span>Book New Visit</span>
          </button>
        </div>
      </div>

      {/* Main Portal Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Left 8 columns: Appointments, Biomarkers, Prescriptions & Labs */}
        <div className="space-y-6 lg:col-span-8">
          {/* Upcoming Appointments */}
          <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                  Care Schedule
                </p>
                <h2 className="mt-1 text-xl font-normal text-white">
                  Upcoming Appointments
                </h2>
              </div>
              {nextAppointment && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200 tabular-nums">
                  <Clock size={13} />
                  <span>Next visit: {nextAppointment.date}, {nextAppointment.time}</span>
                </span>
              )}
            </div>

            {patientAppointments.length === 0 ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-6 text-center">
                <p className="text-sm text-white/70">No active appointments scheduled.</p>
                <button
                  type="button"
                  onClick={() => openBookingDrawer(doctors[0].id)}
                  className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
                >
                  Schedule Consultation
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3.5">
                {patientAppointments.map((apt) => {
                  const isVideo = apt.visitType === 'HD Video Telehealth';
                  return (
                    <div
                      key={apt.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-white/15 bg-black/35 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                          <span className="font-mono tabular-nums text-white/80">
                            {apt.referenceCode}
                          </span>
                          <span>·</span>
                          <span>{apt.specialty}</span>
                          <span>·</span>
                          <span className="text-emerald-300">{apt.status}</span>
                        </div>
                        <p className="text-base font-medium text-white">
                          {apt.doctorName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={13} />
                            {apt.date} at {apt.time}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {isVideo ? <Video size={13} /> : <Building2 size={13} />}
                            {apt.visitType}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isVideo ? (
                          <button
                            type="button"
                            onClick={() => setVideoRoomApt(apt)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
                          >
                            <Video size={13} />
                            <span>Join HD Video Room</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setLocationModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
                          >
                            <MapPin size={13} />
                            <span>Suite Map</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setRescheduleTarget(apt)}
                          className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs text-white transition-colors hover:bg-white/20"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelAppointment(apt.id)}
                          className="rounded-full border border-rose-400/25 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200 transition-colors hover:bg-rose-500/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Health & Biomarker Tracker */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">
                Biomarker Telemetry
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                <Activity size={13} />
                <span>Synced with Apple Health & Lab Assays</span>
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {biomarkers.map((bio) => {
                const isWarning = bio.status === 'Review Needed';
                return (
                  <div
                    key={bio.id}
                    className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-white/65">{bio.label}</p>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-2xl font-medium tabular-nums text-white">
                            {bio.value}
                          </span>
                          <span className="text-xs text-white/55">{bio.unit}</span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          isWarning
                            ? 'border-amber-300/35 bg-amber-400/15 text-amber-200'
                            : 'border-emerald-300/35 bg-emerald-400/15 text-emerald-200'
                        }`}
                      >
                        {bio.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <Sparkline data={bio.history} warning={isWarning} />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                      <span>{bio.delta}</span>
                      <span className="tabular-nums">Target: {bio.targetRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Digital Prescriptions & Lab Reports */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Prescriptions */}
            <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                    Pharmacy Vault
                  </p>
                  <h3 className="mt-1 text-lg font-normal text-white">
                    Digital Prescriptions
                  </h3>
                </div>
                <Pill size={18} className="text-white/50" />
              </div>

              <div className="mt-4 space-y-3">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-xl border border-white/12 bg-black/35 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white">{rx.medication}</p>
                        <p className="mt-0.5 text-xs text-white/65">
                          {rx.dosage} · {rx.frequency}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          rx.status === 'Refill Requested'
                            ? 'bg-amber-400/15 text-amber-200 border border-amber-300/30'
                            : 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-white/55">
                      <span className="tabular-nums">
                        {rx.refillsRemaining} refills left · Next in {rx.nextRefillDays}d
                      </span>
                      <button
                        type="button"
                        disabled={rx.status === 'Refill Requested'}
                        onClick={() => requestPrescriptionRefill(rx.id)}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-50"
                      >
                        {rx.status === 'Refill Requested' ? 'Requested' : 'Request Refill'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lab Reports */}
            <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                    Diagnostic Dossier
                  </p>
                  <h3 className="mt-1 text-lg font-normal text-white">
                    Lab Reports & Panels
                  </h3>
                </div>
                <FileText size={18} className="text-white/50" />
              </div>

              <div className="mt-4 space-y-3">
                {labReports.map((lab) => (
                  <div
                    key={lab.id}
                    className="rounded-xl border border-white/12 bg-black/35 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white">{lab.title}</p>
                        <p className="mt-0.5 text-xs text-white/60">
                          {lab.orderedBy} · {lab.date}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          lab.status === 'Ready'
                            ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30'
                            : 'bg-white/10 text-white/75 border border-white/20'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      {lab.summary}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewLab(lab)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-white/20"
                      >
                        <Download size={12} />
                        <span>Inspect Report</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right 4 columns: Concierge Care Chat */}
        <aside className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl lg:col-span-4 lg:h-[780px]">
          <div className="border-b border-white/15 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#E2C285]">
              Direct Concierge Thread
            </p>
            <h3 className="mt-1 text-lg font-normal text-white">
              Care Team Messaging
            </h3>
            <p className="mt-0.5 text-xs text-white/60">
              Dr. Julian Vance & Clara (Care Coordinator)
            </p>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto p-5">
            {messages.map((msg) => {
              const isPatient = msg.sender === 'patient';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                >
                  <span className="mb-1 text-[11px] text-white/50">
                    {msg.senderName} · {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isPatient
                        ? 'bg-white text-black'
                        : 'border border-white/15 bg-black/40 text-white/90'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.attachment && (
                      <div
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] ${
                          isPatient
                            ? 'bg-black/10 text-black/80'
                            : 'bg-white/10 text-white/80'
                        }`}
                      >
                        <Paperclip size={11} />
                        <span>{msg.attachment}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/15 p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                'Confirm fasting window',
                'Share Apple Health PDF',
                'Valet arrival 2:20 PM',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickReply(chip)}
                  className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/75 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <label
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/75 hover:bg-white/20"
                title="Attach file"
              >
                <Paperclip size={15} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setChatAttachment(f.name);
                  }}
                />
              </label>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  chatAttachment
                    ? `Attached: ${chatAttachment}`
                    : 'Message Dr. Vance or Clara...'
                }
                className="flex-1 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs text-white placeholder-white/40 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/85"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#111116] p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reschedule Visit</h3>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-full p-1 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-white/65">
              {rescheduleTarget.doctorName} · {rescheduleTarget.visitType}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-white/55">
                  New Date
                </label>
                <select
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
                >
                  {UPCOMING_DATES.map((d) => (
                    <option key={d.full} value={`${d.label}, ${d.dateStr}`} className="bg-[#121216]">
                      {d.label}, {d.dateStr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-white/55">
                  New Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:30 AM', '10:30 AM', '02:30 PM', '04:15 PM', '05:30 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRescheduleTime(t)}
                      className={`rounded-lg border py-2 text-xs tabular-nums ${
                        rescheduleTime === t
                          ? 'border-white bg-white text-black font-medium'
                          : 'border-white/20 bg-white/5 text-white/80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  rescheduleAppointment(rescheduleTarget.id, rescheduleDate, rescheduleTime);
                  setRescheduleTarget(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
              >
                <Check size={13} />
                <span>Confirm New Time</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HD VIDEO ROOM SIMULATION MODAL */}
      {videoRoomApt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-[#0d0e12] text-white">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-300">
                  Encrypted HD Clinical Room · {videoRoomApt.referenceCode}
                </p>
                <h3 className="text-base font-medium">{videoRoomApt.doctorName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoRoomApt(null)}
                className="rounded-full border border-white/15 bg-white/10 p-2 text-white/80 hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative flex h-72 items-center justify-center bg-gradient-to-br from-[#141720] to-[#0a0a0c] p-6">
              <div className="text-center">
                <img
                  src={
                    doctors.find((d) => d.id === videoRoomApt.doctorId)?.image ||
                    doctors[0].image
                  }
                  alt={videoRoomApt.doctorName}
                  className="mx-auto h-24 w-24 rounded-full object-cover border-2 border-white/25"
                />
                <p className="mt-3 text-sm font-medium text-white">
                  Waiting Room Ready — {videoRoomApt.doctorName}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  256-bit HIPAA WebRTC Telemetry · Audio & Video verified
                </p>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs">
                <span>Elena Rostova ({camOn ? 'Camera On' : 'Camera Off'})</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 border-t border-white/15 py-4">
              <button
                type="button"
                onClick={() => setMicOn((m) => !m)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs ${
                  micOn
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-rose-400/40 bg-rose-500/20 text-rose-200'
                }`}
              >
                {micOn ? <Mic size={14} /> : <MicOff size={14} />}
                <span>{micOn ? 'Mute' : 'Unmuted Off'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCamOn((c) => !c)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs ${
                  camOn
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-rose-400/40 bg-rose-500/20 text-rose-200'
                }`}
              >
                {camOn ? <Video size={14} /> : <VideoOff size={14} />}
                <span>{camOn ? 'Camera' : 'Camera Off'}</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoRoomApt(null)}
                className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium text-white hover:bg-rose-600"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SANCTUARY LOCATION MODAL */}
      {locationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-[#101014] text-white">
            <img
              src={SANCTUARY_IMAGE}
              alt="Aurelia Upper East Side Sanctuary"
              className="h-44 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#E2C285]">
                    Upper East Side Flagship
                  </p>
                  <h3 className="mt-1 text-lg font-medium">
                    780 Madison Avenue · Sanctuary Suites
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(false)}
                  className="rounded-full p-1 text-white/60 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Private porte-cochère valet on E 66th Street. Present your QR reference code at the biometric reception desk for direct escort to Suite 4A.
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(false)}
                  className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB REPORT PDF PREVIEW MODAL */}
      {previewLab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#101014] p-6 text-white">
            <div className="flex items-start justify-between border-b border-white/15 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                  Aurelia Clinical Laboratory · {previewLab.date}
                </p>
                <h3 className="mt-1 text-lg font-medium">{previewLab.title}</h3>
                <p className="text-xs text-white/60">
                  Patient: Elena Rostova · Ordered by {previewLab.orderedBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLab(null)}
                className="rounded-full p-1 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-white/80">
              {previewLab.summary}
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/15">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/10 text-white/70">
                  <tr>
                    <th className="px-3.5 py-2.5 font-medium">Assay</th>
                    <th className="px-3.5 py-2.5 font-medium">Result</th>
                    <th className="px-3.5 py-2.5 font-medium">Target</th>
                    <th className="px-3.5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {previewLab.markers.map((m) => (
                    <tr key={m.name} className="bg-black/30">
                      <td className="px-3.5 py-2.5 text-white">{m.name}</td>
                      <td className="px-3.5 py-2.5 tabular-nums font-medium text-white">
                        {m.result}
                      </td>
                      <td className="px-3.5 py-2.5 tabular-nums text-white/60">
                        {m.reference}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`text-[11px] font-medium ${
                            m.flag === 'Optimal'
                              ? 'text-emerald-300'
                              : m.flag === 'Borderline'
                              ? 'text-amber-300'
                              : 'text-white/60'
                          }`}
                        >
                          {m.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewLab(null)}
                className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
