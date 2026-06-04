import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public pages
const HomePage = lazy(() => import("./pages/public/HomePage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const DarshanPage = lazy(() => import("./pages/public/DarshanPage"));
const BookPage = lazy(() => import("./pages/public/BookPage"));
const DonationPage = lazy(() => import("./pages/public/DonationPage"));
const RoomsPage = lazy(() => import("./pages/public/RoomsPage"));
const EventsPage = lazy(() => import("./pages/public/EventsPage"));
const MediaPage = lazy(() => import("./pages/public/MediaPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminRooms = lazy(() => import("./pages/admin/AdminRooms"));
const AdminDonations = lazy(() => import("./pages/admin/AdminDonations"));
const AdminAccounts = lazy(() => import("./pages/admin/AdminAccounts"));
const AdminDevotees = lazy(() => import("./pages/admin/AdminDevotees"));
const AdminDevoteeProfile = lazy(() => import("./pages/admin/AdminDevoteeProfile"));
const AdminCommunication = lazy(() => import("./pages/admin/AdminCommunication"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl animate-pulse">🛕</span>
        <p className="text-sm font-semibold text-[#8a2e13] animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="darshan" element={<DarshanPage />} />
            <Route path="book" element={<BookPage />} />
            <Route path="donate" element={<DonationPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="donations" element={<AdminDonations />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="devotees" element={<AdminDevotees />} />
            <Route path="devotees/:id" element={<AdminDevoteeProfile />} />
            <Route path="communication" element={<AdminCommunication />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
