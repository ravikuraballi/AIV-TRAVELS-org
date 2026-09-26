import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Luggage, 
  ArrowRight, 
  ShieldCheck, 
  Car,
  Map as MapIcon,
  Navigation,
  Compass,
  Database,
  Sparkles
} from 'lucide-react';
import { Vehicle, TripType } from '../types/travel';
import { TravelStore } from '../services/storage';
import { RouteMap } from '../components/RouteMap';
import { LocationInput } from '../components/LocationInput';
import { calculateTripDistance } from '../services/geocoding';
import { SUPABASE_PROJECT_ID } from '../services/supabase';

interface CabBookingViewProps {
  onOpenBookingModal: (tripType: TripType, vehicleId?: string) => void;
}

const POPULAR_CORRIDORS = [
  { name: 'Kempegowda Airport → Electronic City', pickup: 'Kempegowda International Airport', drop: 'Electronic City, Bengaluru', km: 54 },
  { name: 'Bengaluru City → Mysuru (Mysore)', pickup: 'Bengaluru City (Majestic)', drop: 'Mysuru (Mysore)', km: 150 },
  { name: 'Indiranagar → Kempegowda Airport', pickup: 'Indiranagar, Bengaluru', drop: 'Kempegowda International Airport', km: 42 },
  { name: 'Bengaluru → Coorg / Madikeri', pickup: 'Bengaluru City', drop: 'Coorg (Madikeri)', km: 260 },
  { name: 'Whitefield → Kempegowda Airport', pickup: 'Whitefield, Bengaluru', drop: 'Kempegowda International Airport', km: 45 },
];

export const CabBookingView: React.FC<CabBookingViewProps> = ({ onOpenBookingModal }) => {
  const vehicles = TravelStore.getVehicles().filter(v => v.isAvailable);
  const [mapPickup, setMapPickup] = useState('Indiranagar, Bengaluru');
  const [mapDrop, setMapDrop] = useState('Kempegowda International Airport');
  const [activeKm, setActiveKm] = useState(42);

  const handleSelectPreset = (preset: typeof POPULAR_CORRIDORS[0]) => {
    setMapPickup(preset.pickup);
    setMapDrop(preset.drop);
    setActiveKm(preset.km);
  };

  // Automatically update distance when either pickup or drop is modified
  useEffect(() => {
    if (mapPickup && mapDrop) {
      const km = calculateTripDistance(mapPickup, mapDrop);
      setActiveKm(km);
    }
  }, [mapPickup, mapDrop]);

  const estimatedSedanFare = Math.max(350, Math.round(activeKm * 14.5 + 50));
  const estimatedSuvFare = Math.max(500, Math.round(activeKm * 19.5 + 80));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          City & Point-to-Point Transit
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
          Cab and Taxi Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Reserve clean, air-conditioned cabs for immediate city travel, point-to-point drop-offs, and hourly local rentals.
        </p>
      </div>

      {/* Booking Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">One Way Transit</span>
            <h3 className="text-lg font-bold text-slate-900">Point-to-Point City Drop</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct doorstep pickup and drop anywhere within city limits or suburban corridors. No surge charges during peak rain or traffic hours.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li>✓ Guaranteed chauffeur arrival</li>
              <li>✓ Transparent per-km meter rate</li>
              <li>✓ Hatchback, Sedan, & SUV options</li>
            </ul>
          </div>
          <button
            onClick={() => onOpenBookingModal('oneway')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Book One Way Cab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-300/80 shadow-xs flex flex-col justify-between space-y-4 bg-amber-50/20">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Round Trip</span>
            <h3 className="text-lg font-bold text-slate-900">Same Day Return Ride</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ideal for clinic appointments, business meetings, shopping sprees, or family visits. Driver waits and brings you back safely.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li>✓ Retain the same vehicle & driver</li>
              <li>✓ Flexible waiting options</li>
              <li>✓ Discounted return toll structure</li>
            </ul>
          </div>
          <button
            onClick={() => onOpenBookingModal('roundtrip')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Book Round Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Hourly Packages</span>
            <h3 className="text-lg font-bold text-slate-900">Local Hourly Rental</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep a dedicated car at your disposal for 4 hours (40 km), 8 hours (80 km), or 12 hours (120 km) with multiple intermediate stops.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
              <li>✓ Multiple stops allowed</li>
              <li>✓ Fixed upfront package fare</li>
              <li>✓ Convenient for full-day city errands</li>
            </ul>
          </div>
          <button
            onClick={() => onOpenBookingModal('local')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Book Hourly Package</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* USER CHECK ROUTE ON MAP SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                <MapIcon className="w-4 h-4" />
                Live Map Route Check
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                Supabase Connected
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
              Check Your Route & Transit Distance on Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize pickup and destination pins, verify road trajectory, and inspect real-time estimates before booking.
            </p>
          </div>

          <button
            onClick={() => onOpenBookingModal('oneway')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Book Ride Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Corridor Buttons */}
        <div>
          <span className="text-xs font-medium text-slate-600 mb-2 block">Quick Route Presets:</span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CORRIDORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectPreset(c)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  mapPickup === c.pickup && mapDrop === c.drop
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LocationInput
            label="Pickup Location"
            value={mapPickup}
            onChange={(val) => setMapPickup(val)}
            placeholder="Search pickup point, airport or address..."
            pinColor="emerald"
            showCurrentLocationBtn={true}
          />
          <LocationInput
            label="Drop-off Destination"
            value={mapDrop}
            onChange={(val) => setMapDrop(val)}
            placeholder="Search drop destination or city..."
            pinColor="red"
            showCurrentLocationBtn={false}
          />
        </div>

        {/* Live Interactive Map */}
        <div className="space-y-3">
          <RouteMap
            pickupLocation={mapPickup}
            dropLocation={mapDrop}
            estimatedKm={activeKm}
            estimatedHours={Math.max(1, Math.round(activeKm / 35))}
            interactiveSelect={true}
            onSelectPickup={(loc) => setMapPickup(loc)}
            onSelectDrop={(loc) => setMapDrop(loc)}
            heightClass="h-80 sm:h-96"
          />

          {/* Quick Metrics Bar below Map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Estimated Distance</span>
              <span className="font-bold font-mono text-slate-900 text-sm">{activeKm} Kms</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Travel Time</span>
              <span className="font-bold text-slate-900 text-sm">~{Math.max(1, Math.round(activeKm / 35))} hr {activeKm % 35 > 15 ? '30 mins' : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sedan Estimate</span>
              <span className="font-bold font-mono text-amber-600 text-sm">₹{estimatedSedanFare}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">SUV Estimate</span>
              <span className="font-bold font-mono text-amber-600 text-sm">₹{estimatedSuvFare}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Showcase */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold font-display text-slate-900">
            Available City Fleet
          </h2>
          <span className="text-xs text-slate-500">
            {vehicles.length} vehicle models verified for dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 flex flex-col justify-between">
              <div>
                <img src={v.photoUrl} alt={v.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-600">₹{v.pricePerKm}/km</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{v.category}</span>
                  <span>·</span>
                  <span>{v.passengerCapacity} Seats</span>
                  <span>·</span>
                  <span>{v.hasAc ? 'AC' : 'Non-AC'}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{v.description}</p>
              </div>

              <button
                onClick={() => onOpenBookingModal('oneway', v.id)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Select This Vehicle
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
