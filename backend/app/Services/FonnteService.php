<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    /**
     * Kirim pesan WhatsApp melalui Fonnte API.
     *
     * Cara mendapatkan token Fonnte:
     * 1. Daftar di https://fonnte.com/
     * 2. Masuk ke dashboard → tambah perangkat → hubungkan nomor WhatsApp (scan QR)
     * 3. Setelah tersambung, copy token dari dashboard perangkat tersebut
     * 4. Isi FONNTE_TOKEN di file .env backend dengan token yang sudah di-copy
     *
     * @param string $target   Nomor HP tujuan (format: 628xxxxxxxxxx atau 08xxxxxxxxxx)
     * @param string $message  Isi pesan (bisa pakai *bold*, _italic_, dll.)
     */
    public function send(string $target, string $message): bool
    {
        $token = config('services.fonnte.token');

        if (empty($token)) {
            Log::warning('FonnteService: Token belum diset. Pesan tidak dikirim ke ' . $target);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target'  => $target,
                'message' => $message,
            ]);

            if ($response->successful() && $response->json('status') !== false) {
                Log::info("FonnteService: Pesan terkirim ke {$target}");
                return true;
            }

            Log::warning('FonnteService: Gagal mengirim ke ' . $target . ' — ' . $response->body());
            return false;
        } catch (\Throwable $e) {
            Log::error('FonnteService exception: ' . $e->getMessage());
            return false;
        }
    }
}
