import React from 'react';
import { ShieldAlert, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';
import { BusinessProfile } from '../types/travel';

interface VerificationNoticeProps {
  business: BusinessProfile;
  onOpenAdmin: (tab?: string) => void;
}

export const VerificationNotice: React.FC<VerificationNoticeProps> = ({ business, onOpenAdmin }) => {
  return (
    <aside aria-label="Business Verification Notice" className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {business.isVerified ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified AIV Travels Business Profile
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Listing Details Pending Verification
            </span>
          )}
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400">
            {business.isVerified 
              ? 'Official Google Maps verified travel & cab service' 
              : 'Rates, vehicle inventory & contact details are administrator-editable to match official Google Maps listing.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={business.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            Google Maps Listing
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => onOpenAdmin('settings')}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <Sliders className="w-3 h-3" />
            Admin Settings
          </button>
        </div>
      </div>
    </aside>
  );
};
