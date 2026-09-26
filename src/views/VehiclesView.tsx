import React, { useState } from 'react';
import { Users, Luggage, Wind, Check, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { Vehicle, TripType } from '../types/travel';
import { TravelStore } from '../services/storage';

interface VehiclesViewProps {
  onSelectVehicleForBooking: (vehicleId: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ onSelectVehicleForBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const vehicles = TravelStore.getVehicles().filter(v => v.isAvailable);

  const categories = ['All', 'Sedan', 'SUV', 'Tempo Traveller', 'Hatchback', 'Premium'];

  const filteredVehicles = selectedCategory === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Authorized Fleet
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
          Vehicle Selection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Only displaying vehicles configured and approved by AIV Travels dispatch. Clean, insured, and driven by background-verified chauffeurs.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No active vehicles found in this category.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image & Price Tag */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={vehicle.photoUrl}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  ₹{vehicle.pricePerKm}/km
                </div>
                {vehicle.isDemo && (
                  <div className="absolute bottom-3 left-3 bg-amber-500/95 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
                    Admin Verified Model
                  </div>
                )}
              </div>

              {/* Specs & Features */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                      {vehicle.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Base Fare ₹{vehicle.baseFare}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 mt-1">
                    {vehicle.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {vehicle.description}
                  </p>

                  {/* Badges / Metrics without pill-pill clutter */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.passengerCapacity} Passengers
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Luggage className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.luggageCapacity} Bags
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.hasAc ? 'AC' : 'Non-AC'}
                    </span>
                  </div>

                  {/* Feature checklist */}
                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {vehicle.features.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSelectVehicleForBooking(vehicle.id)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Select Vehicle & Book</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
