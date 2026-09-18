'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Tag, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

interface HeroProps {
  onExploreClick: () => void;
  onCategoriesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onCategoriesClick }) => {
  return (
    <section id="hero" className="relative bg-gradient-to-b from-orange-50/60 via-white to-white overflow-hidden py-12 sm:py-16 md:py-20">
      
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Content Left Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-brand-700 text-xs sm:text-sm font-semibold border border-orange-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>HANDPICKED DAILY DEALS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              <span className="block text-brand-600">UP TO 70% OFF</span>
              <span>ON AMAZON DEALS</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {SITE_CONFIG.subtagline}
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Verified Deal Links</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct Amazon Purchases</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Instant WhatsApp Support</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>EXPLORE DEALS</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onCategoriesClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-base px-6 py-3.5 rounded-xl border border-gray-300 shadow-xs transition-all"
              >
                <span>VIEW CATEGORIES</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Composition Right Column */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xl relative z-20">
                <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
                    alt="Featured Deal - Portable Bluetooth Speaker"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    SAVE 64% OFF
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-white/40 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ELECTRONIC</p>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">Mini Portable Speaker</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 line-through">₹2,499</p>
                      <p className="text-base font-extrabold text-brand-600">₹899</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Deal Badge 1 */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-amber-400 text-gray-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg border-2 border-white z-30 transform rotate-3 flex items-center gap-1.5">
                <span>🔥</span>
                <span>FLASHSALE 70% OFF</span>
              </div>

              {/* Floating Deal Badge 2 */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 z-30 flex items-center gap-3 max-w-[220px]">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80"
                    alt="Wireless Earbuds"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-500 truncate">Wireless Earbuds</p>
                  <p className="text-xs font-extrabold text-emerald-600">₹1,299 <span className="text-[10px] text-gray-400 line-through">₹3,999</span></p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
