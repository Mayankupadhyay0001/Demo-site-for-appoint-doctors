import React from 'react';
import { ChevronRight, PhoneCall, ShieldAlert, Video, X } from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';

export const UrgentCareModal: React.FC = () => {
  const {
    urgentCareOpen,
    setUrgentCareOpen,
    doctors,
    openBookingDrawer,
  } = useAurelia();

  if (!urgentCareOpen) return null;

  const urgentDoctors = doctors.filter((d) => d.urgentAvailable);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Same-Day Urgent Care Triage"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-[#101014]/95 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/15 text-amber-200">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-amber-200/80">
                Rapid Clinical Triage
              </p>
              <h3 className="text-xl font-normal tracking-tight text-white">
                Same-Day Urgent & Telehealth Access
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUrgentCareOpen(false)}
            aria-label="Close urgent care modal"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-xs text-rose-100 sm:flex-row sm:items-center">
          <p className="leading-relaxed">
            For acute chest pain, severe shortness of breath, or neurological emergency, call <strong>911</strong> or proceed to the nearest emergency department immediately.
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-300/30 bg-rose-500/20 px-3 py-1 font-medium tabular-nums">
            <PhoneCall size={12} />
            <span>24/7 Line: (212) 555-0194</span>
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/55">
            Physicians Holding Urgent Same-Day Slots
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {urgentDoctors.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.06] p-3.5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-white/60">
                      {doc.specialty} · {doc.nextAvailable}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openBookingDrawer(doc.id, 'HD Video Telehealth', 'Urgent Same-Day Triage')
                  }
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/85"
                >
                  <Video size={12} />
                  <span>Book</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
