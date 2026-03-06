# Frontend — Digital Village Administration System
# Frontend — Sistem Administrasi Desa Digital

> **Bahasa / Language:** [🇮🇩 Indonesia](#indonesia) | [🇬🇧 English](#english)

---

<a id="indonesia"></a>
## 🇮🇩 Indonesia

### Teknologi yang Digunakan

| Teknologi          | Versi   | Kegunaan                                      |
|--------------------|---------|-----------------------------------------------|
| React              | ^19.2   | Library UI utama                              |
| Vite               | ^7.3    | Build tool dan dev server                     |
| React Router DOM   | ^7.13   | Navigasi dan routing halaman                  |
| Axios              | ^1.13   | HTTP client untuk komunikasi REST API         |
| Recharts           | ^3.7    | Visualisasi data / grafik                     |
| React Leaflet      | ^5.0    | Peta interaktif (Leaflet.js)                  |
| jsPDF              | ^4.2    | Generate dan export file PDF                  |
| xlsx               | ^0.18   | Baca dan export file Excel                    |
| React Icons        | ^5.5    | Library ikon                                  |

---

### Struktur Folder

```
frontend/
├── public/                  → Asset statis publik
└── src/
    ├── main.jsx             → Entry point aplikasi
    ├── App.jsx              → Definisi routing utama
    ├── index.css            → Style global
    ├── assets/              → Gambar dan file statis
    ├── components/          → Komponen reusable (Layout, Sidebar, Topbar, ProtectedRoute)
    ├── context/             → React Context (AuthContext untuk manajemen autentikasi)
    ├── data/                → Data statis / konstanta
    ├── pages/               → Halaman-halaman aplikasi (dikelompokkan per fitur)
    │   ├── Auth/            → Login
    │   ├── Dashboard/       → Dashboard publik
    │   ├── Berita/          → Berita desa
    │   ├── Galeri/          → Galeri foto
    │   ├── StrukturOrganisasi/ → Struktur perangkat desa
    │   ├── Kontak/          → Halaman kontak
    │   ├── Penduduk/        → Data penduduk (publik & admin)
    │   ├── Profile/         → Profil pengguna
    │   ├── Layanan/         → Pengajuan surat, arsip, pengaduan
    │   ├── Keuangan/        → Anggaran, APBDes, realisasi, laporan
    │   ├── Program-Kegiatan/ → Program desa & laporan kegiatan
    │   └── Dashboard_Monitoring/ → Monitoring surat, anggaran, kependudukan, bansos
    ├── services/            → Fungsi pemanggilan API (axios)
    └── styles/              → File CSS tambahan per modul
```

---

### Instalasi dan Menjalankan

#### Prasyarat
- Node.js >= 18.x
- npm >= 9.x
- Backend API berjalan (lihat [README Backend](../backend/README.md))

#### Langkah Instalasi

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependensi
npm install

# 3. Buat file environment
cp .env.example .env
# atau buat file .env manual dengan isi:
# VITE_API_URL=http://localhost:8000/api
```

#### Menjalankan Mode Development

```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`

#### Build untuk Produksi

```bash
npm run build
```
Output build akan berada di folder `dist/`.

#### Preview Build Produksi

```bash
npm run preview
```

---

### Routing & Halaman

#### Halaman Publik (Tanpa Login)

| Path                     | Halaman                   | Deskripsi                               |
|--------------------------|---------------------------|-----------------------------------------|
| `/`                      | Dashboard                 | Statistik dan informasi umum desa       |
| `/berita`                | Berita Desa               | Daftar berita dan pengumuman            |
| `/berita/:id`            | Detail Berita             | Konten lengkap satu berita              |
| `/galeri`                | Galeri                    | Foto dan dokumentasi kegiatan desa      |
| `/struktur-organisasi`   | Struktur Organisasi       | Jabatan dan perangkat desa              |
| `/kontak`                | Kontak                    | Data kontak perangkat desa              |
| `/penduduk`              | Data Penduduk (Publik)    | Informasi kependudukan umum             |
| `/login`                 | Halaman Login             | Form autentikasi pengguna               |

#### Halaman Private (Memerlukan Login)

| Path                          | Halaman                  | Role yang Diizinkan               |
|-------------------------------|--------------------------|-----------------------------------|
| `/profile`                    | Profil Pengguna          | Semua role                        |
| `/pengajuan`                  | Pengajuan Surat          | Semua role                        |
| `/arsip`                      | Arsip Dokumen            | Semua role                        |
| `/pengaduan`                  | Pengaduan Warga          | Semua role                        |
| `/surat-diajukan`             | Surat Diajukan           | Admin, Kepdes, Sekretaris         |
| `/persetujuan-surat`          | Persetujuan Surat        | Admin, Kepdes                     |
| `/data-anggaran`              | Data Anggaran            | Admin, Kepdes, Bendahara          |
| `/input-apbdes`               | Input APBDes             | Admin, Kepdes, Bendahara          |
| `/realisasi-anggaran`         | Realisasi Anggaran       | Admin, Kepdes, Bendahara          |
| `/laporan-dana-desa`          | Laporan Dana Desa        | Admin, Kepdes, Bendahara          |
| `/program-desa`               | Program Desa             | Admin, Kepdes, Sekretaris         |
| `/laporan-kegiatan`           | Laporan Kegiatan         | Admin, Kepdes, Sekretaris         |
| `/monitoring/surat`           | Monitor Surat Diproses   | Admin, Kepdes, Sekretaris         |
| `/monitoring/anggaran`        | Monitor Anggaran         | Admin, Kepdes, Bendahara          |
| `/monitoring/kependudukan`    | Monitor Kependudukan     | Admin, Kepdes, Sekretaris         |
| `/monitoring/bantuan-sosial`  | Monitor Bantuan Sosial   | Semua role                        |
| `/penduduk-admin`             | Data Penduduk (Admin)    | Admin, Kepdes, Sekretaris         |

---

### Autentikasi & Otorisasi

- Autentikasi menggunakan **token Sanctum** yang disimpan di `localStorage`.
- State autentikasi dikelola melalui **AuthContext** (`src/context/AuthContext.jsx`).
- Route yang memerlukan login dibungkus komponen `<ProtectedRoute />`.
- Akses per role dikontrol di `App.jsx` menggunakan array role yang diizinkan.
- Token dikirim di setiap request API melalui header `Authorization: Bearer <token>`.

---

### Panduan Penggunaan Website

#### Login
1. Buka `http://localhost:5173/login`
2. Masukkan **email** dan **password**
3. Klik tombol **Login**
4. Setelah berhasil, pengguna akan diarahkan ke halaman dashboard sesuai rolenya

#### Akun Default (Setelah Seeding)

| Role              | Email                   | Password         |
|-------------------|-------------------------|------------------|
| Admin Desa        | admin1@desa.id          | admindesa1       |
| Kepala Desa       | kepdes1@desa.id         | kepdesdesa1      |
| Sekretaris Desa   | sekdes1@desa.id         | sekdes1          |
| Bendahara         | bendahara1@desa.id      | bendaharadesa1   |
| Warga             | wargadesa1@desa.id      | wargadesa1       |

#### Pengajuan Surat (Role: Semua)
1. Login terlebih dahulu
2. Pilih menu **Layanan → Pengajuan Surat**
3. Pilih jenis surat dari dropdown
4. Isi formulir dengan data yang diperlukan
5. Klik **Ajukan** — surat akan masuk ke antrian review perangkat desa

#### Pengelolaan Surat (Role: Admin / Kepdes / Sekretaris)
1. Buka menu **Layanan → Surat Diajukan** untuk melihat semua pengajuan masuk
2. Klik pengajuan untuk melihat detailnya
3. Lakukan **Terima**, **Tolak**, atau **Generate Nomor Surat**
4. Kepala Desa dapat **Menyetujui** surat final melalui menu **Persetujuan Surat**

#### Input Keuangan (Role: Admin / Kepdes / Bendahara)
1. Buka menu **Keuangan → Input APBDes** untuk menambah pos anggaran
2. Gunakan **Data Anggaran** untuk melihat keseluruhan anggaran
3. Catat realisasi pengeluaran di **Realisasi Anggaran**
4. Lihat rekap di **Laporan Dana Desa** — tersedia export ke PDF/Excel

#### Pengaduan Warga
1. Login sebagai warga atau perangkat desa
2. Buka menu **Layanan → Pengaduan**
3. Isi formulir pengaduan dengan judul, isi, dan kategori
4. Perangkat desa dapat membalas dan mengubah status pengaduan

#### Export Data
- **Data Penduduk**: Buka **Data Penduduk → Export Excel**
- **Laporan Keuangan**: Buka **Laporan Dana Desa → Export PDF** atau **Export Excel**

---

### Konfigurasi Environment

Buat file `.env` di folder `frontend/` dengan isi:

```env
VITE_API_URL=http://localhost:8000/api
```

> Jika backend berjalan di domain/port berbeda, sesuaikan nilai `VITE_API_URL`.

---

### Linting

```bash
npm run lint
```

---
---

<a id="english"></a>
## 🇬🇧 English

### Technologies Used

| Technology         | Version | Purpose                                      |
|--------------------|---------|----------------------------------------------|
| React              | ^19.2   | Main UI library                              |
| Vite               | ^7.3    | Build tool and dev server                    |
| React Router DOM   | ^7.13   | Page navigation and routing                  |
| Axios              | ^1.13   | HTTP client for REST API communication       |
| Recharts           | ^3.7    | Data visualization / charts                  |
| React Leaflet      | ^5.0    | Interactive maps (Leaflet.js)                |
| jsPDF              | ^4.2    | Generate and export PDF files                |
| xlsx               | ^0.18   | Read and export Excel files                  |
| React Icons        | ^5.5    | Icon library                                 |

---

### Folder Structure

```
frontend/
├── public/                  → Public static assets
└── src/
    ├── main.jsx             → Application entry point
    ├── App.jsx              → Main routing definition
    ├── index.css            → Global styles
    ├── assets/              → Images and static files
    ├── components/          → Reusable components (Layout, Sidebar, Topbar, ProtectedRoute)
    ├── context/             → React Context (AuthContext for authentication management)
    ├── data/                → Static data / constants
    ├── pages/               → Application pages (grouped by feature)
    │   ├── Auth/            → Login
    │   ├── Dashboard/       → Public dashboard
    │   ├── Berita/          → Village news
    │   ├── Galeri/          → Photo gallery
    │   ├── StrukturOrganisasi/ → Village organizational structure
    │   ├── Kontak/          → Contact page
    │   ├── Penduduk/        → Population data (public & admin)
    │   ├── Profile/         → User profile
    │   ├── Layanan/         → Letter submission, archive, complaints
    │   ├── Keuangan/        → Budget, APBDes, realization, reports
    │   ├── Program-Kegiatan/ → Village programs & activity reports
    │   └── Dashboard_Monitoring/ → Monitoring letters, budget, population, social aid
    ├── services/            → API call functions (axios)
    └── styles/              → Additional per-module CSS files
```

---

### Installation and Running

#### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Backend API running (see [Backend README](../backend/README.md))

#### Installation Steps

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# or create .env manually with:
# VITE_API_URL=http://localhost:8000/api
```

#### Running in Development Mode

```bash
npm run dev
```
Application will run at `http://localhost:5173`

#### Build for Production

```bash
npm run build
```
Build output will be in the `dist/` folder.

#### Preview Production Build

```bash
npm run preview
```

---

### Routing & Pages

#### Public Pages (No Login Required)

| Path                     | Page                      | Description                             |
|--------------------------|---------------------------|-----------------------------------------|
| `/`                      | Dashboard                 | Village statistics and general info     |
| `/berita`                | Village News              | News and announcements list             |
| `/berita/:id`            | News Detail               | Full content of a single news item      |
| `/galeri`                | Gallery                   | Photos and village activity docs        |
| `/struktur-organisasi`   | Organizational Structure  | Village official positions              |
| `/kontak`                | Contact                   | Village official contact details        |
| `/penduduk`              | Population Data (Public)  | General population information          |
| `/login`                 | Login Page                | User authentication form                |

#### Private Pages (Login Required)

| Path                          | Page                     | Allowed Roles                     |
|-------------------------------|--------------------------|-----------------------------------|
| `/profile`                    | User Profile             | All roles                         |
| `/pengajuan`                  | Letter Submission        | All roles                         |
| `/arsip`                      | Document Archive         | All roles                         |
| `/pengaduan`                  | Citizen Complaints       | All roles                         |
| `/surat-diajukan`             | Submitted Letters        | Admin, Kepdes, Sekretaris         |
| `/persetujuan-surat`          | Letter Approval          | Admin, Kepdes                     |
| `/data-anggaran`              | Budget Data              | Admin, Kepdes, Bendahara          |
| `/input-apbdes`               | APBDes Input             | Admin, Kepdes, Bendahara          |
| `/realisasi-anggaran`         | Budget Realization       | Admin, Kepdes, Bendahara          |
| `/laporan-dana-desa`          | Village Fund Report      | Admin, Kepdes, Bendahara          |
| `/program-desa`               | Village Programs         | Admin, Kepdes, Sekretaris         |
| `/laporan-kegiatan`           | Activity Reports         | Admin, Kepdes, Sekretaris         |
| `/monitoring/surat`           | Letter Processing Monitor| Admin, Kepdes, Sekretaris         |
| `/monitoring/anggaran`        | Budget Monitor           | Admin, Kepdes, Bendahara          |
| `/monitoring/kependudukan`    | Population Monitor       | Admin, Kepdes, Sekretaris         |
| `/monitoring/bantuan-sosial`  | Social Assistance Monitor| All roles                         |
| `/penduduk-admin`             | Population Data (Admin)  | Admin, Kepdes, Sekretaris         |

---

### Authentication & Authorization

- Authentication uses **Sanctum tokens** stored in `localStorage`.
- Auth state is managed via **AuthContext** (`src/context/AuthContext.jsx`).
- Routes requiring login are wrapped with `<ProtectedRoute />` component.
- Per-role access is controlled in `App.jsx` using allowed role arrays.
- Token is sent with every API request via `Authorization: Bearer <token>` header.

---

### Website Usage Guide

#### Login
1. Open `http://localhost:5173/login`
2. Enter your **email** and **password**
3. Click the **Login** button
4. Upon success, you will be redirected to the dashboard appropriate for your role

#### Default Accounts (After Seeding)

| Role              | Email                   | Password         |
|-------------------|-------------------------|------------------|
| Admin Desa        | admin1@desa.id          | admindesa1       |
| Kepala Desa       | kepdes1@desa.id         | kepdesdesa1      |
| Sekretaris Desa   | sekdes1@desa.id         | sekdes1          |
| Bendahara         | bendahara1@desa.id      | bendaharadesa1   |
| Warga (Citizen)   | wargadesa1@desa.id      | wargadesa1       |

#### Letter Submission (Role: All)
1. Log in first
2. Navigate to **Layanan → Pengajuan Surat**
3. Select a letter type from the dropdown
4. Fill in the required form fields
5. Click **Ajukan** — the letter enters the village staff review queue

#### Letter Management (Role: Admin / Kepdes / Sekretaris)
1. Open **Layanan → Surat Diajukan** to view all incoming submissions
2. Click a submission to view its details
3. **Accept**, **Reject**, or **Generate Letter Number**
4. The Kepala Desa can **Approve** a final letter via **Persetujuan Surat**

#### Finance Input (Role: Admin / Kepdes / Bendahara)
1. Open **Keuangan → Input APBDes** to add budget items
2. Use **Data Anggaran** to view the full budget overview
3. Record expenditure realization under **Realisasi Anggaran**
4. View the summary in **Laporan Dana Desa** — PDF/Excel export available

#### Citizen Complaints
1. Log in as a citizen or village staff
2. Open **Layanan → Pengaduan**
3. Fill in the complaint form with title, content, and category
4. Village staff can reply and update the complaint status

#### Data Export
- **Population Data**: Open **Data Penduduk → Export Excel**
- **Financial Report**: Open **Laporan Dana Desa → Export PDF** or **Export Excel**

---

### Environment Configuration

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:8000/api
```

> If the backend runs on a different domain/port, update the `VITE_API_URL` value accordingly.

---

### Linting

```bash
npm run lint
```

-------------------
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
