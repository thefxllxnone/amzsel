'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.linkNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsapp.defaultMessage)}`;

  return (
    <aside aria-label="Floating WhatsApp contact button">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group focus:outline-hidden border-2 border-white/20"
        title="Chat on WhatsApp +91 75030 28035"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 fill-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline text-sm font-bold tracking-wide">
          Ask Deal on WhatsApp
        </span>
      </a>
    </aside>
  );
};
