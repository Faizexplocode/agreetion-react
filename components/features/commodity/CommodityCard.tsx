import React from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatRp } from '@/lib/utils/formatters';
import type { Commodity } from '@/types';

interface CommodityCardProps {
  commodity: Commodity;
  onOrder?: (commodity: Commodity) => void;
  onPreOrder?: (commodity: Commodity) => void;
  showFarmerInfo?: boolean;
  mode?: 'buyer' | 'farmer';
}

export default function CommodityCard({
  commodity,
  onOrder,
  onPreOrder,
  showFarmerInfo = true,
  mode = 'buyer',
}: CommodityCardProps) {
  const isPreOrder = commodity.is_preorder;
  const isAvailable = !isPreOrder && (commodity.stock ?? 0) > 0;

  const harvestDateStr = commodity.harvest_date
    ? new Date(commodity.harvest_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--tanipro-forest)] to-[var(--tanipro-leaf)]" />

      {/* Main content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Emoji + header */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--tanipro-moss)]/10 flex items-center justify-center text-3xl shrink-0">
            {commodity.emoji ?? '🌿'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {commodity.name}
              </h3>
              <Badge variant={isPreOrder ? 'warning' : isAvailable ? 'success' : 'danger'} dot>
                {isPreOrder ? 'Pre-Order' : isAvailable ? 'Tersedia' : 'Habis'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
              {commodity.category}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-[var(--tanipro-forest)] dark:text-[var(--tanipro-leaf)]">
            {formatRp(commodity.price)}
          </span>
          <span className="text-xs text-gray-400">/ {commodity.unit}</span>
        </div>

        {/* Stock or Harvest Date */}
        {!isPreOrder && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>📦</span>
            <span>
              Stok:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {commodity.stock} {commodity.unit}
              </span>
            </span>
          </div>
        )}
        {isPreOrder && harvestDateStr && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <span>🗓️</span>
            <span>
              Panen:{' '}
              <span className="font-semibold">{harvestDateStr}</span>
            </span>
          </div>
        )}

        {/* Farmer info */}
        {showFarmerInfo && commodity.farmer_name && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="w-6 h-6 rounded-full bg-[var(--tanipro-moss)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {commodity.farmer_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {commodity.farmer_name}
              </p>
              {commodity.farmer_city && (
                <p className="text-[10px] text-gray-400">📍 {commodity.farmer_city}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {mode === 'buyer' && (
        <div className="px-4 pb-4 flex gap-2">
          {isPreOrder ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onPreOrder?.(commodity)}
            >
              Pre-Order
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={!isAvailable}
                onClick={() => onOrder?.(commodity)}
              >
                Pesan Sekarang
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
