import React, { useState } from 'react';
import { Clock, MapPin, Search, Filter, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { TravelPackage } from '../types/travel';
import { TravelStore } from '../services/storage';

interface PackagesViewProps {
  onOpenPackageModal: (pkg: TravelPackage) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({ onOpenPackageModal }) => {
  const packages = TravelStore.getPackages().filter(p => p.isPublished);
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedTripType, setSelectedTripType] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(30000);

  const destinations = ['all', 'Ooty', 'Mysore', 'Coorg', 'Tirupati'];
  const tripTypes = ['all', 'Hill Station / Nature', 'Heritage & Plantation', 'Pilgrimage'];

  const filteredPackages = packages.filter(p => {
    const matchDest = selectedDestination === 'all' || p.destination.toLowerCase().includes(selectedDestination.toLowerCase());
    const matchType = selectedTripType === 'all' || p.tripType === selectedTripType;
    const matchBudget = p.startingPrice <= maxBudget;
    return matchDest && matchType && matchBudget;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Tour & Holiday Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
          Curated Travel Packages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Handpicked road trip itineraries with dedicated chauffeur-driven cabs. Enjoy doorstep pickup, flexible photo stops, and stress-free holiday transit.
        </p>
      </div>

      {/* Verification Notice */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 max-w-3xl mx-auto">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Sample Demo Offers:</strong> The itineraries below are representative demo packages provided for demonstration. Official tour packages and custom pricing can be published directly by the business owner in the Admin Dashboard.
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Destination Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Destination:</span>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Destinations</option>
            <option value="Ooty">Ooty & Coonoor</option>
            <option value="Mysore">Mysore & Heritage</option>
            <option value="Coorg">Coorg Coffee County</option>
            <option value="Tirupati">Tirupati Balaji</option>
          </select>
        </div>

        {/* Trip Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Trip Category:</span>
          <select
            value={selectedTripType}
            onChange={(e) => setSelectedTripType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Types</option>
            <option value="Hill Station / Nature">Hill Station / Nature</option>
            <option value="Heritage & Plantation">Heritage & Plantation</option>
            <option value="Pilgrimage">Pilgrimage</option>
          </select>
        </div>

        {/* Budget Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Max Budget:</span>
          <span className="text-xs font-mono font-bold text-slate-900">₹{maxBudget.toLocaleString('en-IN')}</span>
          <input
            type="range"
            min={8000}
            max={30000}
            step={1000}
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-28 accent-amber-500"
          />
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No travel packages match your filter criteria. Try resetting the budget or destination filter.
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-52 bg-slate-100 overflow-hidden">
                <img
                  src={pkg.photoUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  From ₹{pkg.startingPrice.toLocaleString('en-IN')}
                </div>
                {pkg.isDemo && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                    Demo Itinerary
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-600 font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{pkg.destination}</span>
                    <span>·</span>
                    <span>{pkg.tripType}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 mt-1">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {pkg.overview}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Key Inclusions</span>
                    {pkg.inclusions.slice(0, 2).map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onOpenPackageModal(pkg)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View Itinerary & Book</span>
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
