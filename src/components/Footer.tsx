import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { BusinessProfile } from '../types/travel';
import { ActiveTab } from './Navbar';

interface FooterProps {
  business: BusinessProfile;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ business, onSelectTab }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 font-bold font-display">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                {business.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {business.tagline}. Professional cab bookings, outstation chauffeur services, prompt airport transfers, and customized holiday packages.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${business.whatsapp}?text=Hello%20AIV%20Travels,%20I%20would%20like%20to%20enquire%20about%20a%20cab%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Services & Fleet
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectTab('cab-booking')} className="hover:text-white transition-colors">
                  Local & One-Way Cabs
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('airport-outstation')} className="hover:text-white transition-colors">
                  Airport Transfers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('airport-outstation')} className="hover:text-white transition-colors">
                  Outstation Highway Trips
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('vehicles')} className="hover:text-white transition-colors">
                  Vehicle Fleet Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('packages')} className="hover:text-white transition-colors">
                  Curated Tour Packages
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('track-booking')} className="hover:text-white transition-colors">
                  Trip Lookup & Status
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Official Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{business.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <a href={`tel:${business.phone}`} className="hover:text-white transition-colors font-medium">
                  {business.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-white transition-colors">
                  {business.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{business.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Business Verification & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Verification & Listing
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Business profile details, pricing models, and vehicle capacities are configured according to official travel standards and Google Maps records.
            </p>
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300"
              >
                <span>View Google Maps Listing</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => onSelectTab('admin')}
                className="text-left text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Owner Portal & Dispatch Admin
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {currentYear} {business.name}. All rights reserved.</span>
            <span>·</span>
            <span>Fares subject to business booking confirmation.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => onSelectTab('about-contact')} className="hover:text-slate-300 transition-colors">
              Terms & Policies
            </button>
            <span>·</span>
            <button onClick={() => onSelectTab('about-contact')} className="hover:text-slate-300 transition-colors">
              Cancellation Policy
            </button>
            <span>·</span>
            <button onClick={() => onSelectTab('admin')} className="text-slate-400 hover:text-slate-200 transition-colors">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
