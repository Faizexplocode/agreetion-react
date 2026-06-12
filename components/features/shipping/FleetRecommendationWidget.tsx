'use client';

import React, { useState, useEffect } from 'react';
import type { CartItemWithDimensions, ShippingOption } from '@/types';
import { calculateShippingOptions, recommendBestShippingOption } from '@/lib/utils/logisticsData';
import { formatRp } from '@/lib/utils/formatters';

interface FleetRecommendationWidgetProps {
  items: CartItemWithDimensions[];
  distance: number;
  selectedOptionId: string | null;
  onSelectOption: (option: ShippingOption) => void;
}

export default function FleetRecommendationWidget({
  items,
  distance,
  selectedOptionId,
  onSelectOption,
}: FleetRecommendationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const options = calculateShippingOptions(items, distance).filter((o) => o.isFeasible);
  const bestOption = recommendBestShippingOption(options);
  const hasPerishables = items.some((item) => item.isPerishable);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.id === selectedOptionId);

  // Auto-select best option on mount or when options change if nothing selected yet
  useEffect(() => {
    if (!selectedOptionId && bestOption) {
      onSelectOption(bestOption);
    }
  }, [selectedOptionId, bestOption, onSelectOption]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getVehicleEmoji = (name: string) => {
    if (name.includes("CDD")) return "🧊";
    if (name.includes("Fuso")) return "🚚";
    if (name.includes("Heavy")) return "🚛";
    return "📦";
  };

  return (
    <div className="space-y-4">
      {/* Widget Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-bold text-[var(--tanipro-forest)] flex items-center gap-1.5">
            Metode Pengiriman VMS 🚚
          </h3>
          <p className="text-xs text-[var(--tanipro-mid-gray)]">
            Algoritma 3D Packing otomatis menentukan armada terbaik.
          </p>
        </div>
        {hasPerishables && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ❄️ Cold Chain
          </span>
        )}
      </div>

      {/* Custom Dropdown Container */}
      <div className="relative">
        {/* Dropdown Trigger */}
        <div
          onClick={toggleDropdown}
          className="w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[var(--tanipro-moss)] transition-all cursor-pointer flex items-center justify-between gap-3"
        >
          {selectedOption ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[rgba(74,124,89,0.08)] flex items-center justify-center text-xl shrink-0">
                {getVehicleEmoji(selectedOption.vehicleName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-900 truncate">
                    {selectedOption.vehicleName}
                  </h4>
                  {bestOption?.id === selectedOption.id && (
                    <span className="bg-[var(--tanipro-moss)] text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Terbaik
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--tanipro-mid-gray)] mt-0.5">
                  Est. Tiba: <span className="font-semibold text-gray-700">{selectedOption.estimatedDeliveryTime}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-gray-500">
              Pilih Armada Pengiriman...
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {selectedOption && (
              <span className="font-black text-sm text-[var(--tanipro-forest)]">
                {formatRp(selectedOption.estimatedTotalCost)}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown Scrollable Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-fade-in">
            {/* Scrollable Area */}
            <div className="max-h-60 overflow-y-auto p-2 space-y-1.5 divide-y divide-gray-50">
              {options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isBest = bestOption?.id === option.id;

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      onSelectOption(option);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[rgba(74,124,89,0.06)] border border-[rgba(74,124,89,0.15)]'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                        {getVehicleEmoji(option.vehicleName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-gray-900 truncate">
                            {option.vehicleName}
                          </h5>
                          {isBest && (
                            <span className="bg-emerald-50 text-[var(--tanipro-moss)] border border-emerald-100 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                              Terbaik ⭐
                            </span>
                          )}
                        </div>
                        {/* Compact Stats bars */}
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>Berat:</span>
                            <span className="font-bold text-gray-700">{option.weightUtilization}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Vol:</span>
                            <span className="font-bold text-gray-700">{option.volumeUtilization}%</span>
                          </div>
                          <div>
                            <span>Tiba:</span>
                            <span className="font-semibold text-gray-700">{option.estimatedDeliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs text-[var(--tanipro-forest)]">
                        {formatRp(option.estimatedTotalCost)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
