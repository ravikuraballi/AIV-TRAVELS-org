/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Navbar } from './components/Navbar';
import { VerificationNotice } from './components/VerificationNotice';
import { Footer } from './components/Footer';
import { BookingFormModal } from './components/BookingFormModal';
import { PackageModal } from './components/PackageModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';

import { HomeView } from './views/HomeView';
import { CabBookingView } from './views/CabBookingView';
import { VehiclesView } from './views/VehiclesView';
import { AirportOutstationView } from './views/AirportOutstationView';
import { PackagesView } from './views/PackagesView';
import { AboutContactView } from './views/AboutContactView';
import { TrackBookingView } from './views/TrackBookingView';
import { AdminDashboardView } from './views/AdminDashboardView';

import { TravelStore } from './services/storage';
import { BusinessProfile, TravelPackage, TripType, Vehicle, Booking } from './types/travel';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [business, setBusiness] = useState<BusinessProfile>(() => TravelStore.getBusinessProfile());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => TravelStore.getVehicles());
  const [packages, setPackages] = useState<TravelPackage[]>(() => TravelStore.getPackages());

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTripType, setBookingTripType] = useState<TripType>('oneway');
  const [bookingVehicleId, setBookingVehicleId] = useState<string | undefined>(undefined);
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<TravelPackage | null>(null);

  // Poll/refresh storage state on tab switches
  useEffect(() => {
    setBusiness(TravelStore.getBusinessProfile());
    setVehicles(TravelStore.getVehicles());
    setPackages(TravelStore.getPackages());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleOpenBooking = (tripType: TripType = 'oneway', vehicleId?: string) => {
    setBookingTripType(tripType);
    setBookingVehicleId(vehicleId);
    setIsBookingModalOpen(true);
  };

  const handleOpenPackageModal = (pkg: TravelPackage) => {
    setSelectedPackageForModal(pkg);
  };

  const handleBookPackageNow = (pkg: TravelPackage) => {
    setBookingTripType('roundtrip');
    setIsBookingModalOpen(true);
  };

  const handleBookingCreated = (newBooking: Booking) => {
    // Optionally switch to track booking view
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* 0. Android Mobile App Install Quick Banner */}
      <AndroidInstallBanner />

      {/* 1. Verification Notice Header */}
      <VerificationNotice
        business={business}
        onOpenAdmin={() => setCurrentTab('admin')}
      />

      {/* 2. Top Navigation Bar (Strict 3-zone Top Bar Contract) */}
      <Navbar
        business={business}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onBookNow={() => handleOpenBooking('oneway')}
      />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentTab === 'home' && (
          <HomeView
            business={business}
            vehicles={vehicles}
            packages={packages}
            onOpenBooking={handleOpenBooking}
            onOpenPackage={handleOpenPackageModal}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'cab-booking' && (
          <CabBookingView
            onOpenBookingModal={handleOpenBooking}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesView
            onSelectVehicleForBooking={(vehId) => handleOpenBooking('oneway', vehId)}
          />
        )}

        {currentTab === 'airport-outstation' && (
          <AirportOutstationView
            onOpenBookingModal={handleOpenBooking}
          />
        )}

        {currentTab === 'packages' && (
          <PackagesView
            onOpenPackageModal={handleOpenPackageModal}
          />
        )}

        {currentTab === 'about-contact' && (
          <AboutContactView
            business={business}
          />
        )}

        {currentTab === 'track-booking' && (
          <TrackBookingView />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* 4. Global Modals */}
      <BookingFormModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialTripType={bookingTripType}
        initialVehicleId={bookingVehicleId}
        onBookingCreated={handleBookingCreated}
      />

      <PackageModal
        packageData={selectedPackageForModal}
        isOpen={!!selectedPackageForModal}
        onClose={() => setSelectedPackageForModal(null)}
        onBookNow={handleBookPackageNow}
      />

      {/* 5. Quiet Domain Footer */}
      <Footer
        business={business}
        onSelectTab={setCurrentTab}
      />

      {/* 6. Native Android Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onBookNow={() => handleOpenBooking('oneway')}
        business={business}
      />
    </div>
  );
}
