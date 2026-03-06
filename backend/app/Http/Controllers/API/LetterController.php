<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Letter;
use App\Models\LetterType;
use App\Services\FonnteService;

class LetterController extends Controller
{
    protected FonnteService $fonnte;

    public function __construct(FonnteService $fonnte)
    {
        $this->fonnte = $fonnte;
    }
    public function index(Request $request)
    {
        $query = Letter::with('letterType');
        // Hanya staf admin yang boleh melihat semua surat. Role lain (Warga, Bendahara, dll) hanya melihat miliknya sendiri.
        $adminRoles = ['Admin Desa', 'Kepala Desa', 'Sekretaris Desa'];
        if ($request->user() && !in_array($request->user()->role?->name, $adminRoles)) {
            $query->where('user_id', $request->user()->id);
        }
        $letters = $query->latest()->get();
        return response()->json(['message' => 'Success', 'data' => $letters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jenis_surat' => 'required|string',
            'nama' => 'required|string',
            'email' => 'required|email',
            'wa' => 'required|string',
            'alamat' => 'required|string',
            'tujuan' => 'nullable|string',
            'koordinat_lat' => 'nullable|string',
            'koordinat_lon' => 'nullable|string',
            'foto_npwp' => 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:10240'
        ]);

        $letterType = LetterType::firstOrCreate(['name' => $request->jenis_surat]);

        $path = null;
        if ($request->hasFile('foto_npwp')) {
            $path = $request->file('foto_npwp')->store('letters', 'public');
        }

        $letter = Letter::create([
            'user_id' => $request->user() ? $request->user()->id : 1, // Fallback if no auth
            'letter_type_id' => $letterType->id,
            'nama' => $request->nama,
            'email' => $request->email,
            'wa' => $request->wa,
            'alamat' => $request->alamat,
            'tujuan' => $request->tujuan,
            'koordinat_lat' => $request->koordinat_lat,
            'koordinat_lon' => $request->koordinat_lon,
            'foto_npwp' => $path,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Pengajuan surat berhasil', 'data' => $letter], 201);
    }

    public function show($id)
    {
        $letter = Letter::with(['user', 'letterType'])->findOrFail($id);
        
        // Cek jika Warga, file hanya bisa diakses oleh pembuatnya sendiri
        if (request()->user() && request()->user()->role?->name === 'Warga') {
            if ($letter->user_id !== request()->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json(['message' => 'Success', 'data' => $letter]);
    }

    /**
     * Generate a unique letter number.
     * Format: NNN/JENIS/DS/BULAN_ROMAWI/TAHUN
     */
    public function generateNumber(Request $request)
    {
        $year  = now()->year;
        $month = now()->month;
        $romans = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

        $count = Letter::whereYear('created_at', $year)->whereNotNull('letter_number')->count() + 1;
        $seq   = str_pad($count, 3, '0', STR_PAD_LEFT);

        $jenis = $request->query('jenis', 'SK');
        // shorten jenis surat to abbreviation
        $abbr = match(strtolower($jenis)) {
            'surat keterangan domisili' => 'SKD',
            'surat keterangan beasiswa' => 'SKB',
            'surat tidak mampu'         => 'STM',
            'surat usaha'               => 'SU',
            default                     => 'SK',
        };

        $number = "{$seq}/{$abbr}/DS/{$romans[$month]}/{$year}";
        return response()->json(['letter_number' => $number]);
    }

    public function update(Request $request, $id)
    {
        $letter = Letter::findOrFail($id);
        
        $request->validate([
            'status'         => 'sometimes|required|string|in:pending,diproses,menunggu_kepdes,selesai,ditolak',
            'physical_taken' => 'sometimes|required|boolean',
            'letter_number'  => 'sometimes|nullable|string',
            'rejection_note' => 'sometimes|nullable|string',
            'processed_by'   => 'sometimes|nullable|string',
            'document_path'  => 'sometimes|nullable|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
        ]);

        $oldStatus = $letter->status;
        $data = $request->except(['document_path']);

        if ($request->hasFile('document_path')) {
            $path = $request->file('document_path')->store('processed_letters', 'public');
            $data['document_path'] = $path;
        }

        $letter->update($data);
        $letter->refresh();

        // Kirim notifikasi WhatsApp ke pemohon
        $waNumber = $letter->wa;
        $newStatus = $letter->status;

        if ($waNumber && $oldStatus !== $newStatus) {
            $msg = match($newStatus) {
                'menunggu_kepdes' =>
                    "📋 *Update Status Surat*\n\nYth. {$letter->nama},\nPengajuan surat *{$letter->letterType?->name}* Anda sedang ditinjau oleh Kepala Desa ⏳.\n\nNomor Surat: {$letter->letter_number}\n\nSilakan cek aplikasi desa untuk informasi lebih lanjut.",
                'selesai' =>
                    "✅ *Surat Anda Disetujui*\n\nYth. {$letter->nama},\nSurat *{$letter->letterType?->name}* Anda telah disetujui oleh Kepala Desa.\nNomor Surat: {$letter->letter_number}\n\nSilakan unduh surat di aplikasi desa.",
                'ditolak' =>
                    "❌ *Surat Anda Ditolak*\n\nYth. {$letter->nama},\nMohon maaf, pengajuan surat *{$letter->letterType?->name}* Anda ditolak.\nAlasan: {$letter->rejection_note}\n\nSilakan ajukan ulang jika diperlukan.",
                default => null,
            };
            if ($msg) {
                $this->fonnte->send($waNumber, $msg);
            }
        }

        return response()->json(['message' => 'Surat berhasil diupdate', 'data' => $letter->load('letterType', 'user')]);
    }

    public function destroy($id)
    {
        $letter = Letter::findOrFail($id);
        $user = \Illuminate\Support\Facades\Auth::user();

        $staffRoles = ['Admin Desa', 'Kepala Desa', 'Sekretaris Desa', 'Bendahara'];
        $isStaff = in_array($user->role->name, $staffRoles);

        if (!$isStaff) {
            // Warga hanya bisa hapus surat miliknya sendiri yang masih pending atau ditolak
            if ($letter->user_id !== $user->id) {
                return response()->json(['message' => 'Tidak diizinkan menghapus surat ini.'], 403);
            }
            if (!in_array($letter->status, ['pending', 'ditolak'])) {
                return response()->json(['message' => 'Surat yang sudah diproses tidak dapat dihapus.'], 403);
            }
        }

        $letter->delete();
        
        return response()->json(['message' => 'Surat berhasil dihapus']);
    }
}
