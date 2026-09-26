import React, { useState } from 'react';
import { Menu, X, Compass, PhoneCall, ShieldCheck } from 'lucide-react';
import { BusinessProfile } from '../types/travel';

export type ActiveTab = 'home' | 'cab-booking' | 'vehicles' | 'airport-outstation' | 'packages' | 'about-contact' | 'track-booking' | 'admin';

interface NavbarProps {
  business: BusinessProfile;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onBookNow: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  business,
  currentTab,
  onSelectTab,
  onBookNow,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; tab: ActiveTab }[] = [
    { label: 'Cab Booking', tab: 'cab-booking' },
    { label: 'Vehicles', tab: 'vehicles' },
    { label: 'Airport & Outstation', tab: 'airport-outstation' },
    { label: 'Tour Packages', tab: 'packages' },
    { label: 'About & Contact', tab: 'about-contact' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group flex items-center gap-2 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-amber-500 font-bold text-lg font-display tracking-tight transition-transform group-hover:scale-105">
                A
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                {business.name}
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  currentTab === item.tab
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
                {currentTab === item.tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => handleNavClick('track-booking')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'track-booking'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Track Trip</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Open Admin & Booking Management Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Panel</span>
            </button>

            <a
              href={`tel:${business.phone}`}
              className="hidden xl:flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 rounded-lg px-3 py-2 font-medium transition-colors"
              title={`Call AIV Travels: ${business.phone}`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{business.phone}</span>
            </a>

            <button
              onClick={onBookNow}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs hover:shadow"
            >
              Book Your Ride
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onBookNow}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentTab === 'home' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          {navLinks.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentTab === item.tab ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('track-booking')}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Track Booking / Customer Portal</span>
              <Compass className="w-4 h-4 text-amber-600" />
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              Owner & Admin Dashboard
            </button>
            <a
              href={`tel:${business.phone}`}
              className="w-full text-center px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              Call {business.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
