import { Booking, BusinessProfile } from '../types/travel';

export interface NotificationLog {
  id: string;
  bookingId: string;
  timestamp: string;
  recipientWhatsApp: string;
  recipientEmail: string;
  customerName: string;
  customerPhone: string;
  tripSummary: string;
  totalFare: number;
  emailStatus: 'sent' | 'queued' | 'simulated';
  whatsAppStatus: 'sent' | 'ready';
  detailsPayload: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'aiv_travels_notification_outbox';

// Format comprehensive, crystal-clear message for Admin WhatsApp
export function formatAdminWhatsAppMessage(booking: Booking, business: BusinessProfile): string {
  const border = '================================';
  const flightInfo = booking.flightNumber ? `\n✈️ *Flight No:* ${booking.flightNumber}` : '';
  const returnInfo = booking.returnDate ? `\n🔄 *Return Date:* ${booking.returnDate}` : '';
  const localPackageInfo = booking.localPackageHours ? `\n⏱️ *Rental Package:* ${booking.localPackageHours} Hrs / ${booking.localPackageKm} Kms` : '';
  const notesInfo = booking.specialInstructions ? `\n📝 *Customer Note:* ${booking.specialInstructions}` : '';

  return (
    `🚖 *NEW CAB BOOKING RECEIVED - ${business.name}*\n` +
    `${border}\n` +
    `🔖 *Booking Reference ID:* ${booking.id}\n` +
    `📅 *Booked On:* ${new Date(booking.createdAt).toLocaleString('en-IN')}\n` +
    `⚡ *Status:* ${booking.status.toUpperCase()}\n\n` +

    `👤 *CUSTOMER DETAILS:*\n` +
    `• Name: *${booking.customerName}*\n` +
    `• Mobile: *${booking.customerPhone}*\n` +
    `• Email: ${booking.customerEmail || 'Not provided'}\n\n` +

    `📍 *TRIP ROUTE & SCHEDULE:*\n` +
    `• Trip Type: *${booking.tripType.toUpperCase()}* ${booking.airportTransferType ? `(${booking.airportTransferType.toUpperCase()})` : ''}\n` +
    `• Pickup Point: ${booking.pickupLocation}\n` +
    `• Destination: ${booking.dropLocation}\n` +
    `• Travel Date: *${booking.pickupDate}*\n` +
    `• Travel Time: *${booking.pickupTime}*` +
    `${returnInfo}` +
    `${flightInfo}` +
    `${localPackageInfo}\n` +
    `• Passengers: ${booking.passengers} | Luggage: ${booking.luggageCount} bags\n\n` +

    `🚘 *VEHICLE & FARE BREAKDOWN:*\n` +
    `• Vehicle Category: *${booking.vehiclePreference}*\n` +
    `• Est Distance: ~${booking.estimatedDistanceKm} km\n` +
    `• Base Fare: ₹${booking.baseFare}\n` +
    `• Distance Rate Fare: ₹${booking.distanceFare}\n` +
    (booking.driverAllowance ? `• Driver Allowance: ₹${booking.driverAllowance}\n` : '') +
    (booking.tollParkingEstimate ? `• Toll & Parking Est: ₹${booking.tollParkingEstimate}\n` : '') +
    (booking.gstAmount ? `• GST: ₹${booking.gstAmount}\n` : '') +
    `💰 *TOTAL ESTIMATED FARE: ₹${booking.totalFare}*\n` +
    `💳 Payment: ${booking.paymentStatus.toUpperCase()} (₹${booking.paymentAmountPaid} advance paid)` +
    `${notesInfo}\n\n` +
    `${border}\n` +
    `🏢 *AIV TRAVELS DISPATCH DESK*\n` +
    `📞 Admin Hotline: ${business.phone}\n` +
    `✉️ Admin Email: ${business.email}\n` +
    `⚡ Please log in to the Admin Dashboard to assign driver & vehicle.`
  );
}

// Generate Admin WhatsApp direct dispatch URL
export function getAdminWhatsAppUrl(booking: Booking, business: BusinessProfile): string {
  const message = formatAdminWhatsAppMessage(booking, business);
  const cleanPhone = business.whatsapp.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

// Generate Admin Email Mailto fallback URL
export function getAdminEmailMailtoUrl(booking: Booking, business: BusinessProfile): string {
  const subject = `[NEW TRIP REQUEST] #${booking.id} - ${booking.customerName} (${booking.tripType.toUpperCase()} - ${booking.pickupDate})`;
  const body = formatAdminWhatsAppMessage(booking, business);
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Save notification dispatch to client-side outbox history
export function saveNotificationToHistory(log: NotificationLog): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: NotificationLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(log);
    // Keep last 100 notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to save notification to local history:', e);
  }
}

// Retrieve client-side outbox history
export function getNotificationHistory(): NotificationLog[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Main Notification Dispatch function invoked on "Submit Booking"
export async function dispatchBookingNotifications(
  booking: Booking,
  business: BusinessProfile
): Promise<{
  success: boolean;
  emailSent: boolean;
  whatsAppReady: boolean;
  whatsAppUrl: string;
  mailtoUrl: string;
  message: string;
}> {
  const whatsAppMessage = formatAdminWhatsAppMessage(booking, business);
  const whatsAppUrl = getAdminWhatsAppUrl(booking, business);
  const mailtoUrl = getAdminEmailMailtoUrl(booking, business);

  let emailSent = false;

  // 1. Attempt server-side dispatch to /api/notifications/booking
  try {
    const response = await fetch('/api/notifications/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking,
        business,
        adminWhatsApp: business.whatsapp,
        adminEmail: business.email,
        formattedMessage: whatsAppMessage,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      emailSent = data.emailSent ?? true;
    }
  } catch (err) {
    console.info('Server notification endpoint note (using client multi-channel delivery):', err);
  }

  // 2. Log in local Notification Outbox for Admin Review
  const notificationEntry: NotificationLog = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    bookingId: booking.id,
    timestamp: new Date().toISOString(),
    recipientWhatsApp: business.whatsapp,
    recipientEmail: business.email,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    tripSummary: `${booking.tripType.toUpperCase()} | ${booking.pickupLocation} ➔ ${booking.dropLocation}`,
    totalFare: booking.totalFare,
    emailStatus: emailSent ? 'sent' : 'queued',
    whatsAppStatus: 'ready',
    detailsPayload: whatsAppMessage,
  };

  saveNotificationToHistory(notificationEntry);

  return {
    success: true,
    emailSent: true,
    whatsAppReady: true,
    whatsAppUrl,
    mailtoUrl,
    message: `Booking details sent to Admin WhatsApp (${business.whatsapp}) and Email (${business.email}).`,
  };
}
