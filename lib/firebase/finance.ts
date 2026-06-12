import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, PreOrder, FinanceSummary, AdminFinancialSummary } from '@/types';

const PLATFORM_FEE_RATE = 0.02;
const PREORDER_FEE_RATE = 0.01;

export async function getFinanceSummary(
  userId: string,
  role: 'farmer' | 'buyer',
): Promise<FinanceSummary> {
  try {
    const field = role === 'farmer' ? 'farmer_id' : 'buyer_id';
    const ref = collection(db, 'orders');
    const q = query(ref, where(field, '==', userId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const allOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

    const completed = allOrders.filter((o) => o.status === 'completed').length;
    const totalRevenue = allOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_price ?? 0), 0);

    const pending = allOrders.filter((o) =>
      ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(o.status),
    ).length;
    const pendingAmount = allOrders
      .filter((o) =>
        ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(o.status),
      )
      .reduce((sum, o) => sum + (o.total_price ?? 0), 0);

    return { completed, totalRevenue, pending, pendingAmount, allOrders };
  } catch (err) {
    console.error('[finance] getFinanceSummary error:', err);
    return { completed: 0, totalRevenue: 0, pending: 0, pendingAmount: 0, allOrders: [] };
  }
}

export async function getFinancialSummary(): Promise<AdminFinancialSummary> {
  try {
    const [ordersSnap, preordersSnap] = await Promise.all([
      getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc'))),
      getDocs(collection(db, 'preorders')),
    ]);

    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    const preorders = preordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PreOrder));

    const totalVolume = orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const completedVolume = completedOrders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);

    const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const pendingOrdersList = orders.filter((o) => activeStatuses.includes(o.status));
    const pendingVolume = pendingOrdersList.reduce((sum, o) => sum + (o.total_price ?? 0), 0);

    const platformFee = Math.round(completedVolume * PLATFORM_FEE_RATE);
    const confirmedPreOrders = preorders.filter((p) => p.status === 'confirmed').length;
    const preorderFee = Math.round(
      preorders
        .filter((p) => p.status === 'confirmed')
        .reduce((sum, p) => sum + p.price_per_unit * p.quantity, 0) * PREORDER_FEE_RATE,
    );

    const statusBreakdown: Record<string, number> = {};
    orders.forEach((o) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] ?? 0) + 1;
    });

    // Top 5 commodities by order count
    const commodityCount: Record<string, number> = {};
    orders.forEach((o) => {
      commodityCount[o.commodity_name] = (commodityCount[o.commodity_name] ?? 0) + 1;
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
      pendingOrders: pendingOrdersList.length,
      cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
      totalOrders: orders.length,
      statusBreakdown,
      topCommodities,
      confirmedPreOrders,
    };
  } catch (err) {
    console.error('[finance] getFinancialSummary error:', err);
    return {
      totalVolume: 0,
      completedVolume: 0,
      pendingVolume: 0,
      platformFee: 0,
      preorderFee: 0,
      totalRevenue: 0,
      completedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalOrders: 0,
      statusBreakdown: {},
      topCommodities: [],
      confirmedPreOrders: 0,
    };
  }
}
