import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export const AndroidInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('aiv_install_banner_dismissed') === 'true';
  });
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already in standalone display mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for Android Chrome
      alert('To install AIV Travels on your Android phone:\n1. Tap the 3 dots (⋮) menu in Chrome.\n2. Tap "Install app" or "Add to Home screen".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('aiv_install_banner_dismissed', 'true');
  };

  if (isDismissed || isInstalled) return null;

  return (
    <aside 
      aria-label="Install Android App"
      className="md:hidden bg-gradient-to-r from-slate-900 to-slate-950 text-white border-b border-amber-500/30 px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          AIV
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-[11px] truncate flex items-center gap-1">
            <span>Install Android App</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans">Fast</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate">1-tap ride bookings & live tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
