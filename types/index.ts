export type UserRole = 'farmer' | 'buyer' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type NotifType = 'info' | 'warning' | 'success' | 'error';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  setup_complete: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  // Farmer fields
  farm_name?: string;
  city?: string;
  province?: string;
  farm_size?: string;
  exp_years?: string;
  commodities?: string[];
  bank_name?: string;
  bank_account?: string;
  // Buyer fields
  company_name?: string;
  business_type?: string;
  company_address?: string;
  npwp?: string;
}

export interface SessionUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  setup_complete: boolean;
  logged_in_at: string;
}

export interface Commodity {
  id: string;
  farmer_id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  is_preorder: boolean;
  is_available: boolean;
  emoji: string;
  description?: string;
  harvest_date?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  farmer_name?: string;
  farm_name?: string;
  farmer_city?: string;
  farmer_rating?: number;
}

export interface Order {
  id: string;
  order_code: string;
  buyer_id: string;
  farmer_id: string;
  commodity_id: string;
  commodity_name: string;
  quantity: number;
  unit: string;
  total_price: number;
  platform_fee: number;
  status: OrderStatus;
  payment_status: 'unpaid' | 'paid';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PreOrder {
  id: string;
  buyer_id: string;
  farmer_id: string;
  commodity_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  text: string;
  type: NotifType;
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  role: UserRole;
  action: string;
  detail: string;
  created_at: string;
}

export interface OtpRecord {
  email: string;
  code: string;
  expires: string;
  used: boolean;
}

export interface Delivery {
  order_id: string;
  status: string;
  courier?: string;
  tracking_number?: string;
  estimated_date?: string;
  updated_at: string;
}

export interface FinanceSummary {
  completed: number;
  totalRevenue: number;
  pending: number;
  pendingAmount: number;
  allOrders: Order[];
}

export interface AdminFinancialSummary {
  totalVolume: number;
  completedVolume: number;
  pendingVolume: number;
  platformFee: number;
  preorderFee: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  statusBreakdown: Record<string, number>;
  topCommodities: { name: string; count: number }[];
  confirmedPreOrders: number;
}


// =============================================================================
// SMART LOGISTICS & VEHICLE MANAGEMENT SYSTEM (VMS)
// =============================================================================

export type VehicleType = 'CDE' | 'CDD' | 'Fuso' | 'Truck' | 'Motorcycle';
export type VehicleCategory = 'ekonomis' | 'standar' | 'premium';

export interface FleetVehicle {
  id: string;
  name: string;
  type: VehicleType;
  category: VehicleCategory;
  description: string;
  
  // Dimensi (cm)
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  
  // Kapasitas
  maxWeight: number;        // kg
  maxVolume: number;        // cm³
  maxItems: number;         // count
  
  // Biaya
  baseCost: number;         // IDR
  costPerKm: number;        // IDR/km
  costPerHour: number;      // IDR/jam
  
  // Fitur
  perishablesOptimized: boolean;
  maxPerishableHours: number;
  emoji: string;
}

export interface CartItemWithDimensions {
  id: string;
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  
  // Dimensi per unit (cm)
  dimensionsPerUnit: {
    length: number;
    width: number;
    height: number;
  };
  weightPerUnit: number;    // kg
  
  // Perishable info
  isPerishable: boolean;
  perishablesHours?: number;
  perishablesTemp?: number;
}

export interface CartVolume {
  totalItems: number;
  totalWeight: number;      // kg
  totalVolume: number;      // cm³
  estimatedDimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ShippingOption {
  id: string;
  vehicleId: string;
  vehicleName: string;
  category: VehicleCategory;
  
  // Harga
  baseCost: number;
  distanceCost: number;
  estimatedTotalCost: number;
  
  // Utilization
  weightUsed: number;
  volumeUsed: number;
  weightUtilization: number;  // %
  volumeUtilization: number;  // %
  
  // Feasibility
  isFeasible: boolean;
  warnings: string[];
  
  // Estimasi
  estimatedDeliveryHours: number;
  estimatedDeliveryTime: string;
  perishablesOK: boolean;
}

export interface ShippingQuote {
  cartItems: CartItemWithDimensions[];
  cartVolume: CartVolume;
  distance: number;           // km
  
  recommendedOption: ShippingOption;
  allOptions: ShippingOption[];
  
  perishablesAlert?: {
    hasPerishables: boolean;
    maxDeliveryHours: number;
    message: string;
  };
}
