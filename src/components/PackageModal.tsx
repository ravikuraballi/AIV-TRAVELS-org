import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Check, AlertCircle, Share2, Send, ShieldCheck } from 'lucide-react';
import { TravelPackage } from '../types/travel';
import { TravelStore } from '../services/storage';

interface PackageModalProps {
  packageData: TravelPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (pkg: TravelPackage) => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [passengers, setPassengers] = useState('4');
  const [customNotes, setCustomNotes] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  if (!isOpen || !packageData) return null;

  const business = TravelStore.getBusinessProfile();

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    TravelStore.addEnquiry({
      name: customerName,
      phone: customerPhone,
      destinationInterest: packageData.title,
      travelDates: `${travelDates} (${passengers} Passengers)`,
      message: customNotes || `Interested in ${packageData.title} package starting at ₹${packageData.startingPrice}.`,
    });
    setEnquirySent(true);
  };

  const getWhatsAppPackageUrl = () => {
    const text = `*Tour Package Enquiry - ${business.name}*\n` +
      `Package: ${packageData.title}\n` +
      `Destination: ${packageData.destination}\n` +
      `Duration: ${packageData.duration}\n` +
      `Starting Price: ₹${packageData.startingPrice}\n` +
      `Name: ${customerName || 'Customer'}\n` +
      `Preferred Dates: ${travelDates || 'Flexible'}\n` +
      `Passengers: ${passengers}`;
    return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with image */}
        <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden">
          <img
            src={packageData.photoUrl}
            alt={packageData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{packageData.destination}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{packageData.duration}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {packageData.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {packageData.isDemo && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Sample Package:</strong> Itinerary and starting rate are representative examples. The business owner can customize details and publish verified pricing from the Admin Dashboard.
              </span>
            </div>
          )}

          {/* Overview */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2">
              Package Overview
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              {packageData.overview}
            </p>
          </div>

          {/* Day by Day Itinerary */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Planned Day-by-Day Itinerary
            </h3>
            <div className="space-y-3">
              {packageData.itinerary.map((item) => (
                <div key={item.day} className="flex gap-3 text-xs border-l-2 border-amber-500 pl-3 py-1">
                  <div className="font-bold text-slate-900 shrink-0">Day {item.day}:</div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.title}</span>
                    <span className="text-slate-600 mt-0.5 block leading-relaxed">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-900 block">Package Inclusions</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {packageData.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-900 block">Exclusions</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {packageData.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Package Enquiry Form */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 block">Starting From</span>
                <span className="text-xl font-bold font-display text-white">
                  ₹{packageData.startingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 block">Dedicated AC cab + all tolls & driver allowances</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNow(packageData);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors"
              >
                Book Package Cab Now
              </button>
            </div>

            {enquirySent ? (
              <div className="p-3 bg-emerald-900/60 border border-emerald-700 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                <span>Thank you! Your enquiry has been received. Our team will contact you shortly.</span>
                <a
                  href={getWhatsAppPackageUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center gap-1 text-white underline font-semibold"
                >
                  <Share2 className="w-3 h-3" />
                  WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-slate-300 block">
                  Quick Package Enquiry & Custom Quote
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Travel Date / Month"
                    value={travelDates}
                    onChange={(e) => setTravelDates(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <a
                    href={getWhatsAppPackageUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Enquire Directly on WhatsApp
                  </a>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    Send Enquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
