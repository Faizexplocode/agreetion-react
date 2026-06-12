/**
 * Prototype Data — Interconnected Dummy Data for Frontend Demo
 *
 * This file contains readonly reference data used as fallback when Firebase is empty.
 * Data is designed to be realistic and interconnected for seamless demonstration.
 * All prices are in Indonesian Rupiah (IDR).
 *
 * Demo Users:
 * - Farmer: Sido Hartono (sido@tanipro.id) — farmer_id: "demo-farmer-001"
 * - Buyer: Budi Kusuma / PT Jaya Makmur (ptjaya@tanipro.id) — buyer_id: "demo-buyer-001"
 * - Admin: Admin TaniPro (admin@tanipro.id) — admin_id: "demo-admin-001"
 */

import type {
  Commodity,
  Order,
  ActivityLog,
  FinanceSummary,
  User,
  AdminFinancialSummary,
} from "@/types";

// =============================================================================
// DEMO USERS (Farmer, Buyer, Admin)
// =============================================================================

export const DEMO_FARMER: User = {
  id: "demo-farmer-001",
  full_name: "Sido Hartono",
  email: "sido@tanipro.id",
  phone: "08123456789",
  role: "farmer",
  status: "active",
  setup_complete: true,
  email_verified: true,
  created_at: "2024-01-15T08:00:00.000Z",
  farm_name: "Pertanian Sido Jaya",
  city: "Cipanas",
  province: "Jawa Barat",
  farm_size: "2 hektare",
  exp_years: "8",
  bank_name: "BRI",
  bank_account: "123456789012",
};

export const DEMO_BUYER: User = {
  id: "demo-buyer-001",
  full_name: "Budi Kusuma",
  email: "ptjaya@tanipro.id",
  phone: "08198765432",
  role: "buyer",
  status: "active",
  setup_complete: true,
  email_verified: true,
  created_at: "2024-02-01T10:00:00.000Z",
  company_name: "PT Jaya Makmur",
  business_type: "Distributor Sayuran",
  company_address: "Jl. Pasar Senin No. 42, Jakarta Pusat",
  npwp: "12.345.678.9-012.000",
};

export const DEMO_ADMIN: User = {
  id: "demo-admin-001",
  full_name: "Admin TaniPro",
  email: "admin@tanipro.id",
  phone: "082123456789",
  role: "admin",
  status: "active",
  setup_complete: true,
  email_verified: true,
  created_at: "2024-01-01T00:00:00.000Z",
};

// =============================================================================
// PROTOTYPE COMMODITIES
// =============================================================================

export const PROTOTYPE_COMMODITIES: Commodity[] = [
  {
    id: "proto-cmod-001",
    farmer_id: "demo-farmer-001",
    name: "Cabai Merah Premium",
    category: "sayuran",
    unit: "kg",
    price: 45000,
    stock: 250,
    is_preorder: false,
    is_available: true,
    emoji: "🌶️",
    description:
      "Cabai merah segar pilihan dari hasil panen langsung. Cocok untuk restoran, katering, dan industri olahan. Kesegaran terjamin hingga 7 hari.",
    created_at: "2024-06-01T08:30:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
  {
    id: "proto-cmod-002",
    farmer_id: "demo-farmer-001",
    name: "Tomat Organik",
    category: "sayuran",
    unit: "kg",
    price: 32000,
    stock: 180,
    is_preorder: false,
    is_available: true,
    emoji: "🍅",
    description:
      "Tomat organik tanpa pestisida kimia. Ideal untuk restoran organik dan konsumen health-conscious. Panen setiap 3 hari.",
    created_at: "2024-05-28T07:15:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
  {
    id: "proto-cmod-003",
    farmer_id: "demo-farmer-001",
    name: "Jagung Manis",
    category: "biji-bijian",
    unit: "kg",
    price: 28000,
    stock: 320,
    is_preorder: false,
    is_available: true,
    emoji: "🌽",
    description:
      "Jagung manis berkualitas premium dengan kadar gula tinggi. Cocok untuk pasar modern dan industri pangan. Hasil panen pagi.",
    created_at: "2024-06-02T06:00:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
  {
    id: "proto-cmod-004",
    farmer_id: "demo-farmer-001",
    name: "Bawang Merah",
    category: "rempah",
    unit: "kg",
    price: 52000,
    stock: 150,
    is_preorder: false,
    is_available: true,
    emoji: "🧅",
    description:
      "Bawang merah premium dengan ukuran konsisten. Tahan lama hingga 2 bulan jika disimpan dengan benar. Cocok untuk distributor.",
    created_at: "2024-05-25T09:00:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
  {
    id: "proto-cmod-005",
    farmer_id: "demo-farmer-001",
    name: "Kentang Unggul (Pre-Order)",
    category: "umbi",
    unit: "kg",
    price: 35000,
    stock: 500,
    is_preorder: true,
    is_available: true,
    emoji: "🥔",
    description:
      "Kentang berkualitas ekspor dengan standar internasional. Tersedia pre-order untuk pembelian dalam jumlah besar. Panen: Minggu pertama Juli.",
    harvest_date: "2024-07-05T00:00:00.000Z",
    created_at: "2024-05-20T11:00:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
  {
    id: "proto-cmod-006",
    farmer_id: "demo-farmer-001",
    name: "Terong Ungu",
    category: "sayuran",
    unit: "kg",
    price: 24000,
    stock: 200,
    is_preorder: false,
    is_available: true,
    emoji: "🫑",
    description:
      "Terong ungu segar dengan kualitas premium. Cocok untuk pasar tradisional dan modern. Panen setiap 2 hari.",
    created_at: "2024-06-03T07:30:00.000Z",
    farmer_name: "Sido Hartono",
    farm_name: "Pertanian Sido Jaya",
    farmer_city: "Cipanas",
    farmer_rating: 4.8,
  },
];

// =============================================================================
// PROTOTYPE ORDERS
// =============================================================================

export const PROTOTYPE_ORDERS: Order[] = [
  // Completed orders (untuk revenue calculation)
  {
    id: "proto-ord-001",
    order_code: "ORD-20240610-0001",
    buyer_id: "demo-buyer-001",
    farmer_id: "demo-farmer-001",
    commodity_id: "proto-cmod-001",
    commodity_name: "Cabai Merah Premium",
    quantity: 50,
    unit: "kg",
    total_price: 2250000,
    platform_fee: 45000, // 2%
    status: "completed",
    payment_status: "paid",
    created_at: "2024-06-05T09:15:00.000Z",
    updated_at: "2024-06-08T14:30:00.000Z",
  },
  {
    id: "proto-ord-002",
    order_code: "ORD-20240609-0002",
    buyer_id: "demo-buyer-001",
    farmer_id: "demo-farmer-001",
    commodity_id: "proto-cmod-002",
    commodity_name: "Tomat Organik",
    quantity: 75,
    unit: "kg",
    total_price: 2400000,
    platform_fee: 48000,
    status: "completed",
    payment_status: "paid",
    created_at: "2024-06-02T10:00:00.000Z",
    updated_at: "2024-06-06T16:45:00.000Z",
  },
  // Active orders
  {
    id: "proto-ord-003",
    order_code: "ORD-20240610-0003",
    buyer_id: "demo-buyer-001",
    farmer_id: "demo-farmer-001",
    commodity_id: "proto-cmod-003",
    commodity_name: "Jagung Manis",
    quantity: 100,
    unit: "kg",
    total_price: 2800000,
    platform_fee: 56000,
    status: "confirmed",
    payment_status: "paid",
    notes: "Pengiriman hari Jumat pagi",
    created_at: "2024-06-10T08:30:00.000Z",
  },
  {
    id: "proto-ord-004",
    order_code: "ORD-20240610-0004",
    buyer_id: "demo-buyer-001",
    farmer_id: "demo-farmer-001",
    commodity_id: "proto-cmod-004",
    commodity_name: "Bawang Merah",
    quantity: 30,
    unit: "kg",
    total_price: 1560000,
    platform_fee: 31200,
    status: "processing",
    payment_status: "paid",
    notes: "Dalam persiapan pengiriman",
    created_at: "2024-06-09T11:00:00.000Z",
  },
  {
    id: "proto-ord-005",
    order_code: "ORD-20240608-0005",
    buyer_id: "demo-buyer-001",
    farmer_id: "demo-farmer-001",
    commodity_id: "proto-cmod-001",
    commodity_name: "Cabai Merah Premium",
    quantity: 25,
    unit: "kg",
    total_price: 1125000,
    platform_fee: 22500,
    status: "pending",
    payment_status: "unpaid",
    created_at: "2024-06-08T14:20:00.000Z",
  },
];

// =============================================================================
// PROTOTYPE ACTIVITIES
// =============================================================================

export const PROTOTYPE_ACTIVITIES: ActivityLog[] = [
  {
    id: "proto-act-001",
    user_id: "demo-farmer-001",
    user_name: "Sido Hartono",
    role: "farmer",
    action: "update_order",
    detail: "Pesanan #ORD-20240610-0003 (Jagung Manis) status diperbarui menjadi confirmed",
    created_at: "2024-06-11T07:00:00.000Z",
  },
  {
    id: "proto-act-002",
    user_id: "demo-buyer-001",
    user_name: "Budi Kusuma",
    role: "buyer",
    action: "create_order",
    detail: "Membuat pesanan baru: 30kg Bawang Merah dari Sido Hartono",
    created_at: "2024-06-09T11:15:00.000Z",
  },
  {
    id: "proto-act-003",
    user_id: "demo-farmer-001",
    user_name: "Sido Hartono",
    role: "farmer",
    action: "update_commodity",
    detail: "Stok Cabai Merah Premium diperbarui: 280kg → 250kg (setelah penjualan)",
    created_at: "2024-06-08T16:30:00.000Z",
  },
  {
    id: "proto-act-004",
    user_id: "demo-buyer-001",
    user_name: "Budi Kusuma",
    role: "buyer",
    action: "payment",
    detail: "Pembayaran pesanan #ORD-20240610-0003 (Jagung Manis) berhasil - Rp2.800.000",
    created_at: "2024-06-10T09:45:00.000Z",
  },
  {
    id: "proto-act-005",
    user_id: "demo-farmer-001",
    user_name: "Sido Hartono",
    role: "farmer",
    action: "update_order",
    detail: "Pesanan #ORD-20240610-0004 (Bawang Merah) status diubah menjadi processing",
    created_at: "2024-06-09T12:00:00.000Z",
  },
  {
    id: "proto-act-006",
    user_id: "demo-buyer-001",
    user_name: "Budi Kusuma",
    role: "buyer",
    action: "create_order",
    detail: "Membuat pesanan baru: 100kg Jagung Manis dari Sido Hartono",
    created_at: "2024-06-10T08:45:00.000Z",
  },
  {
    id: "proto-act-007",
    user_id: "demo-farmer-001",
    user_name: "Sido Hartono",
    role: "farmer",
    action: "create_commodity",
    detail: "Komoditas baru ditambahkan: Terong Ungu (Rp24.000/kg, stok 200kg)",
    created_at: "2024-06-03T08:00:00.000Z",
  },
  {
    id: "proto-act-008",
    user_id: "demo-buyer-001",
    user_name: "Budi Kusuma",
    role: "buyer",
    action: "payment",
    detail: "Pembayaran pesanan #ORD-20240610-0004 (Bawang Merah) berhasil - Rp1.560.000",
    created_at: "2024-06-09T11:30:00.000Z",
  },
];

// =============================================================================
// PROTOTYPE FINANCE SUMMARY
// =============================================================================

export function generatePrototypeFinanceSummary(): FinanceSummary {
  const completedOrders = PROTOTYPE_ORDERS.filter(
    (o) => o.status === "completed"
  );
  const activeOrders = PROTOTYPE_ORDERS.filter((o) =>
    ["pending", "confirmed", "processing", "shipped", "delivered"].includes(
      o.status
    )
  );

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );
  const pendingAmount = activeOrders.reduce((sum, o) => sum + o.total_price, 0);

  return {
    completed: completedOrders.length,
    totalRevenue: totalRevenue,
    pending: activeOrders.length,
    pendingAmount: pendingAmount,
    allOrders: PROTOTYPE_ORDERS,
  };
}

// =============================================================================
// PROTOTYPE BUYER FINANCE SUMMARY
// =============================================================================

export function generatePrototypeBuyerFinanceSummary(): FinanceSummary {
  // Buyer only sees their own orders (filtered by buyer_id: demo-buyer-001)
  const buyerOrders = PROTOTYPE_ORDERS.filter(
    (o) => o.buyer_id === "demo-buyer-001"
  );
  const completedOrders = buyerOrders.filter((o) => o.status === "completed");
  const activeOrders = buyerOrders.filter((o) =>
    ["pending", "confirmed", "processing", "shipped", "delivered"].includes(
      o.status
    )
  );

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );
  const pendingAmount = activeOrders.reduce((sum, o) => sum + o.total_price, 0);

  return {
    completed: completedOrders.length,
    totalRevenue: totalRevenue,
    pending: activeOrders.length,
    pendingAmount: pendingAmount,
    allOrders: buyerOrders,
  };
}

// =============================================================================
// PROTOTYPE ADMIN FINANCIAL SUMMARY
// =============================================================================

export function generatePrototypeAdminFinanceSummary(): AdminFinancialSummary {
  const completedOrders = PROTOTYPE_ORDERS.filter(
    (o) => o.status === "completed"
  );
  const pendingOrders = PROTOTYPE_ORDERS.filter((o) =>
    ["pending", "confirmed", "processing", "shipped", "delivered"].includes(
      o.status
    )
  );
  const cancelledOrders = PROTOTYPE_ORDERS.filter(
    (o) => o.status === "cancelled"
  );

  // Calculate volumes
  const completedVolume = completedOrders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );
  const pendingVolume = pendingOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalVolume = completedVolume + pendingVolume;

  // Calculate fees (2% on completed, 1% on pre-orders)
  const platformFee = Math.round(completedVolume * 0.02);
  const confirmedPreOrders = 0; // No pre-orders confirmed in prototype
  const preorderFee = Math.round(confirmedPreOrders * 0.01);

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  PROTOTYPE_ORDERS.forEach((o) => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  });

  // Top commodities
  const commodityCount: Record<string, number> = {};
  PROTOTYPE_ORDERS.forEach((o) => {
    commodityCount[o.commodity_name] =
      (commodityCount[o.commodity_name] || 0) + 1;
  });
  const topCommodities = Object.entries(commodityCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalVolume,
    completedVolume,
    pendingVolume,
    platformFee,
    preorderFee,
    totalRevenue: platformFee + preorderFee,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    cancelledOrders: cancelledOrders.length,
    totalOrders: PROTOTYPE_ORDERS.length,
    statusBreakdown,
    topCommodities,
    confirmedPreOrders,
  };
}

// =============================================================================
// SUMMARY FOR QUICK ACCESS
// =============================================================================

export const PROTOTYPE_DATA = {
  farmer: DEMO_FARMER,
  buyer: DEMO_BUYER,
  admin: DEMO_ADMIN,
  commodities: PROTOTYPE_COMMODITIES,
  orders: PROTOTYPE_ORDERS,
  activities: PROTOTYPE_ACTIVITIES,
  financeSummary: generatePrototypeFinanceSummary(),
  buyerFinanceSummary: generatePrototypeBuyerFinanceSummary(),
  adminFinancialSummary: generatePrototypeAdminFinanceSummary(),
};
