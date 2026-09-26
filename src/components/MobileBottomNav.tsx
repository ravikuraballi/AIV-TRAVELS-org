import React, { useState } from 'react';
import { 
  Home, 
  Car, 
  Plane, 
  Compass, 
  PhoneCall, 
  MessageSquare, 
  X, 
  PlusCircle,
  ShieldCheck 
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { BusinessProfile } from '../types/travel';

interface MobileBottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onBookNow: () => void;
  business: BusinessProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onBookNow,
  business,
}) => {
  const [showCallSheet, setShowCallSheet] = useState(false);

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { tab: 'cab-booking', label: 'Book Cab', icon: <Car className="w-5 h-5" /> },
    { tab: 'airport-outstation', label: 'Airport', icon: <Plane className="w-5 h-5" /> },
    { tab: 'track-booking', label: 'Track', icon: <Compass className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Quick Action Bottom Sheet for Call / WhatsApp */}
      {showCallSheet && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-end justify-center md:hidden animate-fade-in">
          <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  AIV
                </div>
                <div>
                  <h4 className="text-sm font-bold">{business.name} Travel Desk</h4>
                  <p className="text-[11px] text-slate-400">Available 24/7 for immediate dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCallSheet(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <a
                href={`tel:${business.phone}`}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Primary: {business.phone}</span>
                </div>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-mono">1-Tap Dial</span>
              </a>

              {business.alternatePhone && (
                <a
                  href={`tel:${business.alternatePhone}`}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <span>Call Alternate: {business.alternatePhone}</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">Secondary</span>
                </a>
              )}

              <a
                href={`https://wa.me/${business.whatsapp}?text=Hello%20AIV%20Travels,%20I%20would%20like%20to%20enquire%20about%20a%20cab%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:text-white font-semibold text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Chat ({business.whatsapp})</span>
                </div>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded font-mono">Chat</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCallSheet(false);
                onBookNow();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Car className="w-4 h-4" />
              <span>Or Open Instant Booking Form</span>
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Android Mobile Friendly) */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="fixed bottom-0 left-0 right-0 z-[500] md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 text-slate-400 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="grid grid-cols-5 items-center h-14 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => onSelectTab(item.tab)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive 
                    ? 'text-amber-400 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Quick Call / Support Action */}
          <button
            type="button"
            onClick={() => setShowCallSheet(true)}
            className="flex flex-col items-center justify-center py-1 text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all"
            title="Call Owner / WhatsApp"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-semibold text-emerald-400">
              Call Desk
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
