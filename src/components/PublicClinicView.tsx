import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';
import { SANCTUARY_IMAGE, SYMPTOM_CHIPS, UPCOMING_DATES } from '../data/initialData';
import { Doctor, VisitType } from '../types/aurelia';
import { Reveal } from './Reveal';

const CAPABILITIES = [
  {
    index: '01',
    title: 'Zero-wait sanctuary',
    body: 'Arrive directly to a private suite or join encrypted HD video within seconds of your scheduled minute.',
  },
  {
    index: '02',
    title: 'Biomarker continuity',
    body: 'Every blood panel, wearable HRV trend, and clinical note stays unified across your entire care team.',
  },
  {
    index: '03',
    title: 'Direct physician access',
    body: 'Message your specialist directly, request refills in one tap, and receive electronic lab orders immediately.',
  },
];

export const PublicClinicView: React.FC = () => {
  const { doctors, slotsByDoctor, openBookingDrawer, setRole } = useAurelia();

  // Hero quick search & directory filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedVisitMode, setSelectedVisitMode] = useState<'All' | VisitType>('All');
  const [selectedDate, setSelectedDate] = useState<string>(UPCOMING_DATES[0].full);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Symptom matcher state
  const [symptomQuery, setSymptomQuery] = useState('Persistent migraines & fatigue');

  const specialties = useMemo(
    () => ['All', ...Array.from(new Set(doctors.map((d) => d.specialty)))],
    [doctors]
  );

  const matchedDoctor = useMemo<{ doctor: Doctor; reason: string }>(() => {
    const query = symptomQuery.toLowerCase().trim();
    if (!query) {
      return {
        doctor: doctors[0],
        reason: 'Recommended baseline preventive cardiology & longevity evaluation.',
      };
    }

    let bestDoc = doctors[0];
    let bestScore = -1;
    let matchedHits: string[] = [];

    doctors.forEach((doc) => {
      const hits = doc.symptomKeywords.filter((kw) => query.includes(kw));
      const specialtyHit = query.includes(doc.specialty.toLowerCase()) ? 2 : 0;
      const score = hits.length * 2 + specialtyHit;
      if (score > bestScore) {
        bestScore = score;
        bestDoc = doc;
        matchedHits = hits;
      }
    });

    if (bestScore <= 0) {
      return {
        doctor: doctors[2],
        reason:
          'Matched with Longevity & Preventive Medicine for comprehensive multi-system symptom triage.',
      };
    }

    return {
      doctor: bestDoc,
      reason: `Matched on ${matchedHits.length > 0 ? matchedHits.join(', ') : bestDoc.specialty} clinical indicators.`,
    };
  }, [symptomQuery, doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      if (selectedSpecialty !== 'All' && doc.specialty !== selectedSpecialty) return false;
      if (selectedVisitMode !== 'All' && !doc.visitModes.includes(selectedVisitMode)) return false;
      if (urgentOnly && !doc.urgentAvailable) return false;
      return true;
    });
  }, [doctors, selectedSpecialty, selectedVisitMode, urgentOnly]);

  const getOpenSlotCount = (docId: string) =>
    (slotsByDoctor[docId] || []).filter((s) => !s.blocked).length;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    document.getElementById('specialists')?.scrollIntoView({ behavior: 'smooth' });
  };

  const leadDoctor = doctors[0];

  return (
    <div className="relative z-10 text-white">
      {/* SECTION ONE: HERO */}
      <section className="mx-auto flex min-h-screen supports-[height:100svh]:min-h-[100svh] max-w-[1440px] flex-col justify-between px-5 pt-24 pb-12 sm:px-8 sm:pt-28 md:px-12 md:pb-14">
        {/* Top Row: Services + Editorial Intro */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-2">
            {[
              '/ PREVENTIVE CARDIOLOGY',
              '/ PRECISION NEUROLOGY',
              '/ LONGEVITY DIAGNOSTICS',
            ].map((label, i) => (
              <Reveal key={label} delay={120 + i * 100}>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">
                  {label}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={250} className="max-w-xs sm:text-right">
            <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
              We design private medicine that brings clarity, zero-wait precision, and calm continuity to your longevity.
            </p>
          </Reveal>
        </div>

        {/* Center Quick-Search Bar */}
        <Reveal delay={320} className="my-8">
          <form
            onSubmit={handleQuickSearch}
            className="mx-auto flex w-full max-w-4xl flex-col gap-2.5 rounded-2xl border border-white/20 bg-white/12 p-2.5 backdrop-blur-xl shadow-2xl md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-black/30 px-3.5 py-2.5 border border-white/10">
              <Search size={16} className="shrink-0 text-white/60" />
              <select
                aria-label="Filter by specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none"
              >
                {specialties.map((sp) => (
                  <option key={sp} value={sp} className="bg-[#121216] text-white">
                    {sp === 'All' ? 'All Medical Specialties' : sp}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-black/30 px-3.5 py-2.5 border border-white/10">
              <Video size={16} className="shrink-0 text-white/60" />
              <select
                aria-label="Filter by visit type"
                value={selectedVisitMode}
                onChange={(e) => setSelectedVisitMode(e.target.value as 'All' | VisitType)}
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none"
              >
                <option value="All" className="bg-[#121216] text-white">
                  In-Person or HD Video
                </option>
                <option value="In-Person Sanctuary" className="bg-[#121216] text-white">
                  In-Person Sanctuary
                </option>
                <option value="HD Video Telehealth" className="bg-[#121216] text-white">
                  HD Video Telehealth
                </option>
              </select>
            </div>

            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-black/30 px-3.5 py-2.5 border border-white/10">
              <Calendar size={16} className="shrink-0 text-white/60" />
              <select
                aria-label="Select preferred date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none"
              >
                {UPCOMING_DATES.map((d) => (
                  <option key={d.full} value={d.full} className="bg-[#121216] text-white">
                    {d.label}, {d.dateStr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-medium text-black transition-colors duration-300 hover:bg-white/85 whitespace-nowrap"
            >
              <span>Find Slots</span>
              <ChevronRight size={15} />
            </button>
          </form>
        </Reveal>

        {/* Bottom Row: Headline + Glass Concierge Card */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal delay={150}>
              <div className="mb-5 inline-flex items-center gap-3 border-l-2 border-white bg-white/15 px-3.5 py-1.5 backdrop-blur-md">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
                  4.98 ★ Member Satisfaction · Zero Waiting Room
                </span>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <h1 className="max-w-3xl text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl text-balance">
                Precision Medicine,
                <br />
                Tailored to Your Time.
              </h1>
            </Reveal>
          </div>

          <Reveal delay={400}>
            <div className="flex items-center gap-4 rounded-xl border border-white/20 bg-white/15 p-3 backdrop-blur-md">
              <img
                src={leadDoctor.image}
                alt={leadDoctor.name}
                className="h-24 w-20 rounded-lg object-cover object-top"
              />
              <div className="flex flex-col gap-1 pr-2">
                <p className="text-sm font-medium text-white">
                  Consult {leadDoctor.name.split(',')[0]}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 tabular-nums">
                  Next: {leadDoctor.nextAvailable}
                </p>
                <button
                  type="button"
                  onClick={() => openBookingDrawer(leadDoctor.id)}
                  className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
                >
                  <span>Book 15-min call</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MID SPACER FOR VIDEO SCRUB */}
      <div
        className="flex h-[45vh] items-center justify-center px-5"
        aria-hidden="true"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
          Scroll to explore clinical intelligence
        </p>
      </div>

      {/* SECTION TWO: AI SYMPTOM MATCHER + FROSTED CAPABILITY PANEL */}
      <section
        id="matcher"
        className="mx-auto flex min-h-screen supports-[height:100svh]:min-h-[100svh] max-w-[1440px] flex-col justify-between px-5 pt-24 pb-16 sm:px-8 sm:pt-28 md:px-12"
      >
        {/* Top Row */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <Reveal delay={100}>
            <div className="inline-block border-l-2 border-white bg-white/15 px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
                Diagnostic Triage
              </span>
            </div>
          </Reveal>

          <Reveal delay={200} className="max-w-sm sm:text-right">
            <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
              Our intake doesn’t route you to a call center — it interprets your symptoms and pairs you directly with the right specialist.
            </p>
          </Reveal>
        </div>

        {/* Bottom Split */}
        <div className="mt-14 flex flex-col justify-between gap-12 lg:flex-row lg:items-end lg:gap-16">
          {/* Left: Symptom Matcher */}
          <div className="w-full max-w-xl">
            <Reveal delay={160}>
              <h2 className="text-4xl font-normal leading-[1.06] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl text-balance">
                Describe what you feel.
                <br />
                Meet your specialist.
              </h2>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                <label
                  htmlFor="symptom-matcher-input"
                  className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/70"
                >
                  <Sparkles size={13} className="text-[#E2C285]" />
                  <span>AI Symptom & Specialist Matcher</span>
                </label>

                <input
                  id="symptom-matcher-input"
                  type="text"
                  value={symptomQuery}
                  onChange={(e) => setSymptomQuery(e.target.value)}
                  placeholder="Describe symptoms, biomarkers, or goals..."
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white focus:outline-none"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {SYMPTOM_CHIPS.map((chip) => {
                    const active = symptomQuery === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSymptomQuery(chip)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                          active
                            ? 'border-white bg-white text-black font-medium'
                            : 'border-white/20 bg-white/[0.06] text-white/75 hover:bg-white/15 hover:text-white'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {/* Live Matched Specialist Result */}
                <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-white/15 bg-black/45 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={matchedDoctor.doctor.image}
                      alt={matchedDoctor.doctor.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover object-top"
                    />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-300">
                        Best Clinical Match · {matchedDoctor.doctor.specialty}
                      </p>
                      <p className="text-base font-medium text-white">
                        {matchedDoctor.doctor.name}
                      </p>
                      <p className="mt-0.5 text-xs text-white/65">
                        {matchedDoctor.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openBookingDrawer(
                        matchedDoctor.doctor.id,
                        null,
                        symptomQuery || undefined
                      )
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 whitespace-nowrap"
                  >
                    <span>Book {matchedDoctor.doctor.nextAvailable.split(',')[0]}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: NovaAI-style 3-Row Frosted Capability Panel */}
          <div className="w-full max-w-md space-y-5">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
              {CAPABILITIES.map((cap, i) => (
                <Reveal key={cap.index} delay={220 + i * 110}>
                  <div
                    className={`group flex gap-5 py-5 ${
                      i < CAPABILITIES.length - 1 ? 'border-b border-white/15' : ''
                    }`}
                  >
                    <span className="pt-1 font-mono text-[11px] tracking-[0.15em] text-white/55 tabular-nums">
                      {cap.index}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium text-white sm:text-lg">
                          {cap.title}
                        </h3>
                        <ChevronRight
                          size={16}
                          className="text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                        />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                        {cap.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={500}>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                <img
                  src={SANCTUARY_IMAGE}
                  alt="Aurelia Health Private Sanctuary Lounge"
                  className="h-36 w-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-white">
                      Upper East Side Sanctuary
                    </p>
                    <p className="text-[11px] text-white/65">
                      Private Arrival · Express Diagnostics
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBookingDrawer(leadDoctor.id, 'In-Person Sanctuary')}
                    className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25"
                  >
                    Reserve Suite
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION THREE: FEATURED SPECIALISTS DIRECTORY */}
      <section
        id="specialists"
        className="mx-auto max-w-[1440px] border-t border-white/15 px-5 py-20 sm:px-8 md:px-12"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">
                Clinical Faculty
              </p>
              <h2 className="mt-2 text-3xl font-normal tracking-tight text-white sm:text-5xl text-balance">
                Board-certified specialists,
                <br />
                available on your cadence.
              </h2>
            </Reveal>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {specialties.map((sp) => {
              const active = selectedSpecialty === sp;
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSelectedSpecialty(sp)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200 whitespace-nowrap ${
                    active
                      ? 'border-white bg-white text-black font-medium'
                      : 'border-white/20 bg-white/[0.07] text-white/75 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {sp}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setUrgentOnly((u) => !u)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-200 whitespace-nowrap ${
                urgentOnly
                  ? 'border-amber-300/60 bg-amber-400/20 text-amber-100 font-medium'
                  : 'border-white/20 bg-white/[0.07] text-white/75 hover:bg-white/15'
              }`}
            >
              Same-Day Urgent
            </button>
          </div>
        </div>

        {/* 6 Specialist Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc, idx) => {
            const openSlots = getOpenSlotCount(doc.id);
            return (
              <Reveal key={doc.id} delay={80 + idx * 70}>
                <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.12]">
                  <div>
                    <div className="relative h-60 overflow-hidden bg-black/40">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs text-white/90">
                        <span className="font-mono uppercase tracking-[0.12em] text-white/80">
                          {doc.specialty}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star size={12} className="fill-[#E2C285] text-[#E2C285]" />
                          {doc.rating.toFixed(2)} ({doc.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="px-5 pt-4 pb-5">
                      <h3 className="text-lg font-medium text-white">{doc.name}</h3>
                      <p className="mt-0.5 text-xs text-white/60">
                        {doc.credentials} · {doc.experienceYears} yrs experience
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-white/75">
                        {doc.bio}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/65">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={13} />
                          {doc.visitModes.includes('In-Person Sanctuary') ? 'Sanctuary' : 'Video Only'}
                        </span>
                        {doc.visitModes.includes('HD Video Telehealth') && (
                          <span className="inline-flex items-center gap-1.5">
                            <Video size={13} />
                            HD Video
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-emerald-300 tabular-nums">
                          <Clock size={13} />
                          {openSlots} open slots
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                        Next · {doc.nextAvailable}
                      </p>
                      <p className="text-base font-medium tabular-nums text-white">
                        ${doc.fee}
                        <span className="text-xs font-normal text-white/55"> / consult</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openBookingDrawer(
                          doc.id,
                          selectedVisitMode === 'All' ? null : selectedVisitMode
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
                    >
                      <span>Book Now</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.07] p-8 text-center">
            <p className="text-sm text-white/75">
              No specialists match the current filter combination.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSpecialty('All');
                setSelectedVisitMode('All');
                setUrgentOnly(false);
              }}
              className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-medium text-black"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* SECTION FOUR: CONCIERGE MEMBERSHIP & TRUST METRICS */}
      <section
        id="membership"
        className="mx-auto max-w-[1440px] border-t border-white/15 px-5 py-20 sm:px-8 md:px-12"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#E2C285]">
                Private Membership
              </p>
              <h2 className="mt-2 text-3xl font-normal tracking-tight text-white sm:text-4xl text-balance">
                A clinical relationship built for continuity, not episodic visits.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Choose targeted specialist consultations on demand, or enroll in Aurelia Private for year-round biomarker tracking, same-day urgent access, and direct physician messaging.
              </p>
            </Reveal>

            {/* Trust Standards */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-2xl font-medium tabular-nums text-white">0 min</p>
                <p className="mt-1 text-xs text-white/60">Average sanctuary wait time</p>
              </div>
              <div>
                <p className="text-2xl font-medium tabular-nums text-white">120+</p>
                <p className="mt-1 text-xs text-white/60">Annual longevity biomarkers</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <ShieldCheck size={15} className="text-emerald-300 shrink-0" />
                <span>HIPAA Encrypted Vault</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <ShieldCheck size={15} className="text-emerald-300 shrink-0" />
                <span>ISO 27001 Clinical Ops</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {/* Pay Per Visit */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-xl">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Pay-Per-Visit
                </p>
                <p className="mt-3 text-3xl font-normal tabular-nums text-white">
                  $360–$450
                  <span className="text-xs text-white/55"> / consultation</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/65">
                  Ideal for targeted specialist diagnostics, second opinions, and individual treatment plans.
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-xs text-white/80">
                  <li>45-minute unhurried physician consultation</li>
                  <li>Sanctuary suite or encrypted HD Video</li>
                  <li>Electronic prescriptions & lab requisitions</li>
                  <li>14-day follow-up portal messaging</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => openBookingDrawer(leadDoctor.id)}
                className="mt-8 w-full rounded-full border border-white/25 bg-white/10 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                Book Single Consultation
              </button>
            </div>

            {/* Aurelia Private Membership */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#C5A059]/45 bg-white/[0.11] p-6 backdrop-blur-xl">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#E2C285]">
                  Aurelia Private Membership
                </p>
                <p className="mt-3 text-3xl font-normal tabular-nums text-white">
                  $350
                  <span className="text-xs text-white/60"> / month</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  Full-spectrum longevity medicine with a dedicated lead physician and 24/7 care coordinator.
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-xs text-white/90">
                  <li>2× annual 120-biomarker longevity blood panels</li>
                  <li>Same-day urgent video & sanctuary suite priority</li>
                  <li>Unlimited direct messaging with your care team</li>
                  <li>Continuous wearable HRV & metabolic synthesis</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setRole('patient')}
                className="mt-8 w-full rounded-full bg-white py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
              >
                Preview Member Portal
              </button>
            </div>
          </div>
        </div>

        {/* Attributable Member Outcomes */}
        <div className="mt-14 grid gap-6 border-t border-white/15 pt-10 md:grid-cols-2">
          <blockquote className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md">
            <p className="text-sm leading-relaxed text-white/85">
              “Within 48 hours of booking through Aurelia, Dr. Vance correlated my wearable HRV drop with an underlying ApoB and thyroid shift that two conventional clinics missed.”
            </p>
            <footer className="mt-4 text-xs text-white/55">
              Elena Rostova · Private Member since 2025 · Managing Partner, Veridian Capital
            </footer>
          </blockquote>

          <blockquote className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md">
            <p className="text-sm leading-relaxed text-white/85">
              “No waiting rooms, no clipped ten-minute handoffs. Having my neurologist and cardiologist share one continuous biomarker dossier transformed how I manage travel recovery.”
            </p>
            <footer className="mt-4 text-xs text-white/55">
              Henrik Lindqvist · Private Member · Architectural Principal, Studio Nord
            </footer>
          </blockquote>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="border-t border-white/15 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-5 py-8 text-xs text-white/55 sm:flex-row sm:items-center sm:px-8 md:px-12">
          <p>Aurelia Health · 780 Madison Avenue, Sanctuary Suites · New York</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className="hover:text-white transition-colors"
            >
              Patient Portal
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className="hover:text-white transition-colors"
            >
              Physician Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
