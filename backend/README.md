# Backend — Digital Village Administration System
# Backend — Sistem Administrasi Desa Digital

> **Bahasa / Language:** [🇮🇩 Indonesia](#indonesia) | [🇬🇧 English](#english)

---

<a id="indonesia"></a>
## 🇮🇩 Indonesia

### Teknologi yang Digunakan

| Teknologi              | Versi   | Kegunaan                                           |
|------------------------|---------|----------------------------------------------------|
| PHP                    | ^8.2    | Bahasa pemrograman utama                           |
| Laravel                | ^12.0   | Framework aplikasi web                             |
| Laravel Sanctum        | ^4.3    | Autentikasi API berbasis token                     |
| Maatwebsite/Excel      | ^3.1    | Import dan export file Excel                       |
| MySQL / MariaDB        | —       | Database relasional                                |
| Laravel Tinker         | ^2.10   | REPL interaktif untuk debugging                    |
| PHPUnit                | ^11.5   | Framework pengujian unit                           |

---

### Struktur Folder

```
backend/
├── app/
│   ├── Exports/         → Class export file Excel (CitizenExport)
│   ├── Imports/         → Class import file Excel (CitizenImport)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/     → Controller REST API per resource
│   │   └── Middleware/  → Middleware (role-based access, dll.)
│   ├── Models/          → Eloquent model (Citizen, User, Letter, dll.)
│   ├── Providers/       → Service provider
│   └── Services/        → Service class (FonnteService untuk notifikasi WA)
├── bootstrap/           → Bootstrap aplikasi Laravel
├── config/              → Konfigurasi aplikasi (database, cors, auth, dll.)
├── database/
│   ├── factories/       → Factory untuk generate data dummy
│   ├── migrations/      → Skema database (tabel dan perubahannya)
│   └── seeders/         → Seeder data awal (role & user default)
├── public/              → Entry point web server (index.php)
├── routes/
│   ├── api.php          → Definisi seluruh route API
│   └── web.php          → Route web (minimal)
├── storage/             → Log, cache, upload file
└── tests/               → Unit dan feature test
```

---

### Instalasi dan Setup

#### Prasyarat
- PHP >= 8.2 (dengan ekstensi: mbstring, pdo, pdo_mysql, xml, curl, zip)
- Composer >= 2.x
- MySQL >= 8.0 / MariaDB >= 10.6
- Node.js >= 18 (opsional, untuk aset)

#### Langkah Instalasi

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Install dependensi PHP
composer install

# 3. Salin file environment
cp .env.example .env

# 4. Konfigurasi .env — sesuaikan bagian berikut:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=nama_database
# DB_USERNAME=root
# DB_PASSWORD=password_database

# 5. Generate app key
php artisan key:generate

# 6. Jalankan migrasi dan seeder
php artisan migrate --seed

# 7. (Opsional) Buat symbolic link storage
php artisan storage:link

# 8. Jalankan server development
php artisan serve
```

Server akan berjalan di `http://localhost:8000`

---

### Database & Model

#### Daftar Tabel

| Tabel                    | Model                  | Deskripsi                                    |
|--------------------------|------------------------|----------------------------------------------|
| `users`                  | User                   | Data pengguna sistem                         |
| `roles`                  | Role                   | Role/jabatan (Admin, Kepdes, dsb.)           |
| `citizens`               | Citizen                | Data penduduk desa                           |
| `letters`                | Letter                 | Pengajuan surat administrasi                 |
| `letter_types`           | LetterType             | Jenis-jenis surat yang tersedia              |
| `complaints`             | Complaint              | Pengaduan dan laporan warga                  |
| `archives`               | Archive                | Arsip dan dokumen desa                       |
| `finances`               | —                      | Data keuangan dasar                          |
| `budgets`                | Budget                 | Anggaran desa (APBDes)                       |
| `programs`               | Program                | Program kerja desa                           |
| `activities`             | Activity               | Kegiatan pelaksanaan program                 |
| `social_assistances`     | SocialAssistance       | Data bantuan sosial                          |
| `assistance_recipients`  | AssistanceRecipient    | Penerima bantuan sosial                      |
| `news`                   | News                   | Berita dan informasi publik desa             |
| `galleries`              | Gallery                | Galeri foto dan dokumentasi                  |
| `personal_access_tokens` | —                      | Token Sanctum untuk autentikasi              |

---

### API Endpoints

Base URL: `http://localhost:8000/api`

#### Autentikasi

| Method | Endpoint    | Deskripsi                     | Auth |
|--------|-------------|-------------------------------|------|
| POST   | `/register` | Daftar akun baru              | ❌   |
| POST   | `/login`    | Login dan dapatkan token      | ❌   |
| POST   | `/logout`   | Hapus token (logout)          | ✅   |
| GET    | `/user`     | Data pengguna yang sedang login| ✅  |
| GET    | `/profile`  | Profil lengkap pengguna       | ✅   |
| PUT    | `/profile`  | Update profil pengguna        | ✅   |

#### Endpoint Publik (Tanpa Login)

| Method | Endpoint                         | Deskripsi                        |
|--------|----------------------------------|----------------------------------|
| GET    | `/public/stats`                  | Statistik umum desa              |
| GET    | `/public/staff`                  | Data perangkat desa              |
| GET    | `/letter-types`                  | Daftar jenis surat               |
| GET    | `/news`                          | Daftar semua berita              |
| GET    | `/news/{id}`                     | Detail berita                    |
| GET    | `/gallery`                       | Daftar galeri foto               |
| GET    | `/citizens/export`               | Export data penduduk ke Excel    |
| GET    | `/social-assistances`            | Daftar program bantuan sosial    |
| GET    | `/social-assistances/{id}`       | Detail bantuan sosial            |
| GET    | `/assistance-recipients`         | Daftar penerima bantuan sosial   |

#### Endpoint Terproteksi (Memerlukan Bearer Token)

**Pengguna (Admin Desa only)**

| Method | Endpoint          | Deskripsi               |
|--------|-------------------|-------------------------|
| GET    | `/users`          | Daftar semua pengguna   |
| POST   | `/users`          | Tambah pengguna baru    |
| GET    | `/users/{id}`     | Detail pengguna         |
| PUT    | `/users/{id}`     | Update data pengguna    |
| DELETE | `/users/{id}`     | Hapus pengguna          |

**Penduduk (Admin, Kepdes, Sekretaris)**

| Method | Endpoint                 | Deskripsi                     |
|--------|--------------------------|-------------------------------|
| GET    | `/citizens`              | Daftar data penduduk          |
| POST   | `/citizens`              | Tambah data penduduk          |
| GET    | `/citizens/{id}`         | Detail data penduduk          |
| PUT    | `/citizens/{id}`         | Update data penduduk          |
| DELETE | `/citizens/{id}`         | Hapus data penduduk           |
| GET    | `/citizens/stats`        | Statistik kependudukan        |
| POST   | `/citizens/import`       | Import Excel data penduduk    |

**Surat**

| Method | Endpoint                       | Deskripsi                                |
|--------|--------------------------------|------------------------------------------|
| GET    | `/letters`                     | Daftar surat (semua role login)          |
| POST   | `/letters`                     | Ajukan surat baru (semua role login)     |
| GET    | `/letters/{id}`                | Detail surat                             |
| GET    | `/letters/generate-number`     | Generate nomor surat otomatis (staff)    |
| PUT    | `/letters/{id}`                | Update/setujui surat (staff)             |
| DELETE | `/letters/{id}`                | Hapus surat (staff)                      |

**Pengaduan**

| Method | Endpoint              | Deskripsi                          |
|--------|-----------------------|------------------------------------|
| GET    | `/complaints`         | Daftar pengaduan                   |
| POST   | `/complaints`         | Kirim pengaduan baru               |
| GET    | `/complaints/{id}`    | Detail pengaduan                   |
| PUT    | `/complaints/{id}`    | Update status/balasan (staff)      |
| DELETE | `/complaints/{id}`    | Hapus pengaduan (staff)            |

**Keuangan**

| Method | Endpoint          | Deskripsi                      |
|--------|-------------------|--------------------------------|
| GET    | `/budgets`        | Daftar anggaran                |
| POST   | `/budgets`        | Tambah anggaran baru           |
| GET    | `/budgets/{id}`   | Detail anggaran                |
| PUT    | `/budgets/{id}`   | Update anggaran                |
| DELETE | `/budgets/{id}`   | Hapus anggaran                 |

**Program & Arsip (Resource CRUD standar)**

| Endpoint              | Resource          |
|-----------------------|-------------------|
| `/programs`           | Program Desa      |
| `/archives`           | Arsip Dokumen     |

**Berita & Galeri (Resource CRUD)**

| Endpoint              | Resource          |
|-----------------------|-------------------|
| `/news`               | Berita Desa       |
| `/gallery`            | Galeri Foto       |

---

### Role & Middleware

Role diatur melalui middleware `role:` yang digunakan di route group:

| Role              | ID  |
|-------------------|-----|
| Admin Desa        | 1   |
| Kepala Desa       | 2   |
| Sekretaris Desa   | 3   |
| Bendahara         | 4   |
| Warga             | 5   |

---

### Akun Default (Setelah Seeding)

```bash
php artisan migrate --seed
```

| Role              | Email                   | Password         |
|-------------------|-------------------------|------------------|
| Admin Desa        | admin1@desa.id          | admindesa1       |
| Kepala Desa       | kepdes1@desa.id         | kepdesdesa1      |
| Sekretaris Desa   | sekdes1@desa.id         | sekdes1          |
| Bendahara         | bendahara1@desa.id      | bendaharadesa1   |
| Warga             | wargadesa1@desa.id      | wargadesa1       |

---

### Konfigurasi CORS

Konfigurasi CORS berada di `config/cors.php`. Pastikan `allowed_origins` mencakup URL frontend:

```php
'allowed_origins' => ['http://localhost:5173'],
```

---

### Perintah Artisan Berguna

```bash
# Jalankan server
php artisan serve

# Jalankan semua migrasi ulang + seeder
php artisan migrate:fresh --seed

# Bersihkan cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Lihat semua route API
php artisan route:list --path=api

# Jalankan test
php artisan test
```

---

### Pengujian

```bash
php artisan test
```

File test berada di folder `tests/Feature/` dan `tests/Unit/`.

---
---

<a id="english"></a>
## 🇬🇧 English

### Technologies Used

| Technology             | Version | Purpose                                            |
|------------------------|---------|----------------------------------------------------|
| PHP                    | ^8.2    | Main programming language                          |
| Laravel                | ^12.0   | Web application framework                          |
| Laravel Sanctum        | ^4.3    | Token-based API authentication                     |
| Maatwebsite/Excel      | ^3.1    | Import and export Excel files                      |
| MySQL / MariaDB        | —       | Relational database                                |
| Laravel Tinker         | ^2.10   | Interactive REPL for debugging                     |
| PHPUnit                | ^11.5   | Unit testing framework                             |

---

### Folder Structure

```
backend/
├── app/
│   ├── Exports/         → Excel export classes (CitizenExport)
│   ├── Imports/         → Excel import classes (CitizenImport)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/     → REST API controllers per resource
│   │   └── Middleware/  → Middleware (role-based access, etc.)
│   ├── Models/          → Eloquent models (Citizen, User, Letter, etc.)
│   ├── Providers/       → Service providers
│   └── Services/        → Service classes (FonnteService for WA notifications)
├── bootstrap/           → Laravel application bootstrap
├── config/              → App configuration (database, cors, auth, etc.)
├── database/
│   ├── factories/       → Factories for generating dummy data
│   ├── migrations/      → Database schema (tables and changes)
│   └── seeders/         → Initial data seeders (roles & default users)
├── public/              → Web server entry point (index.php)
├── routes/
│   ├── api.php          → All API route definitions
│   └── web.php          → Web routes (minimal)
├── storage/             → Logs, cache, uploaded files
└── tests/               → Unit and feature tests
```

---

### Installation and Setup

#### Prerequisites
- PHP >= 8.2 (with extensions: mbstring, pdo, pdo_mysql, xml, curl, zip)
- Composer >= 2.x
- MySQL >= 8.0 / MariaDB >= 10.6
- Node.js >= 18 (optional, for assets)

#### Installation Steps

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Configure .env — update the following:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=your_database_name
# DB_USERNAME=root
# DB_PASSWORD=your_db_password

# 5. Generate application key
php artisan key:generate

# 6. Run migrations and seeders
php artisan migrate --seed

# 7. (Optional) Create storage symbolic link
php artisan storage:link

# 8. Start development server
php artisan serve
```

Server will run at `http://localhost:8000`

---

### Database & Models

#### Table List

| Table                    | Model                  | Description                                  |
|--------------------------|------------------------|----------------------------------------------|
| `users`                  | User                   | System user data                             |
| `roles`                  | Role                   | Roles/positions (Admin, Kepdes, etc.)        |
| `citizens`               | Citizen                | Village population data                      |
| `letters`                | Letter                 | Administrative letter submissions            |
| `letter_types`           | LetterType             | Available letter types                       |
| `complaints`             | Complaint              | Citizen complaints and reports               |
| `archives`               | Archive                | Village archives and documents               |
| `finances`               | —                      | Basic financial data                         |
| `budgets`                | Budget                 | Village budget (APBDes)                      |
| `programs`               | Program                | Village work programs                        |
| `activities`             | Activity               | Program implementation activities            |
| `social_assistances`     | SocialAssistance       | Social assistance program data               |
| `assistance_recipients`  | AssistanceRecipient    | Social assistance recipients                 |
| `news`                   | News                   | Village public news and information          |
| `galleries`              | Gallery                | Photo gallery and documentation              |
| `personal_access_tokens` | —                      | Sanctum tokens for authentication            |

---

### API Endpoints

Base URL: `http://localhost:8000/api`

#### Authentication

| Method | Endpoint    | Description                        | Auth |
|--------|-------------|------------------------------------|------|
| POST   | `/register` | Register a new account             | ❌   |
| POST   | `/login`    | Login and receive token            | ❌   |
| POST   | `/logout`   | Revoke token (logout)              | ✅   |
| GET    | `/user`     | Currently authenticated user data  | ✅   |
| GET    | `/profile`  | Full user profile                  | ✅   |
| PUT    | `/profile`  | Update user profile                | ✅   |

#### Public Endpoints (No Login)

| Method | Endpoint                         | Description                       |
|--------|----------------------------------|-----------------------------------|
| GET    | `/public/stats`                  | General village statistics        |
| GET    | `/public/staff`                  | Village staff contact data        |
| GET    | `/letter-types`                  | Available letter types list       |
| GET    | `/news`                          | All news articles                 |
| GET    | `/news/{id}`                     | Single news detail                |
| GET    | `/gallery`                       | Gallery photos list               |
| GET    | `/citizens/export`               | Export population data to Excel   |
| GET    | `/social-assistances`            | Social assistance programs list   |
| GET    | `/social-assistances/{id}`       | Social assistance detail          |
| GET    | `/assistance-recipients`         | Assistance recipients list        |

#### Protected Endpoints (Require Bearer Token)

**Users (Admin Desa only)**

| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| GET    | `/users`          | List all users          |
| POST   | `/users`          | Create new user         |
| GET    | `/users/{id}`     | User detail             |
| PUT    | `/users/{id}`     | Update user data        |
| DELETE | `/users/{id}`     | Delete user             |

**Population (Admin, Kepdes, Sekretaris)**

| Method | Endpoint                 | Description                   |
|--------|--------------------------|-------------------------------|
| GET    | `/citizens`              | Population data list          |
| POST   | `/citizens`              | Add population record         |
| GET    | `/citizens/{id}`         | Population record detail      |
| PUT    | `/citizens/{id}`         | Update population record      |
| DELETE | `/citizens/{id}`         | Delete population record      |
| GET    | `/citizens/stats`        | Population statistics         |
| POST   | `/citizens/import`       | Import population data (Excel)|

**Letters**

| Method | Endpoint                       | Description                              |
|--------|--------------------------------|------------------------------------------|
| GET    | `/letters`                     | Letter list (all logged-in roles)        |
| POST   | `/letters`                     | Submit new letter (all logged-in roles)  |
| GET    | `/letters/{id}`                | Letter detail                            |
| GET    | `/letters/generate-number`     | Auto-generate letter number (staff)      |
| PUT    | `/letters/{id}`                | Update/approve letter (staff)            |
| DELETE | `/letters/{id}`                | Delete letter (staff)                    |

**Complaints**

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/complaints`         | Complaints list                    |
| POST   | `/complaints`         | Submit new complaint               |
| GET    | `/complaints/{id}`    | Complaint detail                   |
| PUT    | `/complaints/{id}`    | Update status/reply (staff)        |
| DELETE | `/complaints/{id}`    | Delete complaint (staff)           |

**Finance**

| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| GET    | `/budgets`        | Budget list             |
| POST   | `/budgets`        | Add new budget entry    |
| GET    | `/budgets/{id}`   | Budget detail           |
| PUT    | `/budgets/{id}`   | Update budget           |
| DELETE | `/budgets/{id}`   | Delete budget           |

**Programs & Archives (Standard CRUD Resource)**

| Endpoint              | Resource        |
|-----------------------|-----------------|
| `/programs`           | Village Programs|
| `/archives`           | Document Archive|

**News & Gallery (CRUD Resource)**

| Endpoint              | Resource        |
|-----------------------|-----------------|
| `/news`               | Village News    |
| `/gallery`            | Photo Gallery   |

---

### Roles & Middleware

Roles are enforced via the `role:` middleware applied to route groups:

| Role              | ID  |
|-------------------|-----|
| Admin Desa        | 1   |
| Kepala Desa       | 2   |
| Sekretaris Desa   | 3   |
| Bendahara         | 4   |
| Warga             | 5   |

---

### Default Accounts (After Seeding)

```bash
php artisan migrate --seed
```

| Role              | Email                   | Password         |
|-------------------|-------------------------|------------------|
| Admin Desa        | admin1@desa.id          | admindesa1       |
| Kepala Desa       | kepdes1@desa.id         | kepdesdesa1      |
| Sekretaris Desa   | sekdes1@desa.id         | sekdes1          |
| Bendahara         | bendahara1@desa.id      | bendaharadesa1   |
| Warga (Citizen)   | wargadesa1@desa.id      | wargadesa1       |

---

### CORS Configuration

CORS configuration is in `config/cors.php`. Make sure `allowed_origins` includes the frontend URL:

```php
'allowed_origins' => ['http://localhost:5173'],
```

---

### Useful Artisan Commands

```bash
# Start the server
php artisan serve

# Re-run all migrations and seeders
php artisan migrate:fresh --seed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# List all API routes
php artisan route:list --path=api

# Run tests
php artisan test
```

---

### Testing

```bash
php artisan test
```

Test files are located in `tests/Feature/` and `tests/Unit/`.
