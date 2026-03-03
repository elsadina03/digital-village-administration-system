<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gallery;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['judul' => 'Gotong Royong Bersih Desa', 'kategori' => 'Kegiatan', 'tanggal' => '2025-02-15', 'seed' => 'gotong1'],
            ['judul' => 'Musyawarah Desa Tahunan', 'kategori' => 'Pemerintahan', 'tanggal' => '2025-03-10', 'seed' => 'musdes1'],
            ['judul' => 'Pembangunan Jalan Desa RT 03', 'kategori' => 'Pembangunan', 'tanggal' => '2025-04-05', 'seed' => 'jalan1'],
            ['judul' => 'Posyandu Balita Bulan April', 'kategori' => 'Kesehatan', 'tanggal' => '2025-04-12', 'seed' => 'posyandu1'],
            ['judul' => 'Pembagian Bantuan Sosial BLT', 'kategori' => 'Bantuan Sosial', 'tanggal' => '2025-05-01', 'seed' => 'blt2025'],
            ['judul' => 'Pemasangan Lampu Jalan Solar', 'kategori' => 'Pembangunan', 'tanggal' => '2025-05-20', 'seed' => 'lampu1'],
            ['judul' => 'Pelatihan UMKM Warga Desa', 'kategori' => 'Kegiatan', 'tanggal' => '2025-06-08', 'seed' => 'umkm1'],
            ['judul' => 'Vaksinasi Massal Warga', 'kategori' => 'Kesehatan', 'tanggal' => '2025-06-25', 'seed' => 'vaksin1'],
            ['judul' => 'Peresmian Balai Desa Baru', 'kategori' => 'Pemerintahan', 'tanggal' => '2025-07-17', 'seed' => 'balai1'],
            ['judul' => 'Lomba 17 Agustus Desa Bahagia', 'kategori' => 'Kegiatan', 'tanggal' => '2025-08-17', 'seed' => 'lomba17'],
            ['judul' => 'Penyerahan Bantuan Sembako', 'kategori' => 'Bantuan Sosial', 'tanggal' => '2025-09-05', 'seed' => 'sembako1'],
            ['judul' => 'Perbaikan Saluran Irigasi', 'kategori' => 'Pembangunan', 'tanggal' => '2025-09-22', 'seed' => 'irigasi1'],
            ['judul' => 'Rapat Koordinasi Perangkat Desa', 'kategori' => 'Pemerintahan', 'tanggal' => '2025-10-10', 'seed' => 'rapat1'],
            ['judul' => 'Penyuluhan Pertanian Organik', 'kategori' => 'Kegiatan', 'tanggal' => '2025-11-03', 'seed' => 'tani1'],
            ['judul' => 'Natal & Tahun Baru Bersama', 'kategori' => 'Kegiatan', 'tanggal' => '2025-12-31', 'seed' => 'newyear1'],
            ['judul' => 'Pembangunan Drainase RW 02', 'kategori' => 'Pembangunan', 'tanggal' => '2026-01-14', 'seed' => 'drain1'],
            ['judul' => 'Pelatihan Kadus & BPD', 'kategori' => 'Pemerintahan', 'tanggal' => '2026-02-05', 'seed' => 'kadus1'],
            ['judul' => 'Fogging Nyamuk Wilayah Desa', 'kategori' => 'Kesehatan', 'tanggal' => '2026-02-20', 'seed' => 'fogging1'],
        ];

        foreach ($items as $item) {
            Gallery::create([
                'title'      => $item['judul'],
                'judul'      => $item['judul'],
                'kategori'   => $item['kategori'],
                'tanggal'    => $item['tanggal'],
                'image_path' => 'https://picsum.photos/seed/' . $item['seed'] . '/800/600',
            ]);
        }
    }
}
