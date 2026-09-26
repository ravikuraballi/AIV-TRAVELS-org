import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, CustomerEnquiry } from '../types/travel';

export const SUPABASE_PROJECT_ID = 'etvjlpmmjbefcglvxbsq';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xO3faCUDEuOfcZqLDLdndQ_sXp7RgDT';

export const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface SupabaseSyncStatus {
  connected: boolean;
  tableExists: boolean;
  lastSyncedAt?: string;
  error?: string;
  projectId: string;
}

export const SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql)

-- 1. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  trip_type TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  return_date TEXT,
  return_time TEXT,
  passengers INT DEFAULT 1,
  luggage_count INT DEFAULT 0,
  vehicle_preference TEXT,
  vehicle_id TEXT,
  driver_id TEXT,
  flight_number TEXT,
  flight_arrival_time TEXT,
  airport_terminal TEXT,
  airport_transfer_type TEXT,
  local_package_hours INT,
  local_package_km INT,
  estimated_distance_km NUMERIC,
  estimated_duration_hours NUMERIC,
  base_fare NUMERIC DEFAULT 0,
  distance_fare NUMERIC DEFAULT 0,
  driver_allowance NUMERIC DEFAULT 0,
  toll_parking_estimate NUMERIC DEFAULT 0,
  gst_amount NUMERIC DEFAULT 0,
  total_fare NUMERIC NOT NULL,
  fare_type TEXT DEFAULT 'estimate',
  status TEXT DEFAULT 'Pending',
  payment_status TEXT DEFAULT 'unpaid',
  payment_amount_paid NUMERIC DEFAULT 0,
  payment_method TEXT,
  special_instructions TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  destination_interest TEXT,
  travel_dates TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Allow Public Read/Write for Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new ride bookings
CREATE POLICY IF NOT EXISTS "Allow public to create bookings" 
ON public.bookings FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow reading bookings
CREATE POLICY IF NOT EXISTS "Allow public to view bookings" 
ON public.bookings FOR SELECT 
TO public 
USING (true);

-- Allow updating bookings (status updates / driver assignments)
CREATE POLICY IF NOT EXISTS "Allow public to update bookings" 
ON public.bookings FOR UPDATE 
TO public 
USING (true);

-- Allow public enquiries
CREATE POLICY IF NOT EXISTS "Allow public to create enquiries" 
ON public.enquiries FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public to view enquiries" 
ON public.enquiries FOR SELECT 
TO public 
USING (true);
`;

// Helper: Convert internal camelCase Booking to Supabase snake_case
function mapBookingToRow(b: Booking) {
  return {
    id: b.id,
    customer_name: b.customerName,
    customer_phone: b.customerPhone,
    customer_email: b.customerEmail || null,
    trip_type: b.tripType,
    pickup_location: b.pickupLocation,
    drop_location: b.dropLocation,
    pickup_date: b.pickupDate,
    pickup_time: b.pickupTime,
    return_date: b.returnDate || null,
    return_time: b.returnTime || null,
    passengers: b.passengers,
    luggage_count: b.luggageCount,
    vehicle_preference: b.vehiclePreference,
    vehicle_id: b.vehicleId || null,
    driver_id: b.driverId || null,
    flight_number: b.flightNumber || null,
    flight_arrival_time: b.flightArrivalTime || null,
    airport_terminal: b.airportTerminal || null,
    airport_transfer_type: b.airportTransferType || null,
    local_package_hours: b.localPackageHours || null,
    local_package_km: b.localPackageKm || null,
    estimated_distance_km: b.estimatedDistanceKm,
    estimated_duration_hours: b.estimatedDurationHours,
    base_fare: b.baseFare,
    distance_fare: b.distanceFare,
    driver_allowance: b.driverAllowance,
    toll_parking_estimate: b.tollParkingEstimate,
    gst_amount: b.gstAmount,
    total_fare: b.totalFare,
    fare_type: b.fareType,
    status: b.status,
    payment_status: b.paymentStatus,
    payment_amount_paid: b.paymentAmountPaid,
    payment_method: b.paymentMethod || null,
    special_instructions: b.specialInstructions || null,
    status_history: b.statusHistory,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
  };
}

// Helper: Convert Supabase snake_case row to internal Booking
function mapRowToBooking(r: any): Booking {
  return {
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email || undefined,
    tripType: r.trip_type,
    pickupLocation: r.pickup_location,
    dropLocation: r.drop_location,
    pickupDate: r.pickup_date,
    pickupTime: r.pickup_time,
    returnDate: r.return_date || undefined,
    returnTime: r.return_time || undefined,
    passengers: Number(r.passengers) || 1,
    luggageCount: Number(r.luggage_count) || 0,
    vehiclePreference: r.vehicle_preference || 'Sedan',
    vehicleId: r.vehicle_id || undefined,
    driverId: r.driver_id || undefined,
    flightNumber: r.flight_number || undefined,
    flightArrivalTime: r.flight_arrival_time || undefined,
    airportTerminal: r.airport_terminal || undefined,
    airportTransferType: r.airport_transfer_type || undefined,
    localPackageHours: r.local_package_hours || undefined,
    localPackageKm: r.local_package_km || undefined,
    estimatedDistanceKm: Number(r.estimated_distance_km) || 0,
    estimatedDurationHours: Number(r.estimated_duration_hours) || 0,
    baseFare: Number(r.base_fare) || 0,
    distanceFare: Number(r.distance_fare) || 0,
    driverAllowance: Number(r.driver_allowance) || 0,
    tollParkingEstimate: Number(r.toll_parking_estimate) || 0,
    gstAmount: Number(r.gst_amount) || 0,
    totalFare: Number(r.total_fare) || 0,
    fareType: r.fare_type || 'estimate',
    status: r.status || 'Pending',
    paymentStatus: r.payment_status || 'unpaid',
    paymentAmountPaid: Number(r.payment_amount_paid) || 0,
    paymentMethod: r.payment_method || undefined,
    specialInstructions: r.special_instructions || undefined,
    statusHistory: Array.isArray(r.status_history) ? r.status_history : [],
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  };
}

export class SupabaseService {
  /**
   * Test Supabase connection & check table existence
   */
  static async testConnection(): Promise<SupabaseSyncStatus> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .limit(1);

      if (error) {
        // Check if error is due to missing table
        const isMissingTable = error.message?.includes('relation "public.bookings" does not exist') ||
          error.code === '42P01';

        return {
          connected: true,
          tableExists: !isMissingTable,
          projectId: SUPABASE_PROJECT_ID,
          error: isMissingTable 
            ? 'Table "bookings" not yet created in Supabase. Run the provided SQL migration in Supabase SQL editor.' 
            : error.message,
        };
      }

      return {
        connected: true,
        tableExists: true,
        lastSyncedAt: new Date().toISOString(),
        projectId: SUPABASE_PROJECT_ID,
      };
    } catch (err: any) {
      return {
        connected: false,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        error: err.message || 'Failed to connect to Supabase.',
      };
    }
  }

  /**
   * Save newly created booking to Supabase
   */
  static async saveBooking(booking: Booking): Promise<{ success: boolean; error?: string }> {
    try {
      const row = mapBookingToRow(booking);
      const { error } = await supabase.from('bookings').upsert(row);

      if (error) {
        console.warn('Supabase save error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase save error caught:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch all bookings from Supabase
   */
  static async fetchBookings(): Promise<Booking[] | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return null;
      }

      return data.map(mapRowToBooking);
    } catch (err) {
      return null;
    }
  }

  /**
   * Update an existing booking in Supabase
   */
  static async updateBooking(id: string, updates: Partial<Booking>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
      if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail || null;
      if (updates.tripType !== undefined) updateData.trip_type = updates.tripType;
      if (updates.pickupLocation !== undefined) updateData.pickup_location = updates.pickupLocation;
      if (updates.dropLocation !== undefined) updateData.drop_location = updates.dropLocation;
      if (updates.pickupDate !== undefined) updateData.pickup_date = updates.pickupDate;
      if (updates.pickupTime !== undefined) updateData.pickup_time = updates.pickupTime;
      if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate || null;
      if (updates.returnTime !== undefined) updateData.return_time = updates.returnTime || null;
      if (updates.passengers !== undefined) updateData.passengers = updates.passengers;
      if (updates.luggageCount !== undefined) updateData.luggage_count = updates.luggageCount;
      if (updates.vehiclePreference !== undefined) updateData.vehicle_preference = updates.vehiclePreference;
      if (updates.vehicleId !== undefined) updateData.vehicle_id = updates.vehicleId || null;
      if (updates.driverId !== undefined) updateData.driver_id = updates.driverId || null;
      if (updates.flightNumber !== undefined) updateData.flight_number = updates.flightNumber || null;
      if (updates.flightArrivalTime !== undefined) updateData.flight_arrival_time = updates.flightArrivalTime || null;
      if (updates.airportTerminal !== undefined) updateData.airport_terminal = updates.airportTerminal || null;
      if (updates.airportTransferType !== undefined) updateData.airport_transfer_type = updates.airportTransferType || null;
      if (updates.localPackageHours !== undefined) updateData.local_package_hours = updates.localPackageHours || null;
      if (updates.localPackageKm !== undefined) updateData.local_package_km = updates.localPackageKm || null;
      if (updates.estimatedDistanceKm !== undefined) updateData.estimated_distance_km = updates.estimatedDistanceKm;
      if (updates.estimatedDurationHours !== undefined) updateData.estimated_duration_hours = updates.estimatedDurationHours;
      if (updates.baseFare !== undefined) updateData.base_fare = updates.baseFare;
      if (updates.distanceFare !== undefined) updateData.distance_fare = updates.distanceFare;
      if (updates.driverAllowance !== undefined) updateData.driver_allowance = updates.driverAllowance;
      if (updates.tollParkingEstimate !== undefined) updateData.toll_parking_estimate = updates.tollParkingEstimate;
      if (updates.gstAmount !== undefined) updateData.gst_amount = updates.gstAmount;
      if (updates.totalFare !== undefined) updateData.total_fare = updates.totalFare;
      if (updates.fareType !== undefined) updateData.fare_type = updates.fareType;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
      if (updates.paymentAmountPaid !== undefined) updateData.payment_amount_paid = updates.paymentAmountPaid;
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod || null;
      if (updates.specialInstructions !== undefined) updateData.special_instructions = updates.specialInstructions || null;
      if (updates.statusHistory !== undefined) updateData.status_history = updates.statusHistory;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.warn('Supabase updateBooking error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase updateBooking exception:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a booking from Supabase
   */
  static async deleteBooking(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase deleteBooking error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase deleteBooking exception:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Save customer enquiry to Supabase
   */
  static async saveEnquiry(enquiry: CustomerEnquiry): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('enquiries').upsert({
        id: enquiry.id,
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email || null,
        destination_interest: enquiry.destinationInterest || null,
        travel_dates: enquiry.travelDates || null,
        message: enquiry.message,
        status: enquiry.status,
        created_at: enquiry.createdAt,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
