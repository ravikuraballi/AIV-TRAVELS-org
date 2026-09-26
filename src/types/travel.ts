export type TripType = 'oneway' | 'roundtrip' | 'local' | 'airport' | 'outstation';

export type BookingStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Driver Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid' | 'pay_at_business';

export interface BusinessProfile {
  name: string;
  category: string;
  tagline: string;
  address: string;
  phone: string;
  alternatePhone?: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  openingHours: string;
  isVerified: boolean; // Flag to indicate whether Google Maps listing was confirmed by owner
  verificationNote: string;
  brandColors: {
    primary: string;
    gold: string;
    accent: string;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Premium' | 'Tempo Traveller' | 'Mini Bus';
  photoUrl: string;
  passengerCapacity: number;
  luggageCapacity: number;
  hasAc: boolean;
  availableTripTypes: TripType[];
  pricePerKm: number;
  baseFare: number;
  isAvailable: boolean;
  isDemo: boolean;
  registrationNumber?: string;
  description: string;
  features: string[];
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  destination: string;
  duration: string;
  startingPrice: number;
  photoUrl: string;
  overview: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryItem[];
  isPublished: boolean;
  isDemo: boolean;
  tripType: string;
  recommendedSeason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedVehicleId?: string;
  rating: number;
  isAvailable: boolean;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface Booking {
  id: string; // e.g. "AIV-2026-7832"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tripType: TripType;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  luggageCount: number;
  vehiclePreference: string;
  vehicleId?: string;
  driverId?: string;
  
  // Airport specific
  flightNumber?: string;
  flightArrivalTime?: string;
  airportTerminal?: string;
  airportTransferType?: 'pickup' | 'drop';
  
  // Local package duration
  localPackageHours?: number;
  localPackageKm?: number;

  // Fare calculation
  estimatedDistanceKm: number;
  estimatedDurationHours: number;
  baseFare: number;
  distanceFare: number;
  driverAllowance: number;
  tollParkingEstimate: number;
  gstAmount: number;
  totalFare: number;
  fareType: 'estimate' | 'fixed' | 'quote_pending' | 'confirmed';
  
  // Status and payments
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentAmountPaid: number;
  paymentMethod?: string;
  specialInstructions?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingRules {
  perKmRates: {
    Hatchback: number;
    Sedan: number;
    SUV: number;
    Premium: number;
    'Tempo Traveller': number;
    'Mini Bus': number;
  };
  minFareKm: number;
  driverDayAllowance: number;
  driverNightAllowance: number;
  nightChargeStartHour: number;
  nightChargeEndHour: number;
  gstPercentage: number;
  localRentalPackages: {
    label: string;
    hours: number;
    kms: number;
    sedanFare: number;
    suvFare: number;
    tempoFare: number;
  }[];
  airportBaseSurge: number;
  allowInstantBookingWithoutPayment: boolean;
  depositPercentage: number;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
}

export interface CustomerEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  destinationInterest?: string;
  travelDates?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: string;
}
