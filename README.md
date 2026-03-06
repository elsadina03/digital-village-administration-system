# Digital Village Administration System
# Sistem Administrasi Desa Digital

> **Bahasa / Language:** [🇮🇩 Indonesia](#indonesia) | [🇬🇧 English](#english)

---

<a id="indonesia"></a>
## 🇮🇩 Indonesia

### Tentang Proyek

**Sistem Administrasi Desa Digital** adalah aplikasi web terpadu berbasis ERP (Enterprise Resource Planning) yang dirancang untuk membantu pengelolaan administrasi desa secara digital. Sistem ini menyediakan fitur manajemen kependudukan, keuangan desa, surat-menyurat, program kegiatan, bantuan sosial, pengaduan warga, serta informasi publik desa.

---

### Arsitektur Sistem

```
digital-village-administration-system/
├── backend/    → REST API (Laravel 12 + PHP 8.2)
└── frontend/   → Single Page Application (React 19 + Vite)
```

Sistem menggunakan arsitektur **decoupled (terpisah)** antara backend dan frontend:

| Komponen  | Teknologi                     | Port Default |
|-----------|-------------------------------|--------------|
| Backend   | Laravel 12, PHP 8.2, MySQL    | `8000`       |
| Frontend  | React 19, Vite 7, React Router| `5173`       |

Komunikasi antara frontend dan backend dilakukan melalui **REST API** menggunakan **JSON**, dengan autentikasi berbasis **Laravel Sanctum (token-based)**.

---

### Fitur Utama

#### 🌐 Halaman Publik (Tanpa Login)
- **Dashboard** — Statistik desa dan informasi umum
- **Berita Desa** — Publikasi berita dan pengumuman
- **Galeri** — Foto dan dokumentasi kegiatan desa
- **Struktur Organisasi** — Jabatan perangkat desa
- **Kontak** — Data kontak perangkat desa
- **Data Penduduk** — Informasi kependudukan publik

#### 🔐 Fitur Perangkat Desa (Memerlukan Login)

| Fitur                     | Deskripsi                                                    |
|---------------------------|--------------------------------------------------------------|
| **Pengajuan Surat**       | Pengajuan dan pengelolaan surat administrasi warga           |
| **Arsip Dokumen**         | Manajemen arsip dan dokumen desa                             |
| **Pengaduan Warga**       | Pengelolaan laporan dan pengaduan dari warga                 |
| **Keuangan Desa**         | Input APBDes, anggaran, realisasi, dan laporan dana desa     |
| **Program & Kegiatan**    | Manajemen program desa dan laporan pelaksanaan kegiatan      |
| **Bantuan Sosial**        | Data penerima bantuan sosial                                 |
| **Data Penduduk**         | CRUD data warga, import/export Excel                         |
| **Dashboard Monitoring**  | Monitoring surat, anggaran, kependudukan, dan bantuan sosial |

---

### Peran Pengguna (Role)

| Role              | Akses                                                                      |
|-------------------|----------------------------------------------------------------------------|
| **Admin Desa**    | Akses penuh ke seluruh fitur termasuk manajemen pengguna                   |
| **Kepala Desa**   | Akses penuh kecuali manajemen pengguna sistem; persetujuan surat           |
| **Sekretaris Desa** | Kelola surat, pengaduan, penduduk, program kegiatan                     |
| **Bendahara**     | Kelola keuangan desa (anggaran, realisasi, laporan)                        |
| **Warga**         | Pengajuan surat, pengaduan, lihat arsip pribadi                            |

---

### Cara Menjalankan Secara Lengkap

#### Prasyarat
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB

#### 1. Clone Repositori
```bash
git clone <repository-url>
cd digital-village-administration-system
```

#### 2. Setup Backend
```bash
cd backend
composer install
cp .env.example .env
# Edit .env → sesuaikan DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### 3. Setup Frontend
```bash
cd frontend
npm install
# Pastikan VITE_API_URL di .env mengarah ke backend (http://localhost:8000)
npm run dev
```

#### 4. Akses Aplikasi
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

---

### Dokumentasi Lebih Lanjut
- [README Backend](./backend/README.md) — Panduan teknis dan penggunaan API
- [README Frontend](./frontend/README.md) — Panduan teknis dan penggunaan antarmuka

---
---

<a id="english"></a>
## 🇬🇧 English

### About the Project

**Digital Village Administration System** is an integrated web application based on ERP (Enterprise Resource Planning) principles, designed to digitalize village administration management. It provides features for population management, village finances, correspondence, activity programs, social assistance, citizen complaints, and public village information.

---

### System Architecture

```
digital-village-administration-system/
├── backend/    → REST API (Laravel 12 + PHP 8.2)
└── frontend/   → Single Page Application (React 19 + Vite)
```

The system uses a **decoupled** architecture between backend and frontend:

| Component | Technology                     | Default Port |
|-----------|--------------------------------|--------------|
| Backend   | Laravel 12, PHP 8.2, MySQL     | `8000`       |
| Frontend  | React 19, Vite 7, React Router | `5173`       |

Communication between frontend and backend is via **REST API** using **JSON**, with **Laravel Sanctum (token-based)** authentication.

---

### Key Features

#### 🌐 Public Pages (No Login Required)
- **Dashboard** — Village statistics and general information
- **Village News** — News and announcements
- **Gallery** — Photos and documentation of village activities
- **Organizational Structure** — Village official positions
- **Contact** — Village official contact details
- **Population Data** — Public population information

#### 🔐 Village Staff Features (Login Required)

| Feature                    | Description                                                   |
|----------------------------|---------------------------------------------------------------|
| **Letter Submission**      | Submit and manage administrative letters for citizens         |
| **Document Archive**       | Village document and archive management                       |
| **Citizen Complaints**     | Handle reports and complaints from citizens                   |
| **Village Finance**        | APBDes input, budget, realization, and village fund reports   |
| **Programs & Activities**  | Manage village programs and activity reports                  |
| **Social Assistance**      | Social assistance recipient data management                   |
| **Population Data**        | CRUD citizen data, Excel import/export                        |
| **Monitoring Dashboard**   | Monitor letters, budget, population, and social assistance    |

---

### User Roles

| Role                  | Access                                                                 |
|-----------------------|------------------------------------------------------------------------|
| **Admin Desa**        | Full access including user management                                  |
| **Kepala Desa**       | Full access except system user management; letter approval authority   |
| **Sekretaris Desa**   | Manage letters, complaints, population data, activity programs         |
| **Bendahara**         | Manage village finances (budget, realization, reports)                 |
| **Warga**             | Submit letters, complaints, view personal archive                      |

---

### Quick Start

#### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB

#### 1. Clone Repository
```bash
git clone <repository-url>
cd digital-village-administration-system
```

#### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
# Edit .env → configure DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
# Make sure VITE_API_URL in .env points to backend (http://localhost:8000)
npm run dev
```

#### 4. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

---

### Further Documentation
- [Backend README](./backend/README.md) — Technical guide and API usage
- [Frontend README](./frontend/README.md) — Technical guide and UI usage
