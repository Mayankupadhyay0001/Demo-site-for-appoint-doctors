import React, { useState } from 'react';
import {
  Building2,
  CalendarClock,
  Check,
  ClipboardList,
  FlaskConical,
  MessageSquare,
  Pill,
  Send,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';
import { AppointmentStatus, SoapNote } from '../types/aurelia';

type DoctorTab = 'schedule' | 'slots' | 'messages';

export const DoctorDashboard: React.FC = () => {
  const {
    doctors,
    appointments,
    prescriptions,
    labReports,
    slotsByDoctor,
    soapNotes,
    messages,
    updateAppointmentStatus,
    saveSoapNote,
    issuePrescription,
    orderLabPanel,
    sendCareMessage,
    toggleSlotBlocked,
    toggleSlotMode,
    openUrgentEveningSlot,
  } = useAurelia();

  const leadDoctor = doctors[0]; // Dr. Julian Vance, MD
  const doctorSlots = slotsByDoctor[leadDoctor.id] || [];

  const [activeTab, setActiveTab] = useState<DoctorTab>('schedule');
  const [selectedAptId, setSelectedAptId] = useState<string>('apt-103');

  const todayQueue = appointments.filter((a) => a.status !== 'Cancelled');
  const selectedApt =
    todayQueue.find((a) => a.id === selectedAptId) || todayQueue[0] || null;

  const [draftSoap, setDraftSoap] = useState<SoapNote | null>(null);
  const activeSoap: SoapNote | null = selectedApt
    ? draftSoap && draftSoap.appointmentId === selectedApt.id
      ? draftSoap
      : soapNotes[selectedApt.id] || {
          appointmentId: selectedApt.id,
          patientName: selectedApt.patientName,
          allergies: 'No Known Drug Allergies',
          vitals: { bp: '118/76 mmHg', hr: '64 bpm', temp: '98.5 °F', spo2: '99%' },
          subjective: `Presenting with: ${selectedApt.symptoms.join(', ')}.`,
          objective: 'Alert, well-perfused, normal cardiopulmonary exam.',
          assessment: 'Clinical evaluation in progress.',
          plan: 'Continue diagnostic monitoring and review follow-up labs.',
        }
    : null;

  // E-Prescription & Lab Order state
  const [orderTab, setOrderTab] = useState<'rx' | 'lab'>('rx');
  const [rxMed, setRxMed] = useState('Rosuvastatin Calcium');
  const [rxDose, setRxDose] = useState('5 mg');
  const [rxFreq, setRxFreq] = useState('Once daily at bedtime');
  const [labTitle, setLabTitle] = useState('Comprehensive ApoB & Lp(a) Follow-Up');
  const [labNotes, setLabNotes] = useState('Fasting morning draw at Sanctuary Suite 4A.');
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);
  const [soapSavedBanner, setSoapSavedBanner] = useState<string | null>(null);

  const [docChatInput, setDocChatInput] = useState('');

  const selectPatient = (aptId: string) => {
    setSelectedAptId(aptId);
    setDraftSoap(null);
    setSoapSavedBanner(null);
  };

  const handleAiSummarize = () => {
    if (!activeSoap || !selectedApt) return;
    const summaryNote: SoapNote = {
      ...activeSoap,
      subjective: `${selectedApt.patientName} (${selectedApt.patientAge}yo) presents via ${selectedApt.visitType} for ${selectedApt.symptoms.join(', ')}.${selectedApt.notes ? ` Reported: ${selectedApt.notes}` : ''}`,
      objective: `Vitals ${activeSoap.vitals.bp}, HR ${activeSoap.vitals.hr}, SpO2 ${activeSoap.vitals.spo2}.${selectedApt.uploadedFileName ? ` Reviewed uploaded file (${selectedApt.uploadedFileName}).` : ''}`,
      assessment: `Primary focus: ${selectedApt.symptoms[0] || selectedApt.specialty}. Hemodynamically stable with favorable autonomic trends.`,
      plan: `1. Finalize targeted biomarker verification.\n2. Issue updated electronic regimen & 14-day wearable check-in.`,
    };
    setDraftSoap(summaryNote);
  };

  const handleSaveSoap = () => {
    if (!activeSoap) return;
    saveSoapNote(activeSoap);
    setSoapSavedBanner('SOAP note signed & synchronized with patient dossier.');
    window.setTimeout(() => setSoapSavedBanner(null), 3000);
  };

  const handleIssueOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderTab === 'rx') {
      if (!rxMed.trim()) return;
      issuePrescription({ medication: rxMed, dosage: rxDose, frequency: rxFreq });
      setOrderFeedback(`Sent ${rxMed} (${rxDose}) to Patient Portal.`);
    } else {
      if (!labTitle.trim()) return;
      orderLabPanel({ title: labTitle, notes: labNotes });
      setOrderFeedback(`Ordered ${labTitle} — visible in Patient Portal.`);
    }
    window.setTimeout(() => setOrderFeedback(null), 3500);
  };

  const telehealthCount = todayQueue.filter(
    (a) => a.visitType === 'HD Video Telehealth'
  ).length;
  const refillRequestsCount = prescriptions.filter(
    (r) => r.status === 'Refill Requested'
  ).length;
  const pendingLabsCount =
    labReports.filter((l) => l.status !== 'Ready').length + 2;

  const statusStyles: Record<AppointmentStatus, string> = {
    'Checked In': 'border-emerald-300/35 bg-emerald-400/15 text-emerald-200',
    'In Consultation': 'border-[#C5A059]/45 bg-[#C5A059]/20 text-[#E2C285]',
    'Telehealth Ready': 'border-sky-300/35 bg-sky-400/15 text-sky-200',
    Upcoming: 'border-white/20 bg-white/10 text-white/75',
    Completed: 'border-white/15 bg-white/5 text-white/50',
    Cancelled: 'border-rose-400/30 bg-rose-500/15 text-rose-200',
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-24 pb-16 text-white sm:px-8 sm:pt-28 md:px-12">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Clinical Sidebar */}
        <aside className="rounded-2xl border border-white/15 bg-[#0f172a]/70 p-5 backdrop-blur-2xl lg:col-span-3 lg:self-start">
          <div className="flex items-center gap-3.5 border-b border-white/15 pb-5">
            <img
              src={leadDoctor.image}
              alt={leadDoctor.name}
              className="h-14 w-14 rounded-xl object-cover object-top border border-white/20"
            />
            <div>
              <p className="text-sm font-medium text-white">{leadDoctor.name}</p>
              <p className="text-xs text-white/65">Chief of Cardiology</p>
              <p className="mt-0.5 text-[11px] text-[#E2C285]">Sanctuary Suite 4A</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5" aria-label="Doctor workspace sections">
            {[
              { id: 'schedule' as DoctorTab, label: 'Daily Schedule & Chart', icon: Stethoscope },
              { id: 'slots' as DoctorTab, label: 'Availability & Slots', icon: CalendarClock },
              { id: 'messages' as DoctorTab, label: 'Patient Messages', icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white text-black'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'messages' && refillRequestsCount > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] tabular-nums ${
                        active ? 'bg-black text-white' : 'bg-amber-400/20 text-amber-200'
                      }`}
                    >
                      {refillRequestsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Refill Alert Box */}
          {refillRequestsCount > 0 && (
            <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3.5 text-xs">
              <p className="font-medium text-amber-200">
                {refillRequestsCount} Pending Refill Request
              </p>
              <p className="mt-1 text-white/70">
                Elena Rostova requested an electronic refill from the Patient Portal.
              </p>
            </div>
          )}
        </aside>

        {/* Main Workspace Content */}
        <div className="space-y-6 lg:col-span-9">
          {/* Daily KPI Strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Today’s Queue
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {todayQueue.length}
              </p>
              <p className="mt-0.5 text-xs text-white/55">Patients scheduled</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Pending Labs
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {pendingLabsCount}
              </p>
              <p className="mt-0.5 text-xs text-amber-200">Assays awaiting sign-off</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Telehealth Queue
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                {telehealthCount}
              </p>
              <p className="mt-0.5 text-xs text-sky-200">HD video consults</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                Satisfaction
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums text-white">
                4.99 ★
              </p>
              <p className="mt-0.5 text-xs text-emerald-300">312 verified reviews</p>
            </div>
          </div>

          {activeTab === 'schedule' && (
            <div className="grid gap-6 xl:grid-cols-12">
              {/* Interactive Daily Schedule & Queue */}
              <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl xl:col-span-5">
                <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                      Chronological Queue
                    </p>
                    <h2 className="mt-0.5 text-lg font-normal text-white">
                      Today’s Schedule
                    </h2>
                  </div>
                  <span className="text-xs tabular-nums text-white/60">
                    Nov 24
                  </span>
                </div>

                <div className="mt-4 max-h-[640px] space-y-2.5 overflow-y-auto pr-1">
                  {todayQueue.map((apt) => {
                    const selected = selectedApt?.id === apt.id;
                    const isVideo = apt.visitType === 'HD Video Telehealth';
                    return (
                      <div
                        key={apt.id}
                        onClick={() => selectPatient(apt.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                          selected
                            ? 'border-white bg-white/15'
                            : 'border-white/12 bg-black/35 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-white">
                            {isVideo ? (
                              <Video size={13} className="text-sky-300" />
                            ) : (
                              <Building2 size={13} className="text-white/70" />
                            )}
                            {apt.time}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                              statusStyles[apt.status]
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm font-medium text-white">
                          {apt.patientName}
                          <span className="ml-1.5 text-xs font-normal text-white/55">
                            · {apt.referenceCode}
                          </span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-white/65">
                          {apt.symptoms.join(', ')}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectPatient(apt.id);
                              updateAppointmentStatus(apt.id, 'In Consultation');
                            }}
                            className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black hover:bg-white/85"
                          >
                            Start Consult
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectPatient(apt.id);
                            }}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                          >
                            Open Chart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Live Consultation & SOAP Note + E-Rx Builder */}
              <section className="space-y-5 xl:col-span-7">
                {selectedApt && activeSoap && (
                  <>
                    {/* Patient Clinical Summary */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/15 pb-4">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#E2C285]">
                            Active Patient Chart · {selectedApt.referenceCode}
                          </p>
                          <h3 className="mt-1 text-xl font-normal text-white">
                            {selectedApt.patientName}
                            <span className="ml-2 text-sm text-white/60">
                              {selectedApt.patientAge} yrs · {selectedApt.insuranceProvider}
                            </span>
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(selectedApt.id, 'Completed')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/35 bg-emerald-400/15 px-3.5 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-400/25"
                        >
                          <Check size={13} />
                          <span>Complete Visit</span>
                        </button>
                      </div>

                      {/* Vitals + Allergies */}
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-black/35 p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/50">
                            BP
                          </span>
                          <p className="text-sm font-medium tabular-nums text-white">
                            {activeSoap.vitals.bp}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/35 p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/50">
                            Heart Rate
                          </span>
                          <p className="text-sm font-medium tabular-nums text-white">
                            {activeSoap.vitals.hr}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/35 p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/50">
                            SpO2
                          </span>
                          <p className="text-sm font-medium tabular-nums text-white">
                            {activeSoap.vitals.spo2}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/35 p-2.5">
                          <span className="text-[10px] uppercase tracking-wider text-white/50">
                            Allergies
                          </span>
                          <p className="truncate text-xs font-medium text-amber-200">
                            {activeSoap.allergies}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-white/75">
                        <span className="text-white/50">Pre-visit symptoms: </span>
                        {selectedApt.symptoms.join(' · ')}
                        {selectedApt.uploadedFileName && (
                          <span className="ml-2 text-emerald-300">
                            · Attachment: {selectedApt.uploadedFileName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive SOAP Note Editor */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={16} className="text-white/70" />
                          <h4 className="text-base font-medium text-white">
                            SOAP Clinical Note
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAiSummarize}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A059]/45 bg-[#C5A059]/15 px-3 py-1.5 text-xs font-medium text-[#E2C285] transition-colors hover:bg-[#C5A059]/25"
                          >
                            <Sparkles size={13} />
                            <span>AI Auto-Summarize</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSoap}
                            className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>

                      {soapSavedBanner && (
                        <p className="mt-2 text-xs text-emerald-300">{soapSavedBanner}</p>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            ['subjective', 'Subjective'],
                            ['objective', 'Objective'],
                            ['assessment', 'Assessment'],
                            ['plan', 'Plan'],
                          ] as const
                        ).map(([field, label]) => (
                          <div key={field}>
                            <label className="mb-1 block text-[11px] uppercase tracking-[0.15em] text-white/55">
                              {label}
                            </label>
                            <textarea
                              rows={3}
                              value={activeSoap[field]}
                              onChange={(e) =>
                                setDraftSoap({
                                  ...activeSoap,
                                  [field]: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs leading-relaxed text-white focus:border-white focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* E-Prescription & Lab Order Builder */}
                    <form
                      onSubmit={handleIssueOrder}
                      className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/35 p-1">
                          <button
                            type="button"
                            onClick={() => setOrderTab('rx')}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${
                              orderTab === 'rx'
                                ? 'bg-white text-black'
                                : 'text-white/70 hover:text-white'
                            }`}
                          >
                            <Pill size={13} />
                            <span>E-Prescription</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderTab('lab')}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${
                              orderTab === 'lab'
                                ? 'bg-white text-black'
                                : 'text-white/70 hover:text-white'
                            }`}
                          >
                            <FlaskConical size={13} />
                            <span>Order Lab Panel</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
                        >
                          {orderTab === 'rx' ? 'Transmit e-Rx' : 'Submit Lab Order'}
                        </button>
                      </div>

                      {orderFeedback && (
                        <p className="mt-3 text-xs text-emerald-300">{orderFeedback}</p>
                      )}

                      {orderTab === 'rx' ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <input
                            type="text"
                            value={rxMed}
                            onChange={(e) => setRxMed(e.target.value)}
                            placeholder="Medication name"
                            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={rxDose}
                            onChange={(e) => setRxDose(e.target.value)}
                            placeholder="Dosage (e.g. 5 mg)"
                            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={rxFreq}
                            onChange={(e) => setRxFreq(e.target.value)}
                            placeholder="Frequency"
                            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            value={labTitle}
                            onChange={(e) => setLabTitle(e.target.value)}
                            placeholder="Blood panel title"
                            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={labNotes}
                            onChange={(e) => setLabNotes(e.target.value)}
                            placeholder="Phlebotomy instructions"
                            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                          />
                        </div>
                      )}
                    </form>
                  </>
                )}
              </section>
            </div>
          )}

          {activeTab === 'slots' && (
            <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                    Live Schedule Sync
                  </p>
                  <h2 className="mt-1 text-xl font-normal text-white">
                    Availability & Slot Manager
                  </h2>
                  <p className="mt-1 text-xs text-white/65">
                    Changes made here immediately update open slots in the Public Clinic booking drawer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openUrgentEveningSlot(leadDoctor.id)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-white/85"
                >
                  + Open Urgent 07:15 PM Slot
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {doctorSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      slot.blocked
                        ? 'border-white/10 bg-black/40 opacity-65'
                        : 'border-white/20 bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium tabular-nums text-white">
                        {slot.time}
                      </span>
                      <span className="text-[11px] text-white/55">{slot.period}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/70">{slot.mode}</p>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => toggleSlotMode(leadDoctor.id, slot.id)}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                      >
                        Switch Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSlotBlocked(leadDoctor.id, slot.id)}
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          slot.blocked
                            ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                            : 'bg-rose-500/15 text-rose-200 border border-rose-400/30'
                        }`}
                      >
                        {slot.blocked ? 'Unblock Slot' : 'Block Break'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'messages' && (
            <section className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-xl">
              <div className="border-b border-white/15 pb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                  Synchronized Care Thread
                </p>
                <h2 className="mt-1 text-xl font-normal text-white">
                  Direct Thread — Elena Rostova
                </h2>
              </div>

              <div className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-2">
                {messages.map((msg) => {
                  const isDoc = msg.sender === 'doctor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDoc ? 'items-end' : 'items-start'}`}
                    >
                      <span className="mb-1 text-[11px] text-white/50">
                        {msg.senderName} · {msg.timestamp}
                      </span>
                      <div
                        className={`max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isDoc
                            ? 'bg-white text-black'
                            : 'border border-white/15 bg-black/40 text-white/90'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!docChatInput.trim()) return;
                  sendCareMessage('doctor', docChatInput.trim());
                  setDocChatInput('');
                }}
                className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4"
              >
                <input
                  type="text"
                  value={docChatInput}
                  onChange={(e) => setDocChatInput(e.target.value)}
                  placeholder="Reply to Elena Rostova (updates Patient Portal live)..."
                  className="flex-1 rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black hover:bg-white/85"
                >
                  <Send size={13} />
                  <span>Send Reply</span>
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
