import React, { useState } from 'react';
import { 
  Search, 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Clock3, 
  UserCheck, 
  AlertTriangle, 
  Car, 
  FileText, 
  Share2,
  XCircle,
  HelpCircle,
  Map as MapIcon,
  Database
} from 'lucide-react';
import { Booking, BookingStatus } from '../types/travel';
import { TravelStore } from '../services/storage';
import { RouteMap } from '../components/RouteMap';
import { SUPABASE_PROJECT_ID } from '../services/supabase';

export const TrackBookingView: React.FC = () => {
  const [refInput, setRefInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const business = TravelStore.getBusinessProfile();
  const drivers = TravelStore.getDrivers();
  const vehicles = TravelStore.getVehicles();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNote(null);
    setHasSearched(true);

    if (!refInput.trim()) {
      setErrorMsg('Please enter a booking reference ID.');
      return;
    }

    const booking = TravelStore.getBookingByReferenceAndPhone(refInput, phoneInput);
    if (!booking) {
      setSearchResult(null);
      setErrorMsg('No booking found matching this reference. Please check your Booking ID or contact customer support.');
    } else {
      setSearchResult(booking);
    }
  };

  const handleCancelBooking = () => {
    if (!searchResult) return;
    const updated = TravelStore.updateBookingStatus(
      searchResult.id,
      'Cancelled',
      `Customer requested cancellation: ${cancelReason || 'Personal reasons'}`,
      'Customer'
    );
    if (updated) {
      setSearchResult(updated);
      setSuccessNote('Booking cancellation request recorded. Our representative will contact you regarding refund or schedule release.');
    }
    setCancelModalOpen(false);
    setCancelReason('');
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        );
      case 'Confirmed':
        return (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trip Confirmed
          </span>
        );
      case 'Driver Assigned':
        return (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Driver Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  const assignedDriver = searchResult?.driverId ? drivers.find(d => d.id === searchResult.driverId) : null;
  const assignedVehicle = searchResult?.vehicleId ? vehicles.find(v => v.id === searchResult.vehicleId) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900">
          Track Your Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Enter your unique booking reference (e.g., AIV-2026-1042) to check your trip status, assigned vehicle, and chauffeur details.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Booking Reference ID *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. AIV-2026-1042"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2.5 text-xs font-mono uppercase tracking-wider border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Registered Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. 9886041230"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Demo ID: <button type="button" onClick={() => setRefInput('AIV-2026-1042')} className="text-amber-600 underline font-mono">AIV-2026-1042</button>
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Booking</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNote && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successNote}</span>
          </div>
        )}
      </div>

      {/* Result Display */}
      {searchResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Booking Reference</span>
                <span className="text-base font-bold font-mono tracking-wider text-amber-400">
                  {searchResult.id}
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-1">
                {searchResult.customerName}
              </h2>
            </div>
            <div className="shrink-0">
              {getStatusBadge(searchResult.status)}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-6">
            {/* Interactive Journey Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Interactive Route & Live Chauffeur Position</span>
                </h3>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Synced with Supabase</span>
                </span>
              </div>
              <RouteMap
                pickupLocation={searchResult.pickupLocation}
                dropLocation={searchResult.dropLocation}
                estimatedKm={searchResult.estimatedDistanceKm}
                estimatedHours={searchResult.estimatedDurationHours}
                trackingStatus={searchResult.status}
                driverName={assignedDriver?.name}
                carRegistration={assignedVehicle?.registrationNumber}
                heightClass="h-72 sm:h-80"
              />
            </div>

            {/* Status Timeline */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
                Status History & Progression
              </h3>
              <div className="space-y-3">
                {searchResult.statusHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-4 py-1 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -left-[5px] top-1.5 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{item.status}</span>
                        <span className="text-slate-400 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Route & Schedule
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Pickup Location</span>
                      <span className="font-medium text-slate-900">{searchResult.pickupLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Drop Location</span>
                      <span className="font-medium text-slate-900">{searchResult.dropLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block">Pickup Date & Time</span>
                      <span className="font-medium text-slate-900">{searchResult.pickupDate} at {searchResult.pickupTime}</span>
                    </div>
                  </div>
                  {searchResult.flightNumber && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="text-slate-400 block">Flight Details</span>
                        <span className="font-medium text-slate-900">Flight #{searchResult.flightNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle & Chauffeur */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Vehicle & Chauffeur
                </h3>
                {assignedDriver ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{assignedDriver.name}</span>
                      <span className="text-amber-600 font-medium">★ {assignedDriver.rating}</span>
                    </div>
                    <div className="text-slate-600">
                      Phone: <a href={`tel:${assignedDriver.phone}`} className="text-blue-600 underline font-medium">{assignedDriver.phone}</a>
                    </div>
                    {assignedVehicle && (
                      <div className="text-slate-600">
                        Vehicle: {assignedVehicle.name} ({assignedVehicle.registrationNumber || 'Registration Pending'})
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                    Chauffeur assignment is in progress. Driver details will be sent via SMS / WhatsApp prior to pickup.
                  </div>
                )}

                {/* Fare Summary */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Status</span>
                    <span className="capitalize text-amber-400 font-medium">{searchResult.paymentStatus.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total Fare</span>
                    <span className="font-mono text-amber-400">₹{searchResult.totalFare}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${business.whatsapp}?text=Hello%20AIV%20Travels,%20I%20am%20enquiring%20about%20my%20booking%20reference%20${searchResult.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Contact AIV Support on WhatsApp
              </a>

              {searchResult.status !== 'Cancelled' && searchResult.status !== 'Completed' && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                  Request Trip Cancellation / Reschedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cancel Trip #{searchResult?.id}
            </h3>
            <p className="text-xs text-slate-600">
              Please let us know the reason for cancellation so we can process your request:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Flight cancelled / travel dates changed / booked alternate vehicle"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
