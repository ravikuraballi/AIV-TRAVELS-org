import { 
  Booking, 
  BusinessProfile, 
  CustomerEnquiry, 
  Driver, 
  PricingRules, 
  TravelPackage, 
  Vehicle, 
  TripType,
  BookingStatus 
} from '../types/travel';
import { 
  defaultBookings, 
  defaultBusinessProfile, 
  defaultDrivers, 
  defaultPackages, 
  defaultPricingRules, 
  defaultVehicles 
} from '../data/initialData';
import { SupabaseService } from './supabase';

const STORAGE_KEYS = {
  BUSINESS: 'aiv_business_profile_v1',
  VEHICLES: 'aiv_vehicles_v1',
  PACKAGES: 'aiv_packages_v1',
  DRIVERS: 'aiv_drivers_v1',
  BOOKINGS: 'aiv_bookings_v1',
  PRICING: 'aiv_pricing_rules_v1',
  ENQUIRIES: 'aiv_enquiries_v1',
  AUTH: 'aiv_auth_session_v1',
};

// Safe JSON local storage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error setting key ${key}:`, err);
  }
}

export class TravelStore {
  // Business Profile
  static getBusinessProfile(): BusinessProfile {
    const profile = getStored<BusinessProfile>(STORAGE_KEYS.BUSINESS, defaultBusinessProfile);
    let needsUpdate = false;
    const updated: BusinessProfile = { ...profile };

    if (profile.phone !== '+91 84313 57721' || profile.alternatePhone) {
      updated.phone = '+91 84313 57721';
      updated.alternatePhone = undefined;
      updated.whatsapp = '918431357721';
      needsUpdate = true;
    }
    if (!profile.email || profile.email === 'bookings@aivtravels.com') {
      updated.email = 'ravikuraballi523@gmail.com';
      needsUpdate = true;
    }

    if (needsUpdate) {
      setStored(STORAGE_KEYS.BUSINESS, updated);
      return updated;
    }
    return profile;
  }

  static updateBusinessProfile(profile: Partial<BusinessProfile>): BusinessProfile {
    const current = this.getBusinessProfile();
    const updated = { ...current, ...profile };
    setStored(STORAGE_KEYS.BUSINESS, updated);
    return updated;
  }

  // Vehicles
  static getVehicles(): Vehicle[] {
    return getStored<Vehicle[]>(STORAGE_KEYS.VEHICLES, defaultVehicles);
  }

  static getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  }

  static saveVehicle(vehicle: Vehicle): Vehicle {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === vehicle.id);
    if (index >= 0) {
      vehicles[index] = vehicle;
    } else {
      vehicles.push(vehicle);
    }
    setStored(STORAGE_KEYS.VEHICLES, vehicles);
    return vehicle;
  }

  static deleteVehicle(id: string): void {
    const vehicles = this.getVehicles().filter(v => v.id !== id);
    setStored(STORAGE_KEYS.VEHICLES, vehicles);
  }

  // Packages
  static getPackages(): TravelPackage[] {
    return getStored<TravelPackage[]>(STORAGE_KEYS.PACKAGES, defaultPackages);
  }

  static getPackageById(id: string): TravelPackage | undefined {
    return this.getPackages().find(p => p.id === id);
  }

  static savePackage(pkg: TravelPackage): TravelPackage {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === pkg.id);
    if (index >= 0) {
      packages[index] = pkg;
    } else {
      packages.push(pkg);
    }
    setStored(STORAGE_KEYS.PACKAGES, packages);
    return pkg;
  }

  static deletePackage(id: string): void {
    const packages = this.getPackages().filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PACKAGES, packages);
  }

  // Drivers
  static getDrivers(): Driver[] {
    return getStored<Driver[]>(STORAGE_KEYS.DRIVERS, defaultDrivers);
  }

  static saveDriver(driver: Driver): Driver {
    const drivers = this.getDrivers();
    const idx = drivers.findIndex(d => d.id === driver.id);
    if (idx >= 0) {
      drivers[idx] = driver;
    } else {
      drivers.push(driver);
    }
    setStored(STORAGE_KEYS.DRIVERS, drivers);
    return driver;
  }

  // Pricing rules
  static getPricingRules(): PricingRules {
    return getStored<PricingRules>(STORAGE_KEYS.PRICING, defaultPricingRules);
  }

  static updatePricingRules(rules: Partial<PricingRules>): PricingRules {
    const current = this.getPricingRules();
    const updated = { ...current, ...rules };
    setStored(STORAGE_KEYS.PRICING, updated);
    return updated;
  }

  // Bookings
  static getBookings(): Booking[] {
    const list = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, defaultBookings);
    // Cure any stale demo booking in existing localStorage
    let modified = false;
    const cleaned = list.map(b => {
      if (b.id === 'AIV-2026-1042' && b.status === 'Confirmed') {
        modified = true;
        return { ...b, status: 'Completed' as BookingStatus };
      }
      return b;
    });
    if (modified) {
      setStored(STORAGE_KEYS.BOOKINGS, cleaned);
      return cleaned;
    }
    return list;
  }

  static getBookingById(id: string): Booking | undefined {
    const trimmed = id.trim().toUpperCase();
    return this.getBookings().find(b => b.id.toUpperCase() === trimmed);
  }

  static getBookingByReferenceAndPhone(id: string, phone: string): Booking | undefined {
    const trimmedId = id.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.getBookings().find(b => {
      const matchId = b.id.toUpperCase() === trimmedId;
      const bPhoneClean = b.customerPhone.replace(/[^0-9]/g, '');
      const matchPhone = bPhoneClean.includes(cleanPhone) || cleanPhone.includes(bPhoneClean);
      return matchId && (matchPhone || cleanPhone.length === 0);
    });
  }

  // Vehicle Double Booking & Availability Check
  static checkVehicleAvailability(vehicleId: string, pickupDate: string, returnDate?: string): { available: boolean; conflictReason?: string } {
    const bookings = this.getBookings();
    const pStart = pickupDate;
    const pEnd = returnDate || pickupDate;

    // Only active upcoming dispatches block assignment
    const activeStatuses: BookingStatus[] = ['Driver Assigned', 'In Progress'];

    for (const b of bookings) {
      if (b.vehicleId === vehicleId && activeStatuses.includes(b.status)) {
        const bStart = b.pickupDate;
        const bEnd = b.returnDate || b.pickupDate;

        // Proper date overlap check
        if (pStart <= bEnd && pEnd >= bStart) {
          return {
            available: false,
            conflictReason: `Vehicle has a confirmed dispatch on ${b.pickupDate}. Our team will allocate an equivalent cab from the fleet.`,
          };
        }
      }
    }

    return { available: true };
  }

  // Create new booking with availability validation
  static createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): { success: boolean; booking?: Booking; error?: string } {
    let finalVehicleId = data.vehicleId;

    // If specific vehicle has a conflict, check if alternative is available in same category
    if (finalVehicleId) {
      const avail = this.checkVehicleAvailability(finalVehicleId, data.pickupDate, data.returnDate);
      if (!avail.available) {
        const allVehicles = this.getVehicles();
        const alt = allVehicles.find(v => v.category === data.vehiclePreference && v.id !== finalVehicleId && v.isAvailable);
        if (alt) {
          finalVehicleId = alt.id;
        }
      }
    }

    // Generate unique ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `AIV-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newBooking: Booking = {
      ...data,
      vehicleId: finalVehicleId,
      id: newId,
      status: 'Pending', // All new web bookings start as Pending for dispatch verification
      statusHistory: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Booking request created and submitted via web portal',
          actor: 'Customer',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    // Save to Supabase backend asynchronously
    SupabaseService.saveBooking(newBooking).catch((err) => {
      console.warn('Supabase booking sync error:', err);
    });

    return { success: true, booking: newBooking };
  }

  // Update booking status
  static updateBookingStatus(
    id: string, 
    newStatus: BookingStatus, 
    note: string, 
    actor: string = 'Admin',
    vehicleId?: string,
    driverId?: string
  ): Booking | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx < 0) return null;

    const b = bookings[idx];
    const now = new Date().toISOString();

    b.status = newStatus;
    if (vehicleId) b.vehicleId = vehicleId;
    if (driverId) b.driverId = driverId;
    b.updatedAt = now;
    
    b.statusHistory.push({
      status: newStatus,
      timestamp: now,
      note,
      actor,
    });

    bookings[idx] = b;
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync status change to Supabase
    SupabaseService.updateBooking(id, {
      status: newStatus,
      vehicleId: b.vehicleId,
      driverId: b.driverId,
      statusHistory: b.statusHistory,
    }).catch(console.warn);

    return b;
  }

  // Update trip fare or details
  static updateBookingFare(id: string, updates: Partial<Booking>): Booking | null {
    return this.updateBooking(id, updates);
  }

  // General update booking with full field support & Supabase synchronization
  static updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx < 0) return null;

    const existing = bookings[idx];
    const updatedStatusHistory = updates.statusHistory 
      ? updates.statusHistory 
      : updates.status && updates.status !== existing.status
        ? [
            ...existing.statusHistory,
            {
              status: updates.status,
              timestamp: new Date().toISOString(),
              note: `Status updated to ${updates.status} by Dispatch`,
              actor: 'Admin',
            }
          ]
        : existing.statusHistory;

    const updatedBooking: Booking = {
      ...existing,
      ...updates,
      statusHistory: updatedStatusHistory,
      updatedAt: new Date().toISOString(),
    };

    bookings[idx] = updatedBooking;
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    // Sync full update to Supabase
    SupabaseService.updateBooking(id, updatedBooking).catch((err) => {
      console.warn('Supabase update failed:', err);
    });

    return updatedBooking;
  }

  // Cancel booking
  static cancelBooking(id: string, reason: string = 'Cancelled by administrator', actor: string = 'Admin'): Booking | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx < 0) return null;

    const existing = bookings[idx];
    const now = new Date().toISOString();
    const updatedStatusHistory = [
      ...existing.statusHistory,
      {
        status: 'Cancelled' as BookingStatus,
        timestamp: now,
        note: reason,
        actor,
      },
    ];

    const updatedBooking: Booking = {
      ...existing,
      status: 'Cancelled',
      statusHistory: updatedStatusHistory,
      updatedAt: now,
    };

    bookings[idx] = updatedBooking;
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    SupabaseService.updateBooking(id, {
      status: 'Cancelled',
      statusHistory: updatedStatusHistory,
    }).catch(console.warn);

    return updatedBooking;
  }

  // Delete booking permanently from local storage and Supabase
  static deleteBooking(id: string): boolean {
    const bookings = this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    if (filtered.length === bookings.length) return false;

    setStored(STORAGE_KEYS.BOOKINGS, filtered);

    // Delete in Supabase backend
    SupabaseService.deleteBooking(id).catch((err) => {
      console.warn('Supabase deletion error:', err);
    });

    return true;
  }

  // Sync latest records from Supabase into local store
  static async syncWithSupabase(): Promise<{ count: number }> {
    try {
      const remoteBookings = await SupabaseService.fetchBookings();
      if (remoteBookings && remoteBookings.length > 0) {
        const local = this.getBookings();
        const mergedMap = new Map<string, Booking>();
        // Add remote first
        for (const rb of remoteBookings) {
          mergedMap.set(rb.id, rb);
        }
        // Preserve any local not yet on remote
        for (const lb of local) {
          if (!mergedMap.has(lb.id)) {
            mergedMap.set(lb.id, lb);
          }
        }
        const merged = Array.from(mergedMap.values());
        setStored(STORAGE_KEYS.BOOKINGS, merged);
        return { count: merged.length };
      }
    } catch (e) {
      console.warn('Sync with Supabase failed:', e);
    }
    return { count: this.getBookings().length };
  }

  // Enquiries
  static getEnquiries(): CustomerEnquiry[] {
    return getStored<CustomerEnquiry[]>(STORAGE_KEYS.ENQUIRIES, [
      {
        id: 'ENQ-101',
        name: 'Vikas Rao',
        phone: '+91 97410 88200',
        email: 'vikas.rao@test.com',
        destinationInterest: 'Ooty Family Tour',
        travelDates: 'Mid October (4 Adults, 2 Kids)',
        message: 'Looking for a clean Innova cab with driver who knows local scenic spots in Ooty and Coonoor.',
        status: 'New',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static addEnquiry(enquiry: Omit<CustomerEnquiry, 'id' | 'createdAt' | 'status'>): CustomerEnquiry {
    const list = this.getEnquiries();
    const newEnq: CustomerEnquiry = {
      ...enquiry,
      id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newEnq);
    setStored(STORAGE_KEYS.ENQUIRIES, list);

    SupabaseService.saveEnquiry(newEnq).catch(console.warn);

    return newEnq;
  }

  static updateEnquiryStatus(id: string, status: 'New' | 'Contacted' | 'Closed'): void {
    const list = this.getEnquiries();
    const idx = list.findIndex(e => e.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      setStored(STORAGE_KEYS.ENQUIRIES, list);
    }
  }

  // Fare calculation engine
  static calculateEstimatedFare(params: {
    tripType: TripType;
    category: 'Hatchback' | 'Sedan' | 'SUV' | 'Premium' | 'Tempo Traveller' | 'Mini Bus';
    distanceKm: number;
    durationHours?: number;
    daysCount?: number;
    pickupTime?: string;
    isAirport?: boolean;
    localPackageIndex?: number;
  }): {
    baseFare: number;
    distanceFare: number;
    driverAllowance: number;
    tollParkingEstimate: number;
    gstAmount: number;
    totalFare: number;
    breakdownNote: string;
  } {
    const rules = this.getPricingRules();
    const ratePerKm = rules.perKmRates[params.category] || 14;
    const days = params.daysCount || 1;

    let baseFare = 0;
    let distanceFare = 0;
    let driverAllowance = 0;
    let tollParkingEstimate = 0;
    let breakdownNote = '';

    if (params.tripType === 'local') {
      const pkg = rules.localRentalPackages[params.localPackageIndex || 1];
      const pkgBase = params.category === 'SUV' 
        ? pkg.suvFare 
        : params.category === 'Tempo Traveller' 
          ? pkg.tempoFare 
          : pkg.sedanFare;

      baseFare = pkgBase;
      const extraKm = Math.max(0, params.distanceKm - pkg.kms);
      distanceFare = extraKm * ratePerKm;
      tollParkingEstimate = 100;
      breakdownNote = `Rental package (${pkg.label}) includes ${pkg.hours} hrs & ${pkg.kms} kms. Extra km rate: ₹${ratePerKm}/km.`;
    } else if (params.tripType === 'airport') {
      baseFare = params.category === 'SUV' ? 1200 : 800;
      distanceFare = Math.round(params.distanceKm * ratePerKm);
      tollParkingEstimate = rules.airportBaseSurge;
      breakdownNote = `Standard airport transfer fare based on ~${params.distanceKm} km + airport toll/parking fee.`;
    } else if (params.tripType === 'outstation') {
      // Outstation minimum billing: minFareKm per day
      const billableKm = Math.max(rules.minFareKm * days, params.distanceKm);
      distanceFare = Math.round(billableKm * ratePerKm);
      driverAllowance = rules.driverDayAllowance * days;
      
      // Night charge check if pickup is late night
      if (params.pickupTime) {
        const hour = parseInt(params.pickupTime.split(':')[0], 10);
        if (hour >= rules.nightChargeStartHour || hour < rules.nightChargeEndHour) {
          driverAllowance += rules.driverNightAllowance;
        }
      }
      
      tollParkingEstimate = Math.round(params.distanceKm * 1.1); // approx toll on highways in India ~ ₹1.1/km
      baseFare = params.category === 'SUV' ? 1000 : 600;
      breakdownNote = `Outstation rate ₹${ratePerKm}/km (Min ${rules.minFareKm * days} km for ${days} day(s)) + Driver allowance ₹${driverAllowance}.`;
    } else {
      // One way / round trip
      baseFare = 500;
      distanceFare = Math.round(params.distanceKm * ratePerKm);
      tollParkingEstimate = Math.round(params.distanceKm * 0.9);
      breakdownNote = `Calculated at ₹${ratePerKm}/km for estimated ${params.distanceKm} km journey.`;
    }

    const subtotal = baseFare + distanceFare + driverAllowance + tollParkingEstimate;
    const gstAmount = Math.round((subtotal * rules.gstPercentage) / 100);
    const totalFare = subtotal + gstAmount;

    return {
      baseFare,
      distanceFare,
      driverAllowance,
      tollParkingEstimate,
      gstAmount,
      totalFare,
      breakdownNote,
    };
  }

  // Export CSV of bookings
  static exportBookingsToCsv(): string {
    const bookings = this.getBookings();
    const headers = [
      'Booking ID',
      'Customer Name',
      'Phone',
      'Trip Type',
      'Pickup Location',
      'Drop Location',
      'Pickup Date',
      'Pickup Time',
      'Vehicle Preference',
      'Status',
      'Payment Status',
      'Total Fare (INR)',
      'Created At',
    ];

    const rows = bookings.map(b => [
      `"${b.id}"`,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.tripType}"`,
      `"${b.pickupLocation.replace(/"/g, '""')}"`,
      `"${b.dropLocation.replace(/"/g, '""')}"`,
      `"${b.pickupDate}"`,
      `"${b.pickupTime}"`,
      `"${b.vehiclePreference}"`,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      b.totalFare,
      `"${b.createdAt}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
