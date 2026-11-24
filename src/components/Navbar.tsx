import React from 'react';
import { Hexagon, ShieldAlert } from 'lucide-react';
import { useAurelia } from '../context/AureliaContext';
import { RoleMode } from '../types/aurelia';

export const Navbar: React.FC = () => {
  const { role, setRole, setUrgentCareOpen, appointments } = useAurelia();

  const patientCount = appointments.filter(
    (a) => a.isPrimaryDemoPatient && a.status !== 'Cancelled'
  ).length;

  const roles: { id: RoleMode; label: string; shortLabel: string }[] = [
    { id: 'public', label: 'Public Clinic', shortLabel: 'Clinic' },
    { id: 'patient', label: `Patient (${patientCount})`, shortLabel: 'Patient' },
    { id: 'doctor', label: 'Doctor Workspace', shortLabel: 'Doctor' },
  ];

  const scrollToSection = (id: string) => {
    if (role !== 'public') {
      setRole('public');
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#0a0a0a]/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 md:px-12">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setRole('public')}
          className="flex shrink-0 items-center gap-2.5 text-left text-white transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-white"
        >
          <Hexagon size={22} strokeWidth={1.5} className="text-white" />
          <span className="text-lg font-medium tracking-tight sm:text-xl whitespace-nowrap">
            aurelia
          </span>
        </button>

        {/* Center Navigation */}
        <nav
          aria-label="Primary clinic sections"
          className="hidden items-center gap-7 lg:flex"
        >
          <button
            type="button"
            onClick={() => scrollToSection('specialists')}
            className="text-sm text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap shrink-0"
          >
            Specialists
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('matcher')}
            className="text-sm text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap shrink-0"
          >
            Treatments
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('membership')}
            className="text-sm text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap shrink-0"
          >
            Membership
          </button>
        </nav>

        {/* Right Controls: Urgent Care + Demo Role Switcher */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setUrgentCareOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors duration-300 hover:bg-amber-400/20 whitespace-nowrap shrink-0"
          >
            <ShieldAlert size={14} strokeWidth={1.75} />
            <span>Urgent Care</span>
          </button>

          <div
            role="tablist"
            aria-label="Demo Role Switcher"
            className="flex items-center rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md"
          >
            {roles.map((item) => {
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 sm:px-3.5 ${
                    active
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
