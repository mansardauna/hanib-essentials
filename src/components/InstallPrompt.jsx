'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed it this session or it's installed
    const hasDismissed = sessionStorage.getItem('installPromptDismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isStandalone) return; // Already installed
    
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (!hasDismissed) {
      // Show it after a small delay so it's not jarring
      setTimeout(() => setShowPrompt(true), 2000);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("To install: tap the Share button at the bottom of your screen, then select 'Add to Home Screen'.");
    } else {
      alert("To install: tap the menu icon (3 dots) in your browser and select 'Install app' or 'Add to Home screen'.");
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 left-0 w-full px-4 z-[9999] md:hidden flex justify-center pointer-events-none">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 border border-brand-200 animate-bounce-slight flex items-center gap-3 pointer-events-auto relative">
        <div className="bg-brand-50 p-2.5 rounded-xl text-brand-600 shrink-0">
          <Download size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">Install App</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">Add to home screen</p>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-brand-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-brand-600 transition-colors shrink-0"
        >
          Install
        </button>
        <button onClick={handleClose} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:bg-slate-700">
          <X size={14} />
        </button>
      </div>
      <style jsx>{`
        .animate-bounce-slight {
          animation: bounce-slight 2s ease-in-out infinite;
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
}
