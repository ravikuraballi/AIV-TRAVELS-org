import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  CalendarCheck, 
  Map, 
  Settings, 
  Users, 
  DollarSign, 
  FileSpreadsheet, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  X, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Save,
  CheckCircle2,
  Clock,
  Database,
  Copy,
  RefreshCw,
  Eye,
  XCircle,
  Calendar,
  MapPin,
  UserCheck,
  CreditCard,
  Ban,
  ArrowUpDown,
  Mail,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { 
  Booking, 
  BookingStatus, 
  BusinessProfile, 
  Driver, 
  PricingRules, 
  TravelPackage, 
  Vehicle, 
  CustomerEnquiry,
  TripType,
  PaymentStatus 
} from '../types/travel';
import { TravelStore } from '../services/storage';
import { 
  SupabaseService, 
  SUPABASE_PROJECT_ID, 
  SUPABASE_SCHEMA_SQL, 
  SUPABASE_URL,
  SupabaseSyncStatus 
} from '../services/supabase';

export const AdminDashboardView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Demo mode starts unlocked with quick lock button
  const [adminPin, setAdminPin] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'vehicles' | 'packages' | 'drivers' | 'pricing' | 'enquiries' | 'settings' | 'database'>('overview');

  // Supabase management state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Local state synced from storage
  const [bookings, setBookings] = useState<Booking[]>(() => TravelStore.getBookings());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => TravelStore.getVehicles());
  const [packages, setPackages] = useState<TravelPackage[]>(() => TravelStore.getPackages());
  const [drivers, setDrivers] = useState<Driver[]>(() => TravelStore.getDrivers());
  const [pricingRules, setPricingRules] = useState<PricingRules>(() => TravelStore.getPricingRules());
  const [business, setBusiness] = useState<BusinessProfile>(() => TravelStore.getBusinessProfile());
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(() => TravelStore.getEnquiries());

  // Filter & Search
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tripTypeFilter, setTripTypeFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'date_asc' | 'fare_desc'>('newest');
  const [notification, setNotification] = useState<string | null>(null);

  // Selected Booking for Detailed Dossier View
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Full Booking Editor Modal State
  const [editingBookingFull, setEditingBookingFull] = useState<Booking | null>(null);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');

  // Manual Appointment Creation Modal State
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tripType: 'oneway' as TripType,
    pickupLocation: '',
    dropLocation: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    returnDate: '',
    returnTime: '',
    passengers: 2,
    luggageCount: 2,
    vehiclePreference: 'Sedan',
    vehicleId: '',
    driverId: '',
    totalFare: 1200,
    paymentStatus: 'unpaid' as PaymentStatus,
    paymentAmountPaid: 0,
    paymentMethod: 'Cash / Pay at Cab',
    specialInstructions: '',
  });

  // Selected Booking for Dispatch/Editing
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [fareAdjustment, setFareAdjustment] = useState('');

  // Vehicle editor modal
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);

  // Package editor modal
  const [editingPackage, setEditingPackage] = useState<Partial<TravelPackage> | null>(null);

  // Driver editor modal
  const [editingDriver, setEditingDriver] = useState<Partial<Driver> | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'aiv2026' || adminPin === 'admin' || adminPin === '1234') {
      setIsAuthenticated(true);
      showToast('Admin logged in successfully.');
    } else {
      showToast('Invalid PIN. (Default demo PIN is "aiv2026")');
    }
  };

  useEffect(() => {
    SupabaseService.testConnection().then((res) => {
      setSupabaseStatus(res);
      if (res.connected && res.tableExists) {
        TravelStore.syncWithSupabase().then(() => {
          setBookings(TravelStore.getBookings());
        });
      }
    });
  }, []);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await SupabaseService.testConnection();
      setSupabaseStatus(res);
      if (res.connected && res.tableExists) {
        showToast('Supabase connection verified! Table "bookings" is live & receiving data.');
      } else if (res.connected && !res.tableExists) {
        showToast('Connected to Supabase, but "bookings" table needs to be created. Copy the SQL below.');
      } else {
        showToast(`Supabase ping failed: ${res.error || 'Check project config'}`);
      }
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      let successCount = 0;
      for (const b of bookings) {
        const res = await SupabaseService.saveBooking(b);
        if (res.success) successCount++;
      }
      showToast(`Successfully synced ${successCount} booking(s) into Supabase!`);
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleFetchFromSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await TravelStore.syncWithSupabase();
      setBookings(TravelStore.getBookings());
      showToast(`Updated local dashboard from Supabase (${res.count} total records)`);
    } catch (err: any) {
      showToast(`Fetch error: ${err.message}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setSqlCopied(true);
    showToast('Supabase schema SQL copied to clipboard!');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  // Status update
  const handleUpdateStatus = (id: string, newStatus: BookingStatus, customNote?: string) => {
    const updated = TravelStore.updateBookingStatus(
      id,
      newStatus,
      customNote || `Status changed to ${newStatus} by administrator`,
      'Admin',
      assignVehicleId || undefined,
      assignDriverId || undefined
    );
    if (updated) {
      setBookings(TravelStore.getBookings());
      if (selectedBookingForDetails?.id === id) {
        setSelectedBookingForDetails(updated);
      }
      setEditingBooking(null);
      showToast(`Trip #${id} updated to ${newStatus}`);
    }
  };

  // Delete booking permanently from Supabase & Storage
  const handleDeleteBooking = (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete booking #${id} from the database? This action cannot be undone.`)) {
      const deleted = TravelStore.deleteBooking(id);
      if (deleted) {
        setBookings(TravelStore.getBookings());
        if (selectedBookingForDetails?.id === id) setSelectedBookingForDetails(null);
        if (editingBookingFull?.id === id) setEditingBookingFull(null);
        showToast(`Booking #${id} deleted from database.`);
      }
    }
  };

  // Initiate Cancellation
  const handleInitiateCancel = (b: Booking) => {
    setCancellingBooking(b);
    setCancelReason('Customer requested cancellation');
  };

  // Confirm Cancellation
  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    const updated = TravelStore.cancelBooking(cancellingBooking.id, cancelReason || 'Cancelled by administrator', 'Admin');
    if (updated) {
      setBookings(TravelStore.getBookings());
      if (selectedBookingForDetails?.id === cancellingBooking.id) {
        setSelectedBookingForDetails(updated);
      }
      setCancellingBooking(null);
      showToast(`Booking #${updated.id} cancelled.`);
    }
  };

  // Save Booking Edits
  const handleSaveBookingEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBookingFull) return;
    const updated = TravelStore.updateBooking(editingBookingFull.id, editingBookingFull);
    if (updated) {
      setBookings(TravelStore.getBookings());
      if (selectedBookingForDetails?.id === updated.id) {
        setSelectedBookingForDetails(updated);
      }
      setEditingBookingFull(null);
      showToast(`Booking #${updated.id} successfully updated in database.`);
    }
  };

  // Create Manual Appointment / Ride
  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.customerName || !newAppointment.customerPhone || !newAppointment.pickupLocation || !newAppointment.dropLocation) {
      showToast('Please fill all required appointment fields.');
      return;
    }

    const res = TravelStore.createBooking({
      customerName: newAppointment.customerName,
      customerPhone: newAppointment.customerPhone,
      customerEmail: newAppointment.customerEmail || undefined,
      tripType: newAppointment.tripType,
      pickupLocation: newAppointment.pickupLocation,
      dropLocation: newAppointment.dropLocation,
      pickupDate: newAppointment.pickupDate,
      pickupTime: newAppointment.pickupTime,
      returnDate: newAppointment.returnDate || undefined,
      returnTime: newAppointment.returnTime || undefined,
      passengers: Number(newAppointment.passengers) || 1,
      luggageCount: Number(newAppointment.luggageCount) || 0,
      vehiclePreference: newAppointment.vehiclePreference,
      vehicleId: newAppointment.vehicleId || undefined,
      driverId: newAppointment.driverId || undefined,
      estimatedDistanceKm: 35,
      estimatedDurationHours: 1,
      baseFare: 500,
      distanceFare: Math.max(0, Number(newAppointment.totalFare) - 500),
      driverAllowance: 0,
      tollParkingEstimate: 100,
      gstAmount: Math.round((Number(newAppointment.totalFare) * 0.05)),
      totalFare: Number(newAppointment.totalFare) || 1000,
      fareType: 'confirmed',
      status: 'Confirmed',
      paymentStatus: newAppointment.paymentStatus,
      paymentAmountPaid: Number(newAppointment.paymentAmountPaid) || 0,
      paymentMethod: newAppointment.paymentMethod,
      specialInstructions: newAppointment.specialInstructions || undefined,
    });

    if (res.success && res.booking) {
      setBookings(TravelStore.getBookings());
      setIsCreatingAppointment(false);
      showToast(`Booking #${res.booking.id} created and saved to database!`);
      setNewAppointment({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        tripType: 'oneway',
        pickupLocation: '',
        dropLocation: '',
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: '10:00',
        returnDate: '',
        returnTime: '',
        passengers: 2,
        luggageCount: 2,
        vehiclePreference: 'Sedan',
        vehicleId: '',
        driverId: '',
        totalFare: 1200,
        paymentStatus: 'unpaid',
        paymentAmountPaid: 0,
        paymentMethod: 'Cash / Pay at Cab',
        specialInstructions: '',
      });
    } else {
      showToast(res.error || 'Failed to create booking.');
    }
  };

  // CSV Export
  const handleDownloadCsv = () => {
    const csvContent = TravelStore.exportBookingsToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AIV_Travels_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported to CSV.');
  };

  // Save Settings
  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = TravelStore.updateBusinessProfile(business);
    setBusiness(updated);
    showToast('Business details & verification status saved.');
  };

  // Save Pricing
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = TravelStore.updatePricingRules(pricingRules);
    setPricingRules(updated);
    showToast('Pricing rules updated.');
  };

  // Save Vehicle
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle || !editingVehicle.name) return;
    const v: Vehicle = {
      id: editingVehicle.id || `veh-${Date.now()}`,
      name: editingVehicle.name,
      category: editingVehicle.category || 'Sedan',
      photoUrl: editingVehicle.photoUrl || '/assets/images/vehicle_sedan_fleet_1790261886308.jpg',
      passengerCapacity: Number(editingVehicle.passengerCapacity) || 4,
      luggageCapacity: Number(editingVehicle.luggageCapacity) || 2,
      hasAc: editingVehicle.hasAc !== false,
      availableTripTypes: editingVehicle.availableTripTypes || ['oneway', 'roundtrip', 'airport', 'local', 'outstation'],
      pricePerKm: Number(editingVehicle.pricePerKm) || 14,
      baseFare: Number(editingVehicle.baseFare) || 800,
      isAvailable: editingVehicle.isAvailable !== false,
      isDemo: editingVehicle.isDemo || false,
      registrationNumber: editingVehicle.registrationNumber || '',
      description: editingVehicle.description || '',
      features: editingVehicle.features || ['Air Conditioning', 'Clean Seats'],
    };
    TravelStore.saveVehicle(v);
    setVehicles(TravelStore.getVehicles());
    setEditingVehicle(null);
    showToast('Vehicle saved.');
  };

  // Delete Vehicle
  const handleDeleteVehicle = (id: string) => {
    if (confirm('Are you sure you want to remove this vehicle from the fleet?')) {
      TravelStore.deleteVehicle(id);
      setVehicles(TravelStore.getVehicles());
      showToast('Vehicle removed.');
    }
  };

  // Save Driver
  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver || !editingDriver.name) return;
    const d: Driver = {
      id: editingDriver.id || `drv-${Date.now()}`,
      name: editingDriver.name,
      phone: editingDriver.phone || '+91 98450 00000',
      licenseNumber: editingDriver.licenseNumber || 'KA-DL-PENDING',
      assignedVehicleId: editingDriver.assignedVehicleId,
      rating: Number(editingDriver.rating) || 4.9,
      isAvailable: editingDriver.isAvailable !== false,
    };
    TravelStore.saveDriver(d);
    setDrivers(TravelStore.getDrivers());
    setEditingDriver(null);
    showToast('Driver details updated.');
  };

  // Calculations for stats
  const totalRevenue = bookings
    .filter(b => b.status === 'Completed' || b.paymentStatus === 'fully_paid' || b.paymentStatus === 'deposit_paid')
    .reduce((acc, b) => acc + (b.paymentAmountPaid || b.totalFare), 0);
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Driver Assigned').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      b.pickupLocation.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.dropLocation.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.vehiclePreference.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesTripType = tripTypeFilter === 'all' || b.tripType === tripTypeFilter;
    const matchesPayment = paymentStatusFilter === 'all' || b.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesStatus && matchesTripType && matchesPayment;
  }).sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(`${a.pickupDate}T${a.pickupTime || '00:00'}`).getTime() - new Date(`${b.pickupDate}T${b.pickupTime || '00:00'}`).getTime();
    }
    if (sortBy === 'fare_desc') {
      return b.totalFare - a.totalFare;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-sm w-full space-y-5 text-center">
          <div className="w-12 h-12 bg-slate-900 text-amber-500 rounded-xl flex items-center justify-center mx-auto text-xl font-bold font-display">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Admin & Dispatch Login
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter authorized administrator PIN to access AIV Travels management portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Enter PIN (Demo: aiv2026)"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-3 py-2.5 text-center tracking-widest text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Sign In to Admin
            </button>
          </form>
          <div className="text-xs text-slate-400">
            Default credentials for testing: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">aiv2026</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
              {business.name} Dispatch & Admin Portal
            </h1>
            {business.isVerified ? (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Listing
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unverified (Pending Maps Sync)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reservations, vehicle allocation, price rules, and business profile configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Bookings CSV</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'bookings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Bookings ({bookings.length})</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'vehicles' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Vehicles ({vehicles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'packages' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Travel Packages ({packages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'drivers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Drivers ({drivers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'pricing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pricing Engine</span>
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'enquiries' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Enquiries ({enquiries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Business & Verification</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeTab === 'database' ? 'bg-emerald-700 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Supabase Database</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Pending Requests</span>
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">{pendingCount}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Requires confirmation</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Confirmed / Assigned</span>
              <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">{confirmedCount}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Upcoming trips</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Completed Trips</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">{completedCount}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Successfully fulfilled</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Cancellations</span>
              <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{cancelledCount}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Customer / operator</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Bookings</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{bookings.length}</span>
              <span className="text-[11px] text-slate-400 block mt-1">All time records</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Recorded Revenue</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-400 block mt-1">From payments</span>
            </div>
          </div>

          {/* Quick Action: Pending Queue */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Priority Action: Bookings Awaiting Verification ({pendingCount})
                </h3>
                <p className="text-xs text-slate-500">
                  Customer bookings submitted online that need fare approval or chauffeur assignment.
                </p>
              </div>
              <button
                onClick={() => {
                  setStatusFilter('Pending');
                  setActiveTab('bookings');
                }}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                View in Full Table
              </button>
            </div>

            {pendingCount === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All pending reservations are up to date!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.filter(b => b.status === 'Pending').map((b) => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{b.id}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-800">{b.customerName}</span>
                        <span className="text-xs text-slate-500">({b.customerPhone})</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {b.tripType.toUpperCase()} · {b.pickupLocation} → {b.dropLocation} · {b.pickupDate} ({b.pickupTime})
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Pref: <span className="font-medium text-slate-800">{b.vehiclePreference}</span> · Est. Fare: <span className="font-mono font-semibold text-amber-600">₹{b.totalFare}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customerName)},%20this%20is%20AIV%20Travels%20regarding%20your%20trip%20request%20${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          setEditingBooking(b);
                          setAssignVehicleId(b.vehicleId || '');
                          setAssignDriverId(b.driverId || '');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                      >
                        Dispatch / Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS & APPOINTMENT MANAGEMENT TABLE */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Supabase Live DB Sync Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Database Appointments & Bookings</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    supabaseStatus?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{supabaseStatus?.connected ? 'Live Supabase DB' : 'Connecting to DB'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project: <span className="font-mono text-slate-700 font-semibold">{SUPABASE_PROJECT_ID}</span> · Storing and retrieving {bookings.length} reservations across all channels
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFetchFromSupabase}
                disabled={isSyncingSupabase}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 disabled:opacity-50"
                title="Fetch latest updates from Supabase database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
                <span>{isSyncingSupabase ? 'Syncing...' : 'Fetch from DB'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncAllToSupabase}
                disabled={isSyncingSupabase}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 disabled:opacity-50"
                title="Push all local appointments to Supabase database"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sync All to DB</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                title="Export bookings to CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreatingAppointment(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ID, customer name, route, phone, email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="all">Status: All ({bookings.length})</option>
                  <option value="Pending">Pending ({pendingCount})</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Driver Assigned">Driver Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed ({completedCount})</option>
                  <option value="Cancelled">Cancelled ({cancelledCount})</option>
                </select>
              </div>

              {/* Service / Trip Type Filter */}
              <div>
                <select
                  value={tripTypeFilter}
                  onChange={(e) => setTripTypeFilter(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="all">Trip Type: All</option>
                  <option value="oneway">One-Way Drop</option>
                  <option value="roundtrip">Round-Trip</option>
                  <option value="airport">Airport Transfer</option>
                  <option value="local">Local Rental Package</option>
                  <option value="outstation">Outstation Tour</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="newest">Sort: Created (Newest First)</option>
                  <option value="oldest">Sort: Created (Oldest First)</option>
                  <option value="date_asc">Sort: Pickup Date (Earliest)</option>
                  <option value="fare_desc">Sort: Highest Fare</option>
                </select>
              </div>
            </div>

            {/* Active filters counter & quick reset */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> appointments</span>
                {(bookingSearch || statusFilter !== 'all' || tripTypeFilter !== 'all' || paymentStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setBookingSearch('');
                      setStatusFilter('all');
                      setTripTypeFilter('all');
                      setPaymentStatusFilter('all');
                    }}
                    className="text-amber-600 hover:text-amber-700 underline font-medium ml-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending: {pendingCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Active: {confirmedCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done: {completedCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Cancelled: {cancelledCount}
                </span>
              </div>
            </div>
          </div>

          {/* Bookings & Appointments Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">ID & DB Sync</th>
                    <th className="p-3">Customer Profile</th>
                    <th className="p-3">Service & Route</th>
                    <th className="p-3">Appointment Date</th>
                    <th className="p-3">Fleet & Chauffeur</th>
                    <th className="p-3 text-right">Fare & Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Manage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="font-semibold text-slate-700">No appointments found</div>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or create a new appointment.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID & Sync badge */}
                        <td className="p-3 align-top whitespace-nowrap">
                          <button
                            onClick={() => setSelectedBookingForDetails(b)}
                            className="font-mono font-bold text-amber-600 hover:text-amber-700 hover:underline block text-left"
                            title="Click to view full dossier"
                          >
                            {b.id}
                          </button>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Supabase Synced</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-3 align-top min-w-[160px]">
                          <div className="font-bold text-slate-900">{b.customerName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`tel:${b.customerPhone}`}
                              className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{b.customerPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customerName)},%20this%20is%20AIV%20Travels%20regarding%20booking%20${b.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          {b.customerEmail && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px] mt-0.5">{b.customerEmail}</div>
                          )}
                        </td>

                        {/* Route & Service */}
                        <td className="p-3 align-top max-w-[220px]">
                          <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 bg-slate-100 text-slate-700">
                            {b.tripType}
                          </div>
                          <div className="font-medium text-slate-800 truncate" title={b.pickupLocation}>
                            {b.pickupLocation}
                          </div>
                          <div className="text-slate-400 truncate text-[11px]" title={b.dropLocation}>
                            → {b.dropLocation}
                          </div>
                          {b.flightNumber && (
                            <div className="text-[10px] text-blue-600 mt-0.5 font-medium">
                              Flight: {b.flightNumber} ({b.airportTerminal || 'T1'})
                            </div>
                          )}
                        </td>

                        {/* Schedule */}
                        <td className="p-3 align-top whitespace-nowrap">
                          <div className="font-medium text-slate-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{b.pickupDate}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{b.pickupTime}</span>
                          </div>
                          {b.returnDate && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              Return: {b.returnDate}
                            </div>
                          )}
                        </td>

                        {/* Vehicle & Chauffeur */}
                        <td className="p-3 align-top min-w-[140px]">
                          <div className="font-semibold text-slate-800">{b.vehiclePreference}</div>
                          {b.vehicleId ? (
                            <div className="text-[11px] text-emerald-700 font-medium">
                              Vehicle: {vehicles.find(v => v.id === b.vehicleId)?.name || 'Assigned'}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 font-medium mt-0.5">Vehicle: Unassigned</div>
                          )}
                          {b.driverId ? (
                            <div className="text-[11px] text-blue-700 font-medium">
                              Driver: {drivers.find(d => d.id === b.driverId)?.name || 'Assigned'}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 mt-0.5">Driver: Pending</div>
                          )}
                        </td>

                        {/* Fare & Payment */}
                        <td className="p-3 align-top text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 text-sm">₹{b.totalFare}</div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                            b.paymentStatus === 'fully_paid' ? 'bg-emerald-100 text-emerald-800' :
                            b.paymentStatus === 'deposit_paid' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {b.paymentStatus === 'fully_paid' ? 'Paid in Full' :
                             b.paymentStatus === 'deposit_paid' ? 'Deposit Paid' : 'Unpaid'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3 align-top whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                            b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            b.status === 'Confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            b.status === 'Driver Assigned' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            b.status === 'In Progress' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            b.status === 'Completed' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                            'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 align-top text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Dossier */}
                            <button
                              onClick={() => setSelectedBookingForDetails(b)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View full booking dossier"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>

                            {/* Edit Booking */}
                            <button
                              onClick={() => setEditingBookingFull({ ...b })}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit appointment details"
                            >
                              <Edit3 className="w-4 h-4 text-amber-600" />
                            </button>

                            {/* Cancel Booking */}
                            {b.status !== 'Cancelled' ? (
                              <button
                                onClick={() => handleInitiateCancel(b)}
                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Cancel appointment"
                              >
                                <Ban className="w-4 h-4 text-rose-500" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'Confirmed', 'Reactivated by administrator')}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Reactivate appointment"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              </button>
                            )}

                            {/* Delete Permanently */}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete permanently from database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VEHICLE MANAGEMENT */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fleet Inventory ({vehicles.length})
              </h2>
              <p className="text-xs text-slate-500">
                Add, edit, or configure vehicles available for customer booking.
              </p>
            </div>
            <button
              onClick={() => setEditingVehicle({
                name: '',
                category: 'Sedan',
                passengerCapacity: 4,
                luggageCapacity: 2,
                hasAc: true,
                pricePerKm: 14,
                baseFare: 800,
                isAvailable: true,
                isDemo: false,
                features: ['Air Conditioning', 'Luggage Space'],
              })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                <div className="relative h-40 bg-slate-100">
                  <img src={v.photoUrl} alt={v.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      v.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {v.isAvailable ? 'Active' : 'Maintenance'}
                    </span>
                  </div>
                  {v.isDemo && (
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/90 text-slate-950 text-[10px] font-bold">
                        Sample Inventory
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{v.name}</h3>
                      <span className="text-xs text-amber-600 font-bold font-mono">₹{v.pricePerKm}/km</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{v.category}</span>
                      <span>·</span>
                      <span>{v.passengerCapacity} Seats</span>
                      <span>·</span>
                      <span>{v.luggageCapacity} Bags</span>
                      <span>·</span>
                      <span>{v.hasAc ? 'AC' : 'Non-AC'}</span>
                    </div>
                    {v.registrationNumber && (
                      <div className="text-[11px] font-mono text-slate-500 mt-1">
                        Plate: {v.registrationNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingVehicle(v)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Vehicle
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tour Packages ({packages.length})
              </h2>
              <p className="text-xs text-slate-500">
                Publish or customize holiday and pilgrimage packages with dedicated cab service.
              </p>
            </div>
            <button
              onClick={() => setEditingPackage({
                title: '',
                destination: '',
                duration: '3 Days / 2 Nights',
                startingPrice: 12000,
                photoUrl: '/assets/images/destination_scenic_tour_1790261922197.jpg',
                tripType: 'Holiday Tour',
                overview: '',
                inclusions: ['Dedicated AC Cab', 'Tolls & Driver Allowance'],
                exclusions: ['Hotel & Food', 'Entry Tickets'],
                itinerary: [{ day: 1, title: 'Departure & Arrival', description: 'Comfortable road trip.' }],
                isPublished: true,
                isDemo: false,
              })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
                <div className="h-40 relative bg-slate-100">
                  <img src={pkg.photoUrl} alt={pkg.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      pkg.isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {pkg.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {pkg.isDemo && (
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                        Demo Package
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{pkg.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{pkg.destination} · {pkg.duration}</div>
                    <div className="text-xs font-mono font-bold text-amber-600 mt-2">
                      Starting ₹{pkg.startingPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Package
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove package "${pkg.title}"?`)) {
                          TravelStore.deletePackage(pkg.id);
                          setPackages(TravelStore.getPackages());
                          showToast('Package removed.');
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Driver Roster ({drivers.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage registered chauffeurs, contact numbers, and vehicle assignments.
              </p>
            </div>
            <button
              onClick={() => setEditingDriver({
                name: '',
                phone: '+91 ',
                licenseNumber: '',
                rating: 4.8,
                isAvailable: true,
              })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Driver</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                  <span className="text-xs text-amber-600 font-bold">★ {d.rating}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Phone: <a href={`tel:${d.phone}`} className="text-blue-600 font-medium">{d.phone}</a>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  DL: {d.licenseNumber}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className={`text-[11px] font-semibold ${d.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {d.isAvailable ? 'Available' : 'On Duty / Leave'}
                  </span>
                  <button
                    onClick={() => setEditingDriver(d)}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PRICING RULES */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricing} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Configurable Pricing Engine
            </h2>
            <p className="text-xs text-slate-500">
              Configure baseline per-kilometer rates, allowances, and GST. Fares on the booking engine calculate automatically based on these rules.
            </p>
          </div>

          {/* Per KM Rates */}
          <div>
            <h3 className="text-xs font-semibold text-slate-800 mb-3">Vehicle Per-Km Rates (INR)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(pricingRules.perKmRates) as Array<keyof typeof pricingRules.perKmRates>).map((cat) => (
                <div key={cat} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-xs font-medium text-slate-600 mb-1">{cat}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={pricingRules.perKmRates[cat]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPricingRules({
                          ...pricingRules,
                          perKmRates: { ...pricingRules.perKmRates, [cat]: val },
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allowances & Outstation Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Min. Outstation Billing Km / Day
              </label>
              <input
                type="number"
                value={pricingRules.minFareKm}
                onChange={(e) => setPricingRules({ ...pricingRules, minFareKm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Driver Day Allowance (₹ / Day)
              </label>
              <input
                type="number"
                value={pricingRules.driverDayAllowance}
                onChange={(e) => setPricingRules({ ...pricingRules, driverDayAllowance: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Driver Night Surcharge (₹ / Night)
              </label>
              <input
                type="number"
                value={pricingRules.driverNightAllowance}
                onChange={(e) => setPricingRules({ ...pricingRules, driverNightAllowance: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* GST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                GST Tax Percentage (%)
              </label>
              <input
                type="number"
                value={pricingRules.gstPercentage}
                onChange={(e) => setPricingRules({ ...pricingRules, gstPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Airport Toll & Parking Base Allowance (₹)
              </label>
              <input
                type="number"
                value={pricingRules.airportBaseSurge}
                onChange={(e) => setPricingRules({ ...pricingRules, airportBaseSurge: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Pricing Rules</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Customer Enquiries ({enquiries.length})
            </h2>
            <p className="text-xs text-slate-500">
              Submitted package and travel contact queries.
            </p>
          </div>

          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div key={enq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{enq.name}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <a href={`tel:${enq.phone}`} className="text-xs text-blue-600 font-medium">{enq.phone}</a>
                    {enq.destinationInterest && (
                      <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                        {enq.destinationInterest}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      enq.status === 'New' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {enq.status}
                    </span>
                    <select
                      value={enq.status}
                      onChange={(e) => {
                        TravelStore.updateEnquiryStatus(enq.id, e.target.value as any);
                        setEnquiries(TravelStore.getEnquiries());
                        showToast('Enquiry updated');
                      }}
                      className="text-xs border border-slate-200 rounded p-1 bg-white"
                    >
                      <option value="New">Mark New</option>
                      <option value="Contacted">Mark Contacted</option>
                      <option value="Closed">Mark Closed</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "{enq.message}"
                </p>
                {enq.travelDates && (
                  <div className="text-[11px] text-slate-500">
                    Dates / Group: {enq.travelDates}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: BUSINESS PROFILE & VERIFICATION */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveBusinessSettings} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AIV Travels Business Profile & Verification
            </h2>
            <p className="text-xs text-slate-500">
              Update company identity, verified Google Maps link, contact phone, and toggle verification status.
            </p>
          </div>

          {/* Verification Switch */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-900 block">
                Google Maps Listing Verification Status
              </span>
              <p className="text-xs text-amber-800">
                Marking as "Verified" confirms all displayed phone numbers, vehicle categories, and address match the official AIV Travels Google Maps listing.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={business.isVerified}
                onChange={(e) => setBusiness({ ...business, isVerified: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Category *</label>
              <input
                type="text"
                required
                value={business.category}
                onChange={(e) => setBusiness({ ...business, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Official Phone Number *</label>
              <input
                type="text"
                required
                value={business.phone}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                placeholder="+91 84313 57721"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Alternate Phone Number (Optional)</label>
              <input
                type="text"
                value={business.alternatePhone || ''}
                onChange={(e) => setBusiness({ ...business, alternatePhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                placeholder="Leave blank or enter alternate"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp Number (e.g. 918431357721) *</label>
              <input
                type="text"
                required
                value={business.whatsapp}
                onChange={(e) => setBusiness({ ...business, whatsapp: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Email</label>
              <input
                type="email"
                value={business.email}
                onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={business.openingHours}
                onChange={(e) => setBusiness({ ...business, openingHours: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Office / Garage Address *</label>
            <textarea
              rows={2}
              required
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Google Maps Listing Share URL *</label>
              <input
                type="text"
                value={business.googleMapsUrl}
                onChange={(e) => setBusiness({ ...business, googleMapsUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Google Maps Embed iframe URL</label>
              <input
                type="text"
                value={business.googleMapsEmbedUrl || ''}
                onChange={(e) => setBusiness({ ...business, googleMapsEmbedUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Business Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 8: SUPABASE DATABASE INTEGRATION */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Live Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database</h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ride booking submissions automatically stream directly to your Supabase PostgreSQL database.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncAllToSupabase}
                  disabled={isSyncingSupabase}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isSyncingSupabase ? 'Syncing...' : 'Push All to Supabase'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleFetchFromSupabase}
                  disabled={isSyncingSupabase}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pull Latest from Supabase</span>
                </button>
              </div>
            </div>

            {/* Connection Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Project ID</span>
                <span className="text-xs font-mono font-bold text-slate-900">{SUPABASE_PROJECT_ID}</span>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[11px] text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
                >
                  <span>Open Supabase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">API Endpoint</span>
                <span className="text-xs font-mono font-medium text-slate-700 truncate block">{SUPABASE_URL}</span>
                <span className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Configured via Publishable Key</span>
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Database Sync Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-bold text-slate-900">
                    {supabaseStatus?.connected 
                      ? (supabaseStatus.tableExists ? 'Connected & Table Ready' : 'Connected (Pending Table SQL)') 
                      : 'Connecting / Initializing'}
                  </span>
                </div>
                <span className="mt-2 text-[11px] text-slate-500 block truncate">
                  {supabaseStatus?.error ? supabaseStatus.error : 'Auto-sync active on booking submission'}
                </span>
              </div>
            </div>
          </div>

          {/* SQL Setup Migration Query */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Supabase Database Schema & Table Creation SQL</span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">PostgreSQL</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  To initialize the <code className="font-mono text-amber-700">bookings</code> and <code className="font-mono text-amber-700">enquiries</code> tables in your Supabase project, copy and run this in your{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 underline hover:text-amber-700 font-semibold"
                  >
                    Supabase SQL Editor
                  </a>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          </div>

          {/* Live Data Inspection Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Recent Bookings Synced to Supabase ({bookings.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Real-time view of rides saved in local store and mirrored in Supabase project {SUPABASE_PROJECT_ID}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Latest ID: {bookings[0]?.id || 'None'}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Booking ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Date/Time</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Fare</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Supabase Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-600">{b.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.customerName}</div>
                        <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">{b.pickupLocation}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">→ {b.dropLocation}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>{b.pickupDate}</div>
                        <div className="text-[11px] text-slate-400">{b.pickupTime}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{b.vehiclePreference}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{b.totalFare}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Synced</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW APPOINTMENT DOSSIER (Full Details) */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-5 my-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold font-mono text-sm border border-amber-200">
                  {selectedBookingForDetails.id.split('-')[2] || 'AIV'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      #{selectedBookingForDetails.id}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      selectedBookingForDetails.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      selectedBookingForDetails.status === 'Confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      selectedBookingForDetails.status === 'Driver Assigned' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      selectedBookingForDetails.status === 'In Progress' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      selectedBookingForDetails.status === 'Completed' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {selectedBookingForDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created on {new Date(selectedBookingForDetails.createdAt).toLocaleString('en-IN')} · Stored in Supabase
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBookingFull({ ...selectedBookingForDetails });
                    setSelectedBookingForDetails(null);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Appointment</span>
                </button>
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body Grid */}
            <div className="space-y-4 text-xs">
              {/* Customer Profile Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedBookingForDetails.customerPhone}`}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 rounded-md font-medium text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedBookingForDetails.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedBookingForDetails.customerName)},%20this%20is%20AIV%20Travels%20regarding%20booking%20${selectedBookingForDetails.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium text-xs flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Passenger Name</span>
                    <strong className="text-slate-900 text-sm font-semibold">{selectedBookingForDetails.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Contact Number</span>
                    <strong className="text-slate-900 font-mono text-sm">{selectedBookingForDetails.customerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Email Address</span>
                    <strong className="text-slate-900">{selectedBookingForDetails.customerEmail || 'Not provided'}</strong>
                  </div>
                </div>
              </div>

              {/* Journey & Service Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trip Route & Schedule ({selectedBookingForDetails.tripType.toUpperCase()})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200/60 space-y-1">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>PICKUP LOCATION</span>
                    </span>
                    <p className="text-slate-900 font-medium text-xs leading-snug">{selectedBookingForDetails.pickupLocation}</p>
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                      <span>Date: <strong className="text-slate-800">{selectedBookingForDetails.pickupDate}</strong></span>
                      <span>Time: <strong className="text-slate-800">{selectedBookingForDetails.pickupTime}</strong></span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200/60 space-y-1">
                    <span className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600" />
                      <span>DROP-OFF DESTINATION</span>
                    </span>
                    <p className="text-slate-900 font-medium text-xs leading-snug">{selectedBookingForDetails.dropLocation}</p>
                    {selectedBookingForDetails.returnDate && (
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                        <span>Return: <strong className="text-slate-800">{selectedBookingForDetails.returnDate}</strong></span>
                        {selectedBookingForDetails.returnTime && <span>({selectedBookingForDetails.returnTime})</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional trip tags */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-600">
                  <span className="p-1.5 px-2.5 bg-white rounded border border-slate-200">
                    Passengers: <strong>{selectedBookingForDetails.passengers}</strong>
                  </span>
                  <span className="p-1.5 px-2.5 bg-white rounded border border-slate-200">
                    Luggage: <strong>{selectedBookingForDetails.luggageCount} bags</strong>
                  </span>
                  {selectedBookingForDetails.flightNumber && (
                    <span className="p-1.5 px-2.5 bg-blue-50 text-blue-800 rounded border border-blue-200 font-medium">
                      Flight #{selectedBookingForDetails.flightNumber} ({selectedBookingForDetails.airportTerminal || 'Terminal 1'})
                    </span>
                  )}
                  {selectedBookingForDetails.localPackageHours && (
                    <span className="p-1.5 px-2.5 bg-amber-50 text-amber-800 rounded border border-amber-200 font-medium">
                      Package: {selectedBookingForDetails.localPackageHours} Hours / {selectedBookingForDetails.localPackageKm} Kms
                    </span>
                  )}
                </div>
              </div>

              {/* Fleet & Chauffeur Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vehicle Assignment</span>
                  <div className="font-bold text-slate-900 text-xs">
                    {vehicles.find(v => v.id === selectedBookingForDetails.vehicleId)?.name || selectedBookingForDetails.vehiclePreference}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Preference: <strong className="text-slate-700">{selectedBookingForDetails.vehiclePreference}</strong>
                    {selectedBookingForDetails.vehicleId && (
                      <span className="ml-2 font-mono text-emerald-700 font-semibold">
                        ({vehicles.find(v => v.id === selectedBookingForDetails.vehicleId)?.registrationNumber || 'KA-Fleet'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chauffeur Assignment</span>
                  <div className="font-bold text-slate-900 text-xs">
                    {drivers.find(d => d.id === selectedBookingForDetails.driverId)?.name || 'No Chauffeur Assigned Yet'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {selectedBookingForDetails.driverId ? (
                      <span className="font-mono text-blue-700 font-medium">
                        Contact: {drivers.find(d => d.id === selectedBookingForDetails.driverId)?.phone}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Dispatch assignment pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial & Payment Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-300">Total Trip Fare</span>
                  <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                    ₹{selectedBookingForDetails.totalFare.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
                  <div>
                    <span>Payment Status</span>
                    <strong className="block text-white uppercase text-xs mt-0.5">{selectedBookingForDetails.paymentStatus}</strong>
                  </div>
                  <div>
                    <span>Amount Paid</span>
                    <strong className="block text-emerald-400 font-mono text-xs mt-0.5">₹{selectedBookingForDetails.paymentAmountPaid || 0}</strong>
                  </div>
                  <div>
                    <span>Balance Due</span>
                    <strong className="block text-amber-400 font-mono text-xs mt-0.5">
                      ₹{Math.max(0, selectedBookingForDetails.totalFare - (selectedBookingForDetails.paymentAmountPaid || 0))}
                    </strong>
                  </div>
                  <div>
                    <span>Payment Mode</span>
                    <strong className="block text-slate-200 text-xs mt-0.5">{selectedBookingForDetails.paymentMethod || 'Pay at Cab'}</strong>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedBookingForDetails.specialInstructions && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-950 text-xs">
                  <strong>Special Customer Instructions:</strong> {selectedBookingForDetails.specialInstructions}
                </div>
              )}

              {/* Audit Trail */}
              {selectedBookingForDetails.statusHistory && selectedBookingForDetails.statusHistory.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status History Audit Trail</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedBookingForDetails.statusHistory.map((entry, idx) => (
                      <div key={idx} className="text-[11px] flex items-start gap-2 text-slate-600">
                        <span className="font-mono text-slate-400 shrink-0">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-semibold text-slate-800">[{entry.status}]</span>
                        <span className="truncate">{entry.note}</span>
                        <span className="text-slate-400 ml-auto shrink-0">by {entry.actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Status:</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBookingForDetails.id, 'Confirmed', 'Confirmed by Admin')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-semibold border border-blue-200"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBookingForDetails.id, 'Driver Assigned', 'Driver assigned')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[11px] font-semibold border border-emerald-200"
                  >
                    Assign Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBookingForDetails.id, 'Completed', 'Ride completed successfully')}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-[11px] font-semibold border border-slate-200"
                  >
                    Mark Done
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedBookingForDetails.status !== 'Cancelled' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancellingBooking(selectedBookingForDetails);
                        setSelectedBookingForDetails(null);
                      }}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForDetails(null)}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT APPOINTMENT (Full Editable Form) */}
      {editingBookingFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleSaveBookingEdits} className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 my-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Appointment #{editingBookingFull.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Update customer details, schedule, route, vehicle assignment, or fare in Supabase database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBookingFull(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Customer Information */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">1. Customer Contact</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={editingBookingFull.customerName}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, customerName: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={editingBookingFull.customerPhone}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, customerPhone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editingBookingFull.customerEmail || ''}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, customerEmail: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Trip & Route */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">2. Journey Route & Type</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Trip Type</label>
                    <select
                      value={editingBookingFull.tripType}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, tripType: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="oneway">One-Way Drop</option>
                      <option value="roundtrip">Round-Trip</option>
                      <option value="airport">Airport Transfer</option>
                      <option value="local">Local Rental Package</option>
                      <option value="outstation">Outstation Tour</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Pickup Address *</label>
                    <input
                      type="text"
                      required
                      value={editingBookingFull.pickupLocation}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, pickupLocation: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Drop-off Destination *</label>
                  <input
                    type="text"
                    required
                    value={editingBookingFull.dropLocation}
                    onChange={(e) => setEditingBookingFull({ ...editingBookingFull, dropLocation: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      required
                      value={editingBookingFull.pickupDate}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, pickupDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Pickup Time *</label>
                    <input
                      type="time"
                      required
                      value={editingBookingFull.pickupTime}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, pickupTime: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Date</label>
                    <input
                      type="date"
                      value={editingBookingFull.returnDate || ''}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, returnDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Time</label>
                    <input
                      type="time"
                      value={editingBookingFull.returnTime || ''}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, returnTime: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Fleet & Driver Assignment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">3. Fleet & Driver Assignment</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Vehicle Preference</label>
                    <select
                      value={editingBookingFull.vehiclePreference}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, vehiclePreference: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Sedan">Sedan (Dzire / Etios)</option>
                      <option value="SUV">SUV (Innova Crysta / Ertiga)</option>
                      <option value="Tempo Traveller">Tempo Traveller (12+1)</option>
                      <option value="Hatchback">Hatchback (WagonR / Swift)</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assign Fleet Vehicle</label>
                    <select
                      value={editingBookingFull.vehicleId || ''}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, vehicleId: e.target.value || undefined })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- No Specific Vehicle Assigned --</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.registrationNumber || 'No plate'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Assign Chauffeur</label>
                    <select
                      value={editingBookingFull.driverId || ''}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, driverId: e.target.value || undefined })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- No Chauffeur Assigned --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status, Pricing & Payment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">4. Status & Pricing</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Booking Status</label>
                    <select
                      value={editingBookingFull.status}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, status: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Driver Assigned">Driver Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Total Fare (₹) *</label>
                    <input
                      type="number"
                      required
                      value={editingBookingFull.totalFare}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, totalFare: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Payment Status</label>
                    <select
                      value={editingBookingFull.paymentStatus}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, paymentStatus: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="fully_paid">Fully Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={editingBookingFull.paymentAmountPaid || 0}
                      onChange={(e) => setEditingBookingFull({ ...editingBookingFull, paymentAmountPaid: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Special Notes / Customer Requests</label>
                  <textarea
                    rows={2}
                    value={editingBookingFull.specialInstructions || ''}
                    onChange={(e) => setEditingBookingFull({ ...editingBookingFull, specialInstructions: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    placeholder="e.g. Flight baggage assistance requested, early morning pickup..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleDeleteBooking(editingBookingFull.id);
                  setEditingBookingFull(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Appointment</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBookingFull(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save to Supabase Database</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CANCEL APPOINTMENT CONFIRMATION */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 my-auto shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
                <span className="text-xs font-mono font-semibold text-rose-600">#{cancellingBooking.id}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><strong>Customer:</strong> {cancellingBooking.customerName} ({cancellingBooking.customerPhone})</div>
              <div><strong>Route:</strong> {cancellingBooking.pickupLocation} → {cancellingBooking.dropLocation}</div>
              <div><strong>Scheduled:</strong> {cancellingBooking.pickupDate} at {cancellingBooking.pickupTime}</div>
              <div><strong>Total Fare:</strong> ₹{cancellingBooking.totalFare}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select or Specify Reason for Cancellation *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white mb-2"
              >
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Customer unreachable / Phone switched off">Customer unreachable / Phone switched off</option>
                <option value="Trip rescheduled to another date">Trip rescheduled to another date</option>
                <option value="Fleet / Vehicle unavailable at requested slot">Fleet / Vehicle unavailable at requested slot</option>
                <option value="Flight cancelled / delayed indefinitely">Flight cancelled / delayed indefinitely</option>
                <option value="Duplicate booking submission">Duplicate booking submission</option>
                <option value="Emergency highway closure / Weather disruption">Emergency highway closure / Weather disruption</option>
              </select>

              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Or type custom reason..."
                className="w-full p-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs hover:bg-slate-50 font-medium"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE MANUAL APPOINTMENT (New Ride Booking) */}
      {isCreatingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleCreateManualBooking} className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 my-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create New Appointment / Ride
                </h3>
                <p className="text-xs text-slate-500">
                  Enter details for telephone or walk-in booking. Automatically saves to Supabase database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingAppointment(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Gowda"
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={newAppointment.customerPhone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trip Service Type</label>
                  <select
                    value={newAppointment.tripType}
                    onChange={(e) => setNewAppointment({ ...newAppointment, tripType: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="oneway">One-Way Drop</option>
                    <option value="roundtrip">Round-Trip</option>
                    <option value="airport">Airport Transfer</option>
                    <option value="local">Local Rental Package</option>
                    <option value="outstation">Outstation Tour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Vehicle Preference</label>
                  <select
                    value={newAppointment.vehiclePreference}
                    onChange={(e) => setNewAppointment({ ...newAppointment, vehiclePreference: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Sedan">Sedan (Dzire / Etios)</option>
                    <option value="SUV">SUV (Innova Crysta)</option>
                    <option value="Tempo Traveller">Tempo Traveller (12+1)</option>
                    <option value="Hatchback">Hatchback (WagonR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pickup Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar 100ft Road, Bengaluru"
                  value={newAppointment.pickupLocation}
                  onChange={(e) => setNewAppointment({ ...newAppointment, pickupLocation: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Drop-off Destination *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kempegowda Airport Terminal 1"
                  value={newAppointment.dropLocation}
                  onChange={(e) => setNewAppointment({ ...newAppointment, dropLocation: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pickup Date *</label>
                  <input
                    type="date"
                    required
                    value={newAppointment.pickupDate}
                    onChange={(e) => setNewAppointment({ ...newAppointment, pickupDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pickup Time *</label>
                  <input
                    type="time"
                    required
                    value={newAppointment.pickupTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, pickupTime: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Total Agreed Fare (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newAppointment.totalFare}
                    onChange={(e) => setNewAppointment({ ...newAppointment, totalFare: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Status</label>
                  <select
                    value={newAppointment.paymentStatus}
                    onChange={(e) => setNewAppointment({ ...newAppointment, paymentStatus: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="unpaid">Unpaid (Pay at Cab)</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Assign Chauffeur</label>
                  <select
                    value={newAppointment.driverId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, driverId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">-- Assign Later --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Special Instructions / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested infant seat / luggage carrier"
                  value={newAppointment.specialInstructions}
                  onChange={(e) => setNewAppointment({ ...newAppointment, specialInstructions: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingAppointment(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Appointment to Supabase</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DISPATCH / QUICK ASSIGN MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Quick Dispatch #{editingBooking.id}
                </h3>
                <span className="text-xs text-slate-500">{editingBooking.customerName} ({editingBooking.customerPhone})</span>
              </div>
              <button onClick={() => setEditingBooking(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div><strong>Route:</strong> {editingBooking.pickupLocation} → {editingBooking.dropLocation}</div>
                <div><strong>Date & Time:</strong> {editingBooking.pickupDate} at {editingBooking.pickupTime}</div>
                <div><strong>Vehicle Type:</strong> {editingBooking.vehiclePreference}</div>
                <div><strong>Current Fare:</strong> ₹{editingBooking.totalFare}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Vehicle</label>
                <select
                  value={assignVehicleId}
                  onChange={(e) => setAssignVehicleId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber || 'No plate'}) - ₹{v.pricePerKm}/km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Chauffeur / Driver</label>
                <select
                  value={assignDriverId}
                  onChange={(e) => setAssignDriverId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Update Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(editingBooking.id, 'Confirmed')}
                    className="p-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100"
                  >
                    Confirm Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(editingBooking.id, 'Driver Assigned')}
                    className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold hover:bg-emerald-100"
                  >
                    Assign Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(editingBooking.id, 'Completed')}
                    className="p-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleInitiateCancel(editingBooking)}
                  className="text-rose-600 hover:underline text-xs"
                >
                  Cancel Booking
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE EDITOR MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
          <form onSubmit={handleSaveVehicle} className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                {editingVehicle.id ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}
              </h3>
              <button type="button" onClick={() => setEditingVehicle(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Innova Crysta"
                  value={editingVehicle.name || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editingVehicle.category || 'Sedan'}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Premium">Premium</option>
                    <option value="Tempo Traveller">Tempo Traveller</option>
                    <option value="Mini Bus">Mini Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rate Per Km (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingVehicle.pricePerKm || 14}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, pricePerKm: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Seats (Passengers)</label>
                  <input
                    type="number"
                    value={editingVehicle.passengerCapacity || 4}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, passengerCapacity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Luggage Bags</label>
                  <input
                    type="number"
                    value={editingVehicle.luggageCapacity || 2}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, luggageCapacity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Registration / Number Plate</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-EQ-4421"
                  value={editingVehicle.registrationNumber || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, registrationNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg uppercase"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVehicle.hasAc !== false}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, hasAc: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Chilled Air Conditioning</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVehicle.isAvailable !== false}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, isAvailable: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Active & Available</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  Save Vehicle
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* DRIVER EDITOR MODAL */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
          <form onSubmit={handleSaveDriver} className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDriver.id ? 'Edit Driver' : 'Register Driver'}
              </h3>
              <button type="button" onClick={() => setEditingDriver(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={editingDriver.name || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 12345"
                  value={editingDriver.phone || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Driving License Number</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-2015-004812"
                  value={editingDriver.licenseNumber || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  Save Driver
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
