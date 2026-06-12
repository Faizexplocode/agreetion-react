/**
 * Logistics Prototype Data & Fleet Configuration
 * 
 * Mock data untuk VMS:
 * - Fleet catalog (CDE, CDD, Fuso, etc)
 * - Pricing logic
 * - 3D bin packing calculations
 */

import type {
  FleetVehicle,
  CartItemWithDimensions,
  CartVolume,
  ShippingOption,
} from "@/types";

// =============================================================================
// FLEET CATALOG
// =============================================================================

export const FLEET_CATALOG: FleetVehicle[] = [
  {
    id: "fleet-cde-001",
    name: "CDE (Box Truck)",
    type: "CDE",
    category: "ekonomis",
    description: "Truk box kecil - cocok untuk pesanan reguler hingga 500kg",
    
    dimensions: {
      length: 400,   // cm
      width: 200,
      height: 200,
    },
    
    maxWeight: 500,          // kg
    maxVolume: 16000000,     // cm³ (400×200×200)
    maxItems: 200,
    
    baseCost: 50000,         // IDR
    costPerKm: 5000,         // IDR/km
    costPerHour: 25000,      // IDR/jam
    
    perishablesOptimized: false,
    maxPerishableHours: 2,
    emoji: "📦",
  },
  
  {
    id: "fleet-cdd-001",
    name: "CDD (Refrigerated Box)",
    type: "CDD",
    category: "standar",
    description: "Truk pendingin - ideal untuk produk segar (sayuran, buah)",
    
    dimensions: {
      length: 550,   // cm
      width: 250,
      height: 250,
    },
    
    maxWeight: 1200,         // kg
    maxVolume: 34375000,     // cm³ (550×250×250)
    maxItems: 400,
    
    baseCost: 100000,        // IDR
    costPerKm: 8000,         // IDR/km
    costPerHour: 40000,      // IDR/jam
    
    perishablesOptimized: true,
    maxPerishableHours: 6,   // Ada pendingin
    emoji: "🧊",
  },
  
  {
    id: "fleet-fuso-001",
    name: "Fuso (Medium Truck)",
    type: "Fuso",
    category: "standar",
    description: "Truk medium - untuk volume besar & multiple pickup",
    
    dimensions: {
      length: 650,   // cm
      width: 280,
      height: 280,
    },
    
    maxWeight: 2500,         // kg
    maxVolume: 50960000,     // cm³ (650×280×280)
    maxItems: 800,
    
    baseCost: 150000,        // IDR
    costPerKm: 10000,        // IDR/km
    costPerHour: 50000,      // IDR/jam
    
    perishablesOptimized: false,
    maxPerishableHours: 3,
    emoji: "🚚",
  },
  
  {
    id: "fleet-truck-001",
    name: "Truck (Heavy Duty)",
    type: "Truck",
    category: "premium",
    description: "Truk besar - untuk konsolidasi pesanan besar & long-distance",
    
    dimensions: {
      length: 800,   // cm
      width: 300,
      height: 300,
    },
    
    maxWeight: 5000,         // kg
    maxVolume: 72000000,     // cm³ (800×300×300)
    maxItems: 1500,
    
    baseCost: 250000,        // IDR
    costPerKm: 12000,        // IDR/km
    costPerHour: 60000,      // IDR/jam
    
    perishablesOptimized: false,
    maxPerishableHours: 2,
    emoji: "🚛",
  },
];

// =============================================================================
// PROTOTYPE CART ITEMS (untuk demo)
// =============================================================================

export const PROTOTYPE_CART_ITEMS: CartItemWithDimensions[] = [
  {
    id: "cart-001",
    commodityId: "proto-cmod-001",
    commodityName: "Cabai Merah Premium",
    quantity: 50,
    unit: "kg",
    pricePerUnit: 45000,
    totalPrice: 2250000,
    
    dimensionsPerUnit: {
      length: 25,   // cm per 1kg
      width: 20,
      height: 15,
    },
    weightPerUnit: 1,    // 1 kg
    
    isPerishable: true,
    perishablesHours: 24,
    perishablesTemp: 10,
  },
  
  {
    id: "cart-002",
    commodityId: "proto-cmod-002",
    commodityName: "Tomat Organik",
    quantity: 30,
    unit: "kg",
    pricePerUnit: 32000,
    totalPrice: 960000,
    
    dimensionsPerUnit: {
      length: 20,
      width: 20,
      height: 12,
    },
    weightPerUnit: 1,
    
    isPerishable: true,
    perishablesHours: 18,
    perishablesTemp: 12,
  },
];

// =============================================================================
// CART VOLUME CALCULATOR
// =============================================================================

export function calculateCartVolume(
  items: CartItemWithDimensions[]
): CartVolume {
  let totalWeight = 0;
  let totalVolume = 0;
  let totalItems = 0;

  items.forEach((item) => {
    const itemWeight = item.weightPerUnit * item.quantity;
    const itemVolume =
      item.dimensionsPerUnit.length *
      item.dimensionsPerUnit.width *
      item.dimensionsPerUnit.height *
      item.quantity;

    totalWeight += itemWeight;
    totalVolume += itemVolume;
    totalItems += item.quantity;
  });

  return {
    totalItems,
    totalWeight,
    totalVolume,
  };
}

// =============================================================================
// SHIPPING OPTION CALCULATOR
// =============================================================================

export function calculateShippingOptions(
  cartItems: CartItemWithDimensions[],
  distance: number = 10, // km (default Cipanas to Jakarta Pusat ~10km)
): ShippingOption[] {
  const cartVolume = calculateCartVolume(cartItems);
  const hasPerishables = cartItems.some((item) => item.isPerishable);

  const shippingOptions: ShippingOption[] = FLEET_CATALOG.map((fleet) => {
    const weightUsed = cartVolume.totalWeight;
    const volumeUsed = cartVolume.totalVolume;

    const weightUtilization = Math.round(
      (weightUsed / fleet.maxWeight) * 100
    );
    const volumeUtilization = Math.round((volumeUsed / fleet.maxVolume) * 100);

    const isOverweight = weightUsed > fleet.maxWeight;
    const isOvervolume = volumeUsed > fleet.maxVolume;
    const isFeasible = !isOverweight && !isOvervolume;

    const warnings: string[] = [];
    if (isOverweight) warnings.push("❌ Melebihi batas berat");
    if (isOvervolume) warnings.push("❌ Melebihi batas volume");
    if (hasPerishables && !fleet.perishablesOptimized) {
      warnings.push("⚠️ Tidak ada pendingin untuk produk segar");
    }

    const distanceCost = fleet.costPerKm * distance;
    const estimatedTotalCost = fleet.baseCost + distanceCost;

    // Estimasi waktu (avg 30 km/jam)
    const estimatedHours = distance / 30;
    const estimatedDeliveryHours = Math.ceil(estimatedHours);
    const perishablesOK =
      !hasPerishables || estimatedDeliveryHours <= fleet.maxPerishableHours;

    return {
      id: `shipping-${fleet.id}`,
      vehicleId: fleet.id,
      vehicleName: fleet.name,
      category: fleet.category,
      
      baseCost: fleet.baseCost,
      distanceCost,
      estimatedTotalCost,
      
      weightUsed,
      volumeUsed,
      weightUtilization,
      volumeUtilization,
      
      isFeasible,
      warnings,
      
      estimatedDeliveryHours,
      estimatedDeliveryTime: `${estimatedDeliveryHours}-${estimatedDeliveryHours + 1} jam`,
      perishablesOK,
    };
  });

  // Sort by price (economical first)
  return shippingOptions.sort(
    (a, b) => a.estimatedTotalCost - b.estimatedTotalCost
  );
}

// =============================================================================
// RECOMMEND BEST SHIPPING OPTION
// =============================================================================

export function recommendBestShippingOption(
  options: ShippingOption[]
): ShippingOption | null {
  // Filter feasible options
  const feasibleOptions = options.filter((o) => o.isFeasible);
  if (feasibleOptions.length === 0) return null;

  // Filter perishable-safe options if needed
  const perishablesNeeded = options.some((o) => o.perishablesOK === false);
  if (perishablesNeeded) {
    const perishablesOptions = feasibleOptions.filter((o) => o.perishablesOK);
    if (perishablesOptions.length > 0) {
      return perishablesOptions[0];
    }
  }

  // Return cheapest option
  return feasibleOptions[0];
}
