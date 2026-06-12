# Setup EmailJS untuk OTP TaniPro

## Langkah 1: Daftar EmailJS
- Buka https://emailjs.com
- Daftar/login dengan akun Google

## Langkah 2: Tambah Email Service
- Dashboard → Email Services → Add New Service
- Pilih Gmail
- Connect akun Gmail kamu
- Catat SERVICE_ID (format: service_xxxxxxx)

## Langkah 3: Buat Email Template
- Dashboard → Email Templates → Create New Template
- Setting template:
  - Subject: "Kode OTP TaniPro: {{otp_code}}"
  - Body:
    Halo {{to_name}},

    Kode OTP kamu adalah: {{otp_code}}

    Kode berlaku 10 menit.
    Jangan bagikan kode ini ke siapapun.

    Tim TaniPro
- Catat TEMPLATE_ID (format: template_xxxxxxx)

## Langkah 4: Ambil Public Key
- Dashboard → Account → General
- Copy Public Key
- Catat PUBLIC_KEY

## Langkah 5: Isi .env.local
Ganti PLACEHOLDER dengan nilai asli:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

## Langkah 6: Restart dev server
```
npm run dev
```

## Testing
1. Register akun baru
2. Cek inbox Gmail kamu
3. Masukkan kode OTP dari email
