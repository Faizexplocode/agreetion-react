# Prototype Data Verification Guide 📋

## Ringkasan Implementasi

Kami telah mengintegrasikan **Prototype Data** sebagai fallback untuk semua halaman dashboard farmer ketika Firebase kosong. Data ini memastikan aplikasi selalu terlihat penuh dan profesional untuk demo/presentasi.

### Files yang Diubah

1. **[NEW] `lib/utils/prototypeData.ts`**
   - 6 komoditas dengan data lengkap (harga, stok, emoji, deskripsi)
   - 5 pesanan interconnected (completed, active, pending)
   - 8 aktivitas terbaru
   - Finance summary yang dihitung otomatis
   - Demo farmer & buyer profiles

2. **MODIFIED `app/dashboard/farmer/page.tsx`**
   - Import `prototypeData.ts`
   - Fallback logic: jika Firebase kosong → gunakan prototype
   - Menampilkan prototype dengan data yang sinkron

3. **MODIFIED `app/dashboard/farmer/commodities/page.tsx`**
   - Fallback logic untuk menampilkan 6 komoditas prototype
   - Tombol Edit/Hapus disabled untuk data demo
   - Badge info: "📋 Data prototype untuk demo"

4. **MODIFIED `app/dashboard/farmer/orders/page.tsx`**
   - Fallback logic untuk menampilkan pesanan prototype
   - Tombol Konfirmasi/Update disabled untuk data demo
   - Badge info: "📋 Data prototype untuk demo"

---

## Verification Steps (Manual Testing)

### Step 1: Login sebagai Petani
1. Buka: `http://localhost:3000/login`
2. Email: `sido@tanipro.id`
3. Password: `Petani@123`
4. Klik "Masuk"

### Step 2: Dashboard Farmer (`/dashboard/farmer`)
✅ **Verifikasi:**
- [ ] Hero banner muncul dengan nama "Sido Hartono"
- [ ] 4 MetricCards muncul:
  - Total Komoditas: 6
  - Pesanan Baru: 1 (order_id: proto-ord-005)
  - Pesanan Aktif: 3 (confirmed, processing, shipped statuses)
  - Pendapatan: Rp4.650.000 (dari 2 completed orders)
- [ ] Commodity showcase (3 preview cards):
  - Cabai Merah Premium (🌶️, Rp45.000/kg)
  - Tomat Organik (🍅, Rp32.000/kg)
  - Jagung Manis (🌽, Rp28.000/kg)
- [ ] Activity feed menampilkan 3+ aktivitas
- [ ] "Pesanan menunggu konfirmasi" section menampilkan proto-ord-005

### Step 3: Commodities Page (`/dashboard/farmer/commodities`)
✅ **Verifikasi:**
- [ ] Blue badge muncul: "📋 Menampilkan data prototype untuk demo"
- [ ] 6 komoditas ditampilkan dalam grid (3 kolom di desktop):
  1. Cabai Merah Premium (🌶️, stock: 250kg, Rp45.000/kg, Ready)
  2. Tomat Organik (🍅, stock: 180kg, Rp32.000/kg, Ready)
  3. Jagung Manis (🌽, stock: 320kg, Rp28.000/kg, Ready)
  4. Bawang Merah (🧅, stock: 150kg, Rp52.000/kg, Ready)
  5. Kentang Unggul (🥔, stock: 500kg, Rp35.000/kg, Pre-Order)
  6. Terong Ungu (🫑, stock: 200kg, Rp24.000/kg, Ready)
- [ ] Tombol "Edit (Demo)" dan "Hapus (Demo)" disabled dengan opacity
- [ ] Tooltip saat hover: "Tidak tersedia untuk data demo"

### Step 4: Orders Page (`/dashboard/farmer/orders`)
✅ **Verifikasi:**
- [ ] Blue badge muncul: "📋 Menampilkan data prototype untuk demo"
- [ ] Tab "Aktif" menampilkan 4 pesanan:
  - ORD-20240610-0003 (Jagung Manis, 100kg, Rp2.800.000) - confirmed
  - ORD-20240610-0004 (Bawang Merah, 30kg, Rp1.560.000) - processing
  - ORD-20240608-0005 (Cabai Merah, 25kg, Rp1.125.000) - pending
  - (dan 1 lagi dengan status shipped/delivered)
- [ ] Tombol "Konfirmasi ✅" & "Mulai Proses 🔧" dll DISABLED dengan opacity
- [ ] Tooltip saat hover: "Tidak tersedia untuk data demo"
- [ ] Tab "Selesai" menampilkan 2 completed orders:
  - ORD-20240610-0001 (Cabai Merah, 50kg, Rp2.250.000) - completed
  - ORD-20240609-0002 (Tomat Organik, 75kg, Rp2.400.000) - completed

### Step 5: Financial Consistency Check ✅
**Expected Revenue Calculation:**
- Completed orders: ORD-20240610-0001 + ORD-20240609-0002
- = Rp2.250.000 + Rp2.400.000
- = **Rp4.650.000** ✓ (Harus match di metric card "Pendapatan")

**Pending/Active Amount:**
- ORD-20240610-0003: Rp2.800.000
- ORD-20240610-0004: Rp1.560.000
- ORD-20240608-0005: Rp1.125.000
- = **Rp5.485.000** (total pending amount)

### Step 6: Add Real Komoditas (Optional - Data Replacement Test)
1. Buka Commodities page
2. Klik "+ Tambah Komoditas"
3. Isi form:
   - Nama: "Paprika Merah"
   - Kategori: "Sayuran"
   - Unit: "kg"
   - Harga: 50000
   - Stok: 100
   - Klik "Simpan"
4. ✅ **Expected:** 
   - Prototype data hilang → replaced dengan real data
   - Badge "📋 Data prototype..." menghilang
   - Paprika baru muncul di list
   - Total komoditas = 1 (real data only)

---

## Data Structure Integrity ✅

### Commodity Fields Checked:
```typescript
✓ id, farmer_id, name, category, unit
✓ price, stock, is_preorder, is_available, emoji
✓ description, harvest_date (for pre-order), created_at
✓ farmer_name, farm_name, farmer_city, farmer_rating (joined)
```

### Order Fields Checked:
```typescript
✓ id, order_code, buyer_id, farmer_id, commodity_id
✓ quantity, unit, total_price, platform_fee (2% auto-calculated)
✓ status, payment_status, created_at, updated_at, notes
```

### Activity Fields Checked:
```typescript
✓ id, user_id, user_name, role (farmer/buyer)
✓ action, detail, created_at
✓ Proper mapping: action → icon + color (login, payment, delivery, etc.)
```

---

## Notes & Caveats

- **Prototype data is ReadOnly** — No edit/delete/update actions work on prototype data
- **Automatic Replacement** — Once real data exists in Firebase, prototype is never shown again
- **Seamless Transition** — Users see same UI/UX; they just see real data instead
- **Presentation-Ready** — All metrics, calculations, and visuals are accurate and interconnected
- **No Side Effects** — Prototype operations don't create database writes

---

## Rollback (If Needed)

If you need to remove prototype data:
1. Delete imports from pages: `import { PROTOTYPE_... } from '@/lib/utils/prototypeData'`
2. Remove fallback logic from each page
3. Revert to original behavior (empty states for no data)

But we recommend keeping it as a professional demo feature! 🚀
