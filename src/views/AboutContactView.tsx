import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Car,
  Compass,
  Users
} from 'lucide-react';
import { BusinessProfile } from '../types/travel';
import { TravelStore } from '../services/storage';

interface AboutContactViewProps {
  business: BusinessProfile;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({ business }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    TravelStore.addEnquiry({
      name,
      phone,
      email: email || undefined,
      message,
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. ABOUT SECTION */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            About {business.name}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900">
            Dedicated to Safe & Comfortable Travel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            A customer-first cab rental and travel agency operating from Bengaluru, dedicated to transparent pricing, courteous chauffeurs, and reliable schedules.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              At <strong>{business.name}</strong>, our founding principle is simple: <em>"Your Journey, Our Responsibility."</em> We understand that whether you are stepping out for an urgent early morning airport flight or taking your family on an annual hill retreat, you need a travel partner who respects your time and comfort.
            </p>
            <p>
              We provide comprehensive transportation solutions including one-way city cabs, round-trip car rentals, airport pickups and drops, and multi-day outstation touring vehicles. Every vehicle in our fleet is maintained to commercial transport safety standards, properly insured, and manned by an experienced chauffeur trained in defensive driving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Transparent Meter Rates</h4>
              <p className="text-xs text-slate-500">
                Clear per-kilometer tariffs, documented driver allowances, and exact toll breakdowns with no hidden surge fees.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Punctual Chauffeurs</h4>
              <p className="text-xs text-slate-500">
                Drivers arrive 15 minutes before the pickup time to ensure your flight or appointment is never compromised.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">24/7 Dispatch Desk</h4>
              <p className="text-xs text-slate-500">
                Round-the-clock support desk reachable via call and WhatsApp to assist you throughout your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTACT & ENQUIRY SECTION */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            Direct Communication
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Get in Touch with Our Travel Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about an upcoming trip, corporate booking, or custom outstation tour? Send us a message or reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Official Business Information
              </h3>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Office Address</span>
                    <span className="text-slate-600 leading-relaxed">{business.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Phone Support (Call Directly)</span>
                    <a 
                      href={`tel:${business.phone}`} 
                      className="text-slate-800 hover:text-emerald-700 font-semibold font-mono text-sm hover:underline inline-block mt-0.5"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Email Address</span>
                    <a href={`mailto:${business.email}`} className="text-slate-600 hover:text-slate-900 font-medium">{business.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Operating Hours</span>
                    <span className="text-slate-600">{business.openingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${business.whatsapp}?text=Hello%20AIV%20Travels,%20I%20would%20like%20to%20enquire%20about%20a%20cab%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps Profile</span>
              </a>
            </div>
          </div>

          {/* Interactive Enquiry Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Enquiry Successfully Sent!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for reaching out to AIV Travels. Our dispatch coordinator will review your request and get in touch with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Send Travel Enquiry / Quote Request
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9845012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Message / Requirement *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your trip: dates, passenger count, vehicle preference, or specific tour requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Travel Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. POLICIES & TERMS */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Booking Policies & Transparency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div>
            <span className="font-bold text-slate-800 block mb-1">Cancellation Policy</span>
            <p>
              Free cancellation up to 6 hours before scheduled pickup time for local rides, and 12 hours for outstation trips. Cancellations within the window may incur nominal base driver compensation.
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">Toll, Parking & State Tax</span>
            <p>
              Toll taxes, parking fees, and interstate permit charges are calculated transparently and billed as per actual FASTag receipts or physical toll gate tickets.
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-1">Luggage & Passenger Safety</span>
            <p>
              All passengers must adhere to standard seating capacities. Seatbelts are mandatory for all occupants. Commercial carrier rules apply for oversized rooftop baggage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
