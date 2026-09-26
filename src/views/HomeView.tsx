import React, { useState } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Car, 
  Plane, 
  Compass, 
  Users, 
  CheckCircle2, 
  Star, 
  PhoneCall, 
  MessageSquare, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BusinessProfile, Vehicle, TravelPackage, TripType } from '../types/travel';
import { heroImg } from '../data/initialData';
import { ActiveTab } from '../components/Navbar';

interface HomeViewProps {
  business: BusinessProfile;
  vehicles: Vehicle[];
  packages: TravelPackage[];
  onOpenBooking: (tripType?: TripType, vehicleId?: string) => void;
  onOpenPackage: (pkg: TravelPackage) => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  business,
  vehicles,
  packages,
  onOpenBooking,
  onOpenPackage,
  onSelectTab,
}) => {
  // Quick bar trip selection on hero
  const [quickTripType, setQuickTripType] = useState<TripType>('oneway');
  const [quickPickup, setQuickPickup] = useState('');
  const [quickDrop, setQuickDrop] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking(quickTripType);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[620px] lg:min-h-[680px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Measured Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="AIV Travels road journey"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white space-y-8">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display text-white" style={{ textWrap: 'balance' }}>
              Your Journey, Our Responsibility.
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto" style={{ textWrap: 'balance' }}>
              Book reliable travel services, comfortable rides, and personalized trips with {business.name}. Transparent per-km rates, punctual chauffeurs, and round-the-clock assistance.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenBooking('oneway')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 transform active:scale-95"
            >
              <span>Book Your Ride</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('packages')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider rounded-xl transition-all border border-white/20 backdrop-blur-xs flex items-center gap-2"
            >
              <span>Explore Travel Packages</span>
              <Compass className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Quick Booking Form Card on Hero */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl text-left border border-white/40">
            {/* Trip Type Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setQuickTripType('oneway')}
                className={`flex-1 min-w-[90px] py-2 px-3 text-center rounded-lg transition-colors whitespace-nowrap ${
                  quickTripType === 'oneway' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setQuickTripType('roundtrip')}
                className={`flex-1 min-w-[90px] py-2 px-3 text-center rounded-lg transition-colors whitespace-nowrap ${
                  quickTripType === 'roundtrip' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => setQuickTripType('airport')}
                className={`flex-1 min-w-[90px] py-2 px-3 text-center rounded-lg transition-colors whitespace-nowrap ${
                  quickTripType === 'airport' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Airport Transfer
              </button>
              <button
                type="button"
                onClick={() => setQuickTripType('local')}
                className={`flex-1 min-w-[90px] py-2 px-3 text-center rounded-lg transition-colors whitespace-nowrap ${
                  quickTripType === 'local' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Local Rental (Hourly)
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pickup Point</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-emerald-600" />
                  <input
                    type="text"
                    placeholder="Enter pickup city/address"
                    value={quickPickup}
                    onChange={(e) => setQuickPickup(e.target.value)}
                    list="home-quick-locations"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {quickTripType === 'local' ? 'Rental Duration' : 'Drop-off Destination'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-rose-500" />
                  <input
                    type="text"
                    placeholder={quickTripType === 'local' ? '8 Hours / 80 Kms' : 'Enter destination city'}
                    value={quickDrop}
                    onChange={(e) => setQuickDrop(e.target.value)}
                    list="home-quick-locations"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                  <datalist id="home-quick-locations">
                    <option value="Kempegowda International Airport (BLR), Bengaluru" />
                    <option value="Majestic Railway Station / Bus Stand, Bengaluru" />
                    <option value="Indiranagar 100ft Road, Bengaluru" />
                    <option value="Koramangala, Bengaluru" />
                    <option value="Whitefield ITPL, Bengaluru" />
                    <option value="Electronic City Phase 1, Bengaluru" />
                    <option value="HSR Layout, Bengaluru" />
                    <option value="Hebbal / Manyata Tech Park, Bengaluru" />
                    <option value="Mysore Palace, Mysuru" />
                    <option value="Madikeri / Coorg, Karnataka" />
                    <option value="Ooty Botanical Gardens, Tamil Nadu" />
                    <option value="Tirupati Sri Balaji Temple, Andhra Pradesh" />
                    <option value="Chikmagalur Coffee Country, Karnataka" />
                    <option value="Mangaluru City & Port, Karnataka" />
                    <option value="Goa Beaches (Panaji / Calangute)" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pickup Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Check Fare & Book</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. POPULAR TRAVEL SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            Comprehensive Mobility Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Services Tailored to Your Travel Needs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From city airport drops to multi-day hill station tours, travel with verified chauffeurs and pristine vehicles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Local & One-Way Cabs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reliable point-to-point and hourly city rentals. Avoid surge pricing with transparent per-km billing and air-conditioned comfort.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking('oneway')}
              className="mt-4 text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              Book Local Cab <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Airport Chauffeur Transit</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guaranteed on-time airport drop-offs and pickups. Chauffeurs track flight status to ensure timely doorstep arrivals without delays.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking('airport')}
              className="mt-4 text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              Book Airport Transfer <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Outstation Road Trips</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spacious sedans, Innovas, and tempo travellers for family road trips, pilgrimages, and business travel across Karnataka and neighboring states.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking('roundtrip')}
              className="mt-4 text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              Plan Outstation Trip <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Group & Corporate Tours</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tempo Travellers (12+1 seats) and luxury mini buses for wedding guest transport, corporate retreats, and organized pilgrimage circuits.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('packages')}
              className="mt-4 text-xs font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              View Tour Options <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED FLEET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              Fleet Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
              Maintained Vehicles Ready for Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your preferred ride. Every car is thoroughly sanitized and chauffeur-driven.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('vehicles')}
            className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1"
          >
            <span>View All Fleet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.slice(0, 4).map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={vehicle.photoUrl}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  ₹{vehicle.pricePerKm}/km
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    {vehicle.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{vehicle.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span>{vehicle.passengerCapacity} Passengers</span>
                    <span>·</span>
                    <span>{vehicle.luggageCapacity} Luggage</span>
                    <span>·</span>
                    <span>{vehicle.hasAc ? 'AC' : 'Non-AC'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking('oneway', vehicle.id)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Select Vehicle
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED TOUR PACKAGES */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Curated Holiday & Pilgrimage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Featured South India Tour Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Doorstep pickup with dedicated private cab, interstate permits, and planned scenic itineraries.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('packages')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Explore All Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.photoUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {pkg.duration}
                    </span>
                    <span className="bg-slate-900/80 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
                      From ₹{pkg.startingPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {pkg.overview}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => onOpenPackage(pkg)}
                      className="text-xs text-slate-300 hover:text-white font-medium"
                    >
                      View Itinerary
                    </button>
                    <button
                      onClick={() => onOpenPackage(pkg)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Enquire / Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE AIV TRAVELS & HOW BOOKING WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Why Choose */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
                Why Choose Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
                Reliable Transportation, Every Single Mile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Whether heading to the airport at dawn or taking your family on an outstation holiday, we ensure your journey is safe, timely, and pleasant.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Punctual Chauffeurs & 24/7 Dispatch</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our drivers report 15 minutes before scheduled pickup time for seamless departure.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Clean & Maintained Fleet</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every car undergoes routine maintenance checks, interior deep-cleaning, and working air-conditioning.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Hidden Surcharges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upfront transparent per-km billing with clearly documented toll and driver allowance policies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How Booking Works */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold font-display text-slate-900">
              How Booking Works
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Select Route & Vehicle</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Enter pickup, drop-off, date, and choose from hatchback, sedan, SUV, or tempo traveller.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Review Fare & Dispatch</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Get an instant calculated estimate based on configurable business rates. Receive your unique Booking ID.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Chauffeur Assigned & Ride</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Chauffeur contact and vehicle details sent directly via SMS and WhatsApp before pickup.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenBooking('oneway')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Start Quick Booking
            </button>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS & REPUTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Trusted by Daily Commuters & Vacationers
          </h2>
          <p className="text-xs text-slate-500">
            Reviews from verified travelers who booked airport transfers and outstation holiday tours with AIV Travels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "Booked an Innova for a 4-day Bangalore to Ooty & Coonoor family trip. The vehicle was spotlessly clean, and driver Suresh was extremely courteous on the ghat roads."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Anand Sharma</span>
              <span className="text-slate-400">Bangalore to Ooty Tour</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "Punctual airport drop-off at 4:30 AM. Chauffeur arrived 15 minutes before the time and assisted with heavy bags. Highly recommended for airport transfers."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Kavita N.</span>
              <span className="text-slate-400">Airport Transfer (BLR)</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "We booked a 12-seater Tempo Traveller for a college reunion pilgrimage to Tirupati. Smooth journey, clear toll breakdown, and no surprise charges."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Raghavendra Rao</span>
              <span className="text-slate-400">Tirupati Group Pilgrimage</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOCATION & GOOGLE MAPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
                Official Business Office
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                Visit or Contact AIV Travels
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect with our travel desk for advance reservations, custom itinerary planning, corporate billing, or immediate cab assistance.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${business.phone}`} className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline">
                    {business.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{business.openingHours}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${business.whatsapp}?text=Hello%20AIV%20Travels,%20I%20would%20like%20to%20enquire%20about%20a%20cab.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Maps */}
          <div className="min-h-[320px] bg-slate-100 relative">
            {business.googleMapsEmbedUrl ? (
              <iframe
                title="AIV Travels Google Maps Location"
                src={business.googleMapsEmbedUrl}
                className="w-full h-full min-h-[340px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
                <MapPin className="w-8 h-8 text-amber-500 mb-2" />
                <span>Google Maps Embed Preview</span>
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-600 underline font-semibold"
                >
                  Click to open Google Maps listing
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
