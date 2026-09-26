import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Luggage, 
  Car, 
  Plane, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Share2,
  FileText,
  Map as MapIcon,
  Database,
  Mail,
  MessageSquare,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { TripType, Vehicle, Booking } from '../types/travel';
import { TravelStore } from '../services/storage';
import { RouteMap } from './RouteMap';
import { LocationInput } from './LocationInput';
import { calculateTripDistance } from '../services/geocoding';
import { SUPABASE_PROJECT_ID } from '../services/supabase';
import { 
  dispatchBookingNotifications, 
  getAdminWhatsAppUrl, 
  getAdminEmailMailtoUrl, 
  formatAdminWhatsAppMessage 
} from '../services/notificationService';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTripType?: TripType;
  initialVehicleId?: string;
  onBookingCreated?: (booking: Booking) => void;
}

const COMMON_LOCATIONS = [
  'Kempegowda International Airport (BLR), Bengaluru',
  'Majestic Railway Station / Bus Stand, Bengaluru',
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Electronic City Phase 1, Bengaluru',
  'Whitefield ITPL, Bengaluru',
  'Jayanagar, Bengaluru',
  'Mysore Palace, Mysuru',
  'Madikeri / Coorg, Karnataka',
  'Ooty Botanical Gardens, Tamil Nadu',
  'Tirupati Sri Balaji Temple, Andhra Pradesh',
  'Chikmagalur Coffee County, Karnataka',
  'Chennai Central, Tamil Nadu',
];

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  initialTripType = 'oneway',
  initialVehicleId,
  onBookingCreated,
}) => {
  const [tripType, setTripType] = useState<TripType>(initialTripType);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Trip details, 2: Customer info & review, 3: Confirmation
  
  // Trip inputs
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || '');
  const [airportTransferType, setAirportTransferType] = useState<'pickup' | 'drop'>('drop');
  const [flightNumber, setFlightNumber] = useState('');
  const [localPackageIndex, setLocalPackageIndex] = useState(1); // 8hr/80km

  // Customer inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Status & Confirmation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [isKannada, setIsKannada] = useState<boolean>(true);
  const [notificationDispatched, setNotificationDispatched] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const vehicles = TravelStore.getVehicles().filter(v => v.isAvailable);
  const pricingRules = TravelStore.getPricingRules();
  const business = TravelStore.getBusinessProfile();

  useEffect(() => {
    if (initialTripType) setTripType(initialTripType);
    if (initialVehicleId) setSelectedVehicleId(initialVehicleId);
  }, [initialTripType, initialVehicleId]);

  if (!isOpen) return null;

  // Selected vehicle or default
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Estimated distance calculator based on trip locations
  const calculateDistance = (): number => {
    if (tripType === 'local') {
      return pricingRules.localRentalPackages[localPackageIndex]?.kms || 80;
    }
    return calculateTripDistance(pickupLocation, dropLocation);
  };

  const estimatedDistance = calculateDistance();
  const daysCount = tripType === 'roundtrip' && returnDate 
    ? Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 3600 * 24)) + 1)
    : 1;

  const fareEstimate = TravelStore.calculateEstimatedFare({
    tripType,
    category: selectedVehicle?.category || 'Sedan',
    distanceKm: tripType === 'roundtrip' ? estimatedDistance * 2 : estimatedDistance,
    durationHours: Math.round(estimatedDistance / 40) + 1,
    daysCount,
    pickupTime,
    localPackageIndex,
  });

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!pickupLocation.trim()) {
      setErrorMsg('Please specify a pickup location.');
      return;
    }
    if (tripType !== 'local' && !dropLocation.trim()) {
      setErrorMsg('Please specify a destination / drop-off location.');
      return;
    }
    if (!pickupDate) {
      setErrorMsg('Please choose your travel date.');
      return;
    }
    if (tripType === 'roundtrip' && !returnDate) {
      setErrorMsg('Please select a return date for round trip.');
      return;
    }

    // Non-blocking vehicle availability verification
    if (selectedVehicle) {
      const avail = TravelStore.checkVehicleAvailability(
        selectedVehicle.id,
        pickupDate,
        tripType === 'roundtrip' ? returnDate : undefined
      );
      if (!avail.available) {
        // Auto-assign alternative vehicle of same category if available
        const alt = vehicles.find(v => v.category === selectedVehicle.category && v.id !== selectedVehicle.id && v.isAvailable);
        if (alt) {
          setSelectedVehicleId(alt.id);
        }
      }
    }

    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter customer full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = TravelStore.createBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        tripType,
        pickupLocation: pickupLocation.trim(),
        dropLocation: tripType === 'local' ? `Local Rental (${pricingRules.localRentalPackages[localPackageIndex].label})` : dropLocation.trim(),
        pickupDate,
        pickupTime,
        returnDate: tripType === 'roundtrip' ? returnDate : undefined,
        passengers,
        luggageCount,
        vehiclePreference: selectedVehicle.category,
        vehicleId: selectedVehicle.id,
        flightNumber: flightNumber.trim() || undefined,
        airportTransferType: tripType === 'airport' ? airportTransferType : undefined,
        localPackageHours: tripType === 'local' ? pricingRules.localRentalPackages[localPackageIndex].hours : undefined,
        localPackageKm: tripType === 'local' ? pricingRules.localRentalPackages[localPackageIndex].kms : undefined,
        estimatedDistanceKm: tripType === 'roundtrip' ? estimatedDistance * 2 : estimatedDistance,
        estimatedDurationHours: Math.round(estimatedDistance / 35),
        baseFare: fareEstimate.baseFare,
        distanceFare: fareEstimate.distanceFare,
        driverAllowance: fareEstimate.driverAllowance,
        tollParkingEstimate: fareEstimate.tollParkingEstimate,
        gstAmount: fareEstimate.gstAmount,
        totalFare: fareEstimate.totalFare,
        fareType: 'estimate',
        status: 'Pending',
        paymentStatus: 'unpaid',
        paymentAmountPaid: 0,
        specialInstructions: specialInstructions.trim() || undefined,
      });

      if (!result.success || !result.booking) {
        setErrorMsg(result.error || 'Failed to reserve trip. Please verify details.');
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking(result.booking);
      if (onBookingCreated) {
        onBookingCreated(result.booking);
      }
      setStep(3);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating your reservation.';
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppShareUrl = (booking: Booking) => {
    const text = `*New Trip Request - ${business.name}*\n` +
      `Booking Reference: ${booking.id}\n` +
      `Customer: ${booking.customerName} (${booking.customerPhone})\n` +
      `Trip: ${booking.tripType.toUpperCase()} | ${booking.pickupLocation} -> ${booking.dropLocation}\n` +
      `Date & Time: ${booking.pickupDate} at ${booking.pickupTime}\n` +
      `Vehicle: ${booking.vehiclePreference}\n` +
      `Estimated Fare: ₹${booking.totalFare}\n` +
      `Status: Awaiting business dispatch confirmation`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>{isKannada ? 'ಕ್ಯಾಬ್ ಬುಕಿಂಗ್ ಮಾಡಿ' : 'Book Your Trip'}</span>
              <span className="text-xs font-normal text-amber-400 font-sans">· {business.name}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {step === 1 && (isKannada ? 'ಹಂತ 1: ಮಾರ್ಗ ಮತ್ತು ವಾಹನ ಆಯ್ಕೆ' : 'Step 1 of 2: Trip route & vehicle selection')}
              {step === 2 && (isKannada ? 'ಹಂತ 2: ದರ ಪರಿಶೀಲನೆ ಮತ್ತು ದೃಢೀಕರಣ' : 'Step 2 of 2: Review fare & contact details')}
              {step === 3 && (isKannada ? 'ಬುಕಿಂಗ್ ವಿನಂತಿ ಯಶಸ್ವಿಯಾಗಿದೆ' : 'Booking Request Received')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsKannada(!isKannada)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              title="ಕನ್ನಡ / English ಭಾಷೆ ಬದಲಿಸಿ"
            >
              <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Route & Preferences */}
          {step === 1 && (
            <form onSubmit={handleNextToReview} className="space-y-5">
              {/* Trip Type Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  {isKannada ? 'ಪ್ರಯಾಣದ ವಿಧಾನ (Trip Category)' : 'Trip Category'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                  {(['oneway', 'roundtrip', 'airport', 'local'] as TripType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTripType(t)}
                      className={`py-2 px-2 text-center rounded-md transition-colors ${
                        tripType === t
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t === 'oneway' && (isKannada ? 'ಒನ್-ವೇ' : 'One Way')}
                      {t === 'roundtrip' && (isKannada ? 'ರೌಂಡ್ ಟ್ರಿಪ್' : 'Round Trip')}
                      {t === 'airport' && (isKannada ? 'ವಿಮಾನ ನಿಲ್ದಾಣ' : 'Airport')}
                      {t === 'local' && (isKannada ? 'ಸ್ಥಳೀಯ ಬಾಡಿಗೆ' : 'Local Hourly')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Airport Specific Selector */}
              {tripType === 'airport' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="airportType"
                        checked={airportTransferType === 'drop'}
                        onChange={() => setAirportTransferType('drop')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>City to Airport (Drop)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="airportType"
                        checked={airportTransferType === 'pickup'}
                        onChange={() => setAirportTransferType('pickup')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Airport to City (Pickup)</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Flight Number (Optional for delay tracking)</label>
                    <div className="relative">
                      <Plane className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 6E 432 / AI 504"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Local Hourly Package Selector */}
              {tripType === 'local' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rental Package</label>
                  <select
                    value={localPackageIndex}
                    onChange={(e) => setLocalPackageIndex(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-1 focus:ring-amber-500"
                  >
                    {pricingRules.localRentalPackages.map((pkg, idx) => (
                      <option key={idx} value={idx}>
                        {pkg.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocationInput
                  label={isKannada ? 'ಪ್ರಾರಂಭದ ಸ್ಥಳ (Pickup Location) *' : 'Pickup Location *'}
                  required
                  value={pickupLocation}
                  onChange={(val) => setPickupLocation(val)}
                  placeholder={isKannada ? 'ವಿಮಾನ ನಿಲ್ದಾಣ, ಹೋಟೆಲ್, ಬಡಾವಣೆ ಅಥವಾ ವಿಳಾಸ...' : 'Search airport, hotel, metro or address...'}
                  pinColor="emerald"
                  showCurrentLocationBtn={true}
                />

                {tripType !== 'local' && (
                  <LocationInput
                    label={isKannada ? 'ತಲುಪುವ ಸ್ಥಳ (Drop Destination) *' : 'Drop-off Destination *'}
                    required
                    value={dropLocation}
                    onChange={(val) => setDropLocation(val)}
                    placeholder={isKannada ? 'ತಲುಪುವ ಊರು, ನಗರ ಅಥವಾ ವಿಳಾಸ...' : 'Search city, town, airport or hotel...'}
                    pinColor="red"
                    showCurrentLocationBtn={false}
                  />
                )}
              </div>

              {/* Interactive Route Map Check */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isKannada ? 'ಲೈವ್ ಮಾರ್ಗ ನಕ್ಷೆ (Live Route Map)' : 'Route & Transit Map'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {showMap 
                      ? (isKannada ? 'ನಕ್ಷೆ ಮುಚ್ಚಿ' : 'Hide Map') 
                      : (isKannada ? 'ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ' : 'View Route on Map')}
                  </button>
                </div>
                {showMap && (
                  <RouteMap
                    pickupLocation={pickupLocation || 'Bengaluru City'}
                    dropLocation={tripType === 'local' ? 'Local Rental Package' : (dropLocation || 'Kempegowda International Airport')}
                    estimatedKm={estimatedDistance * (tripType === 'roundtrip' ? 2 : 1)}
                    estimatedHours={Math.round(estimatedDistance / 35)}
                    interactiveSelect={true}
                    onSelectPickup={(loc) => setPickupLocation(loc)}
                    onSelectDrop={(loc) => setDropLocation(loc)}
                    heightClass="h-56 sm:h-64"
                  />
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isKannada ? 'ಪ್ರಯಾಣದ ದಿನಾಂಕ (Date) *' : 'Pickup Date *'}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isKannada ? 'ಸಮಯ (Time) *' : 'Pickup Time *'}
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {tripType === 'roundtrip' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {isKannada ? 'ಹಿಂತಿರುಗುವ ದಿನಾಂಕ *' : 'Return Date *'}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="date"
                        required
                        min={pickupDate}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Passengers & Luggage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Passengers</label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Luggage Bags</label>
                  <div className="relative">
                    <Luggage className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={luggageCount}
                      onChange={(e) => setLuggageCount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Select Vehicle Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => {
                    const isSelected = v.id === selectedVehicleId;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={v.photoUrl}
                          alt={v.name}
                          className="w-14 h-11 object-cover rounded-lg shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">{v.name}</span>
                            <span className="text-xs text-amber-600 font-semibold shrink-0">₹{v.pricePerKm}/km</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{v.category}</span>
                            <span>·</span>
                            <span>{v.passengerCapacity} Seats</span>
                            <span>·</span>
                            <span>{v.hasAc ? 'AC' : 'Non-AC'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Fare Estimate Card */}
              <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Estimated Trip Fare</span>
                  <span className="text-xl font-bold font-display text-white tabular-nums">
                    ₹{fareEstimate.totalFare.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Estimated ~{estimatedDistance * (tripType === 'roundtrip' ? 2 : 1)} km (Toll, GST & Allowance included)
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{isKannada ? 'ಮುಂದೆ ಹೋಗಿ (ದರ ಪರಿಶೀಲಿಸಿ)' : 'Review Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Review & Customer Contact */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              {/* Trip Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isKannada ? 'ಪ್ರಯಾಣದ ಸಾರಾಂಶ (Trip Summary)' : 'Trip Summary'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {isKannada ? 'ಮಾರ್ಗ ಬದಲಿಸಿ (Edit)' : 'Edit Route'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isKannada ? 'ಪ್ರಾರಂಭದ ಸ್ಥಳ' : 'Pickup'}</span>
                    <span className="font-semibold text-slate-800">{pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isKannada ? 'ತಲುಪುವ ಸ್ಥಳ' : 'Drop'}</span>
                    <span className="font-semibold text-slate-800">{dropLocation || 'Local Rental'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isKannada ? 'ದಿನಾಂಕ & ಸಮಯ' : 'Schedule'}</span>
                    <span className="font-semibold text-slate-800">{pickupDate} at {pickupTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{isKannada ? 'ವಾಹನ' : 'Vehicle'}</span>
                    <span className="font-semibold text-slate-800">{selectedVehicle?.name} ({selectedVehicle?.category})</span>
                  </div>
                </div>

                {/* Fare breakdown table */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base & Distance Fare</span>
                    <span className="tabular-nums font-medium text-slate-700">₹{fareEstimate.baseFare + fareEstimate.distanceFare}</span>
                  </div>
                  {fareEstimate.driverAllowance > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Driver Allowance</span>
                      <span className="tabular-nums font-medium text-slate-700">₹{fareEstimate.driverAllowance}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Tolls & Parking</span>
                    <span className="tabular-nums font-medium text-slate-700">₹{fareEstimate.tollParkingEstimate}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span className="tabular-nums font-medium text-slate-700">₹{fareEstimate.gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Estimated Fare</span>
                    <span className="text-amber-600 tabular-nums">₹{fareEstimate.totalFare.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic">
                  Note: Final fare and driver assignment will be confirmed by AIV Travels dispatch upon request review.
                </p>

                {/* Route Map Preview in Review */}
                <div className="pt-2">
                  <RouteMap
                    pickupLocation={pickupLocation || 'Bengaluru'}
                    dropLocation={dropLocation || 'Bengaluru Airport'}
                    estimatedKm={estimatedDistance * (tripType === 'roundtrip' ? 2 : 1)}
                    estimatedHours={Math.round(estimatedDistance / 35)}
                    heightClass="h-44 sm:h-48"
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  {isKannada ? 'ಪ್ರಯಾಣಿಕರ ಸಂಪರ್ಕ ಮಾಹಿತಿ (Contact Details)' : 'Passenger Contact Information'}
                </h4>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isKannada ? 'ಗ್ರಾಹಕರ ಪೂರ್ಣ ಹೆಸರು *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isKannada ? 'ಉದಾಹರಣೆಗೆ: ರಮೇಶ್ ಕುಮಾರ್' : 'e.g. Ramesh Kumar'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {isKannada ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (WhatsApp) *' : 'Mobile Phone (WhatsApp Enabled) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9845012345"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {isKannada ? 'ಇಮೇಲ್ ವಿಳಾಸ (ಐಚ್ಛಿಕ)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isKannada ? 'ಹೆಚ್ಚುವರಿ ಸೂಚನೆಗಳು (ಐಚ್ಛಿಕ)' : 'Trip Instructions / Special Requests'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isKannada ? 'ಉದಾಹರಣೆಗೆ: ಹೆಚ್ಚು ಲಗೇಜ್ ಇದೆ / ಹಿರಿಯ ನಾಗರಿಕರು ಇದ್ದಾರೆ...' : 'e.g. Please bring vehicle with child seat / extra boot space / senior passenger on board'}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {isKannada ? 'ಹಿಂದಕ್ಕೆ (Back)' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <span>{isKannada ? 'ಬುಕಿಂಗ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Submitting Request...'}</span>
                  ) : (
                    <>
                      <span>{isKannada ? 'ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ (ವಿನಂತಿ ಕಳುಹಿಸಿ)' : 'Confirm & Send Booking Request'}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Booking Confirmation Receipt */}
          {step === 3 && confirmedBooking && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  {isKannada ? 'ಬುಕಿಂಗ್ ವಿನಂತಿ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!' : 'Booking Request Received!'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {isKannada 
                    ? 'ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರಯಾಣದ ವಿನಂತಿಯನ್ನು ನೋಂದಾಯಿಸಲಾಗಿದೆ. ನಮ್ಮ ಕಂಟ್ರೋಲ್ ರೂಮ್‌ನಿಂದ ನಿಮ್ಮನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸಿ ಚಾಲಕ ಹಾಗೂ ವಾಹನ ವಿವರ ಕಳುಹಿಸಲಾಗುವುದು.'
                    : 'Your trip has been safely registered in the AIV Travels reservation system. Our dispatch team is reviewing vehicle allocation and will confirm promptly.'}
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500">{isKannada ? 'ಬುಕಿಂಗ್ ಸಂಖ್ಯೆ:' : 'Booking Reference'}</span>
                  <span className="text-sm font-bold font-mono text-slate-900 tracking-wider">
                    {confirmedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{isKannada ? 'ಗ್ರಾಹಕರು:' : 'Customer'}</span>
                  <span className="font-medium text-slate-800">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{isKannada ? 'ದಿನಾಂಕ & ಸಮಯ:' : 'Date & Pickup'}</span>
                  <span className="font-medium text-slate-800">{confirmedBooking.pickupDate} ({confirmedBooking.pickupTime})</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{isKannada ? 'ಮಾರ್ಗ:' : 'Route'}</span>
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">{confirmedBooking.pickupLocation} → {confirmedBooking.dropLocation}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{isKannada ? 'ಸ್ಥಿತಿ:' : 'Initial Status'}</span>
                  <span className="text-amber-700 font-semibold">{isKannada ? 'ಖಚಿತತೆಗೆ ಬಾಕಿ (Pending)' : 'Pending Confirmation'}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-semibold">{isKannada ? 'ಒಟ್ಟು ಅಂದಾಜು ದರ:' : 'Total Estimated Fare'}</span>
                  <span className="text-sm font-bold text-amber-600 font-mono">₹{confirmedBooking.totalFare}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md mt-2">
                  <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isKannada ? 'ಸುರಕ್ಷಿತ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ' : 'Synced to Supabase database'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppShareUrl(confirmedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isKannada ? 'WhatsApp ಗೆ ಕಳುಹಿಸಿ' : 'Send to AIV Travels WhatsApp'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                >
                  {isKannada ? 'ಮುಕ್ತಾಯ (Done)' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
