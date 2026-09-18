'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';
import { MessageSquare, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.linkNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsapp.defaultMessage)}`;

  return (
    <footer className="bg-amazon-dark text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amazon-orange to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                AS
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                AMAZON <span className="text-amazon-orange">SELLER</span>
              </span>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Your independent discovery hub for top handpicked Amazon deals, discounts, and trending product offers.
            </p>

            <div className="p-3 bg-amazon-navy rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amazon-orange" />
                <span>INDEPENDENT DEALS SITE</span>
              </p>
              <p>
                This is an independent demo website discovering Amazon deals. Not affiliated with Amazon or Amazon logos.
              </p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Browse Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {SITE_CONFIG.categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      const elem = document.getElementById('deals');
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-amazon-orange transition-colors text-left"
                  >
                    {cat} Deals
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Direct Contact / WhatsApp */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Direct Contact
            </h3>
            <div className="space-y-3 text-xs">
              <p className="text-gray-400">
                Have questions about a listed deal or want to inquiry about bulk product availability?
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>{SITE_CONFIG.whatsapp.rawNumber}</span>
              </a>

              <p className="text-[11px] text-gray-500">
                Instant response during business hours
              </p>
            </div>
          </div>

          {/* Col 4: Quick Links & Admin */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Back to Top
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-white transition-colors">
                  Featured Offers
                </a>
              </li>
              <li>
                <a href="#deals" className="hover:text-white transition-colors">
                  Today's Deals
                </a>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amazon-orange hover:text-amber-400"
                >
                  <span>Admin Login Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Footer Line */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AMAZON SELLER Deals. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Designed for optimal deal discovery</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
