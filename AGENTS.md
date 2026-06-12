/**
 * AGENTS.md — TaniPro Next.js Project
 *
 * Platform pertanian Farm-to-Business Indonesia.
 * Menghubungkan petani langsung dengan pembeli industri.
 */

# TaniPro — Next.js App

## Struktur Proyek
```
app/                    → Next.js App Router pages
  (auth)/               → Route group auth (tidak punya shared layout)
    login/              → /login
    register/           → /register
    setup-profile/      → /setup-profile
  dashboard/            → Protected dashboard routes
    layout.tsx          → Auth guard + Sidebar + Navbar
    page.tsx            → Redirect ke /dashboard/{role}
    farmer/             → /dashboard/farmer
    buyer/              → /dashboard/buyer
    admin/              → /dashboard/admin

components/             → Reusable React components
  ui/                   → Atom components (Button, Input, Card, Badge, Toast, Modal)
  layout/               → Sidebar, Navbar, NotificationBell
  features/             → Domain-specific components
    auth/               → LoginForm, RegisterForm, SetupProfileForm
    commodity/          → CommodityCard, CommodityForm
    order/              → OrderCard
    dashboard/          → StatsCard, ActivityFeed

lib/                    → Data layer & utilities
  firebase/             → Firestore CRUD modules
    config.ts           → Firebase init (env vars)
    users.ts            → User CRUD + auth
    commodities.ts      → Commodity CRUD
    orders.ts           → Order CRUD
    preorders.ts        → Pre-order CRUD
    notifications.ts    → Notifications CRUD
    activity.ts         → Activity log
    otp.ts              → OTP generate/verify
    deliveries.ts       → Delivery tracking
    finance.ts          → Financial summaries
  context/
    AuthContext.tsx     → React context + localStorage session
  hooks/
    useAuth.ts          → Session hook
    useNotifications.ts → Realtime notifications hook
    useCommodities.ts   → Realtime commodities hook
  utils/
    formatters.ts       → formatRp, formatIDR, timeAgo, formatDate
    routing.ts          → getDashboardUrl, getRoleLabel, getStatusLabel

types/
  index.ts              → All TypeScript interfaces
```

## Auth Flow
- Custom auth (bukan Firebase Auth SDK)
- Password: btoa() — legacy untuk kompatibilitas Firestore lama
- Session: localStorage key `tanipro_session`
- Auth guard: app/dashboard/layout.tsx

## Demo Accounts
- Admin: admin@tanipro.id / Admin@TaniPro2024
- Petani: sido@tanipro.id / Petani@123
- Pembeli: ptjaya@tanipro.id / Buyer@123

## Firebase Collections
- users, commodities, orders, preorders, notifications, activity, otps, deliveries

## Commands
```bash
npm run dev    → Start dev server (localhost:3000)
npm run build  → Production build
npm run lint   → ESLint check
```
