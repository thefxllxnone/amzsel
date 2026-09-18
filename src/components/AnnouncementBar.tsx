import React from 'react';
import { SITE_CONFIG } from '@/config/site';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-amazon-navy text-white text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide border-b border-gray-800 flex items-center justify-center gap-2">
      <span className="inline-block animate-pulse">🔥</span>
      <span>{SITE_CONFIG.announcement}</span>
    </div>
  );
};
