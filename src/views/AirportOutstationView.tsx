import React, { useState } from 'react';
import { Plane, Compass, Calendar, Clock, MapPin, Users, Luggage, ArrowRight, ShieldCheck } from 'lucide-react';
import { TripType } from '../types/travel';
import { TravelStore } from '../services/storage';

interface AirportOutstationViewProps {
  onOpenBookingModal: (tripType: TripType, vehicleId?: string) => void;
}

export const AirportOutstationView: React.FC<AirportOutstationViewProps> = ({ onOpenBookingModal }) => {
  const [activeTab, setActiveTab] = useState<'airport' | 'outstation'>('airport');
  const pricingRules = TravelStore.getPricingRules();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Specialized Travel Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
          Airport & Outstation Transfers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Dedicated transfers designed for highway journeys and time-sensitive flight schedules.
        </p>
      </div>

      {/* Main Switcher */}
      <div className="flex items-center justify-center">
        <div className="p-1 bg-slate-100 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('airport')}
            className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'airport'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-4 h-4 text-blue-600" />
            <span>Airport Transfers</span>
          </button>
          <button
            onClick={() => setActiveTab('outstation')}
            className={`px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'outstation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Outstation Trips</span>
          </button>
        </div>
      </div>

      {/* AIRPORT SECTION */}
      {activeTab === 'airport' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Kempegowda International Airport (BLR) & Regional Transit
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
                Punctual Airport Drops & Pickups
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Eliminate the anxiety of airport travel. Our professional chauffeurs track your flight schedules, arrive 15 minutes ahead of time, and assist with your luggage from door to terminal.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Flight Delay Protection</span>
                <p className="text-slate-500">
                  Provide your flight number and our dispatch automatically adjusts chauffeur pickup time in case of delays.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Terminal 1 & Terminal 2 Meet & Greet</span>
                <p className="text-slate-500">
                  Easy chauffeur meet point right outside arrival halls with name board assistance on request.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Tolls & Parking Included</span>
                <p className="text-slate-500">
                  Airport expressway toll and parking fees are factored into the transparent fare estimate upfront.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenBookingModal('airport')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <span>Book Airport Transfer Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Popular Airport Routes & Indicative Fares
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Indiranagar / MG Road ⇄ BLR Airport</span>
                  <span className="text-slate-500 text-[11px]">~40 kms · 60-75 mins transit</span>
                </div>
                <span className="font-mono font-bold text-slate-900">From ₹1,199</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Electronic City / Koramangala ⇄ BLR Airport</span>
                  <span className="text-slate-500 text-[11px]">~52 kms · 80-95 mins transit</span>
                </div>
                <span className="font-mono font-bold text-slate-900">From ₹1,499</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Whitefield / ITPL ⇄ BLR Airport</span>
                  <span className="text-slate-500 text-[11px]">~44 kms · 65-80 mins transit</span>
                </div>
                <span className="font-mono font-bold text-slate-900">From ₹1,299</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Mysuru City ⇄ BLR Airport Express</span>
                  <span className="text-slate-500 text-[11px]">~185 kms · Mysore Expressway</span>
                </div>
                <span className="font-mono font-bold text-slate-900">From ₹3,499</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Rates vary based on selected vehicle model (Dzire, Etios, Innova Crysta, or Tempo Traveller).
            </p>
          </div>
        </div>
      )}

      {/* OUTSTATION SECTION */}
      {activeTab === 'outstation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                Multi-Day Road Trips & Inter-City Travel
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
                Comfortable Outstation Touring
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Plan short weekend getaways or extensive week-long circuits. Enjoy seasoned highway drivers familiar with scenic routes, ghat curves, and highway dining stops.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Round-Trip and Multi-Day Support</span>
                <p className="text-slate-500">
                  Keep the vehicle for the full duration of your trip. No returning empty car stress.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Highway Safety Standards</span>
                <p className="text-slate-500">
                  Drivers with 5+ years commercial highway experience, speed limit compliance, and zero late-night driving fatigue policies.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Clear Driver Allowances</span>
                <p className="text-slate-500">
                  Fixed driver daily food & night allowance (₹{pricingRules.driverDayAllowance}/day). No unexpected demands.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenBookingModal('roundtrip')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <span>Plan Outstation Trip</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Popular Outstation Highway Routes
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Bengaluru ⇄ Mysore Heritage Tour</span>
                  <span className="text-slate-500 text-[11px]">150 km one way · Same day or 2 days</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹14/km (Sedan)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Bengaluru ⇄ Coorg / Madikeri</span>
                  <span className="text-slate-500 text-[11px]">260 km one way · Scenic Western Ghats</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹18/km (Innova SUV)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Bengaluru ⇄ Ooty & Coonoor</span>
                  <span className="text-slate-500 text-[11px]">280 km one way · Nilgiri Hill Route</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹18/km (SUV)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Bengaluru ⇄ Tirupati Sri Balaji Darshan</span>
                  <span className="text-slate-500 text-[11px]">250 km one way · Interstate Andhra</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹24/km (Tempo 12-Seater)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Min billing: {pricingRules.minFareKm} km/day. Tolls and state taxes charged as per actual receipts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
