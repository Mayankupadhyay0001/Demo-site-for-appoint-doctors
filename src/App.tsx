/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookingDrawer } from './components/BookingDrawer';
import { DoctorDashboard } from './components/DoctorDashboard';
import { Navbar } from './components/Navbar';
import { PatientDashboard } from './components/PatientDashboard';
import { PublicClinicView } from './components/PublicClinicView';
import { ScrollVideo } from './components/ScrollVideo';
import { UrgentCareModal } from './components/UrgentCareModal';
import { AureliaProvider, useAurelia } from './context/AureliaContext';

const AureliaShell: React.FC = () => {
  const { role } = useAurelia();

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <ScrollVideo dimmed={role !== 'public'} />

      <div className="relative z-10">
        <Navbar />
        <main>
          {role === 'public' && <PublicClinicView />}
          {role === 'patient' && <PatientDashboard />}
          {role === 'doctor' && <DoctorDashboard />}
        </main>
      </div>

      <BookingDrawer />
      <UrgentCareModal />
    </div>
  );
};

export default function App() {
  return (
    <AureliaProvider>
      <AureliaShell />
    </AureliaProvider>
  );
}
