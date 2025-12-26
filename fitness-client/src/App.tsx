import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { AuthPage } from './pages/AuthPage';
import { GymsPage } from './pages/GymsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { BookingsPage } from './pages/BookingsPage';
import { NewBookingPage } from './pages/NewBookingPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CoachesPage } from './pages/CoachesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/gyms" element={<GymsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/new-booking" element={<NewBookingPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/coaches" element={<CoachesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
