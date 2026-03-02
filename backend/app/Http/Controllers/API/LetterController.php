<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Letter;
use App\Models\LetterType;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $query = Letter::with('letterType');
        // Warga hanya bisa melihat datanya sendiri. Admin dan Kades bisa melihat semua.
        if ($request->user() && $request->user()->role->name === 'Warga') {
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
        if (request()->user() && request()->user()->role->name === 'Warga') {
            if ($letter->user_id !== request()->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json(['message' => 'Success', 'data' => $letter]);
    }

    public function update(Request $request, $id)
    {
        $letter = Letter::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|required|string|in:pending,diproses,selesai,ditolak',
            'physical_taken' => 'sometimes|required|boolean',
            'letter_number' => 'sometimes|nullable|string',
            'document_path' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:10240'
        ]);

        $data = $request->except(['document_path']);

        if ($request->hasFile('document_path')) {
            $path = $request->file('document_path')->store('processed_letters', 'public');
            $data['document_path'] = $path;
        }

        $letter->update($data);

        return response()->json(['message' => 'Surat berhasil diupdate', 'data' => $letter]);
    }

    public function destroy($id)
    {
        $letter = Letter::findOrFail($id);
        $letter->delete();
        
        return response()->json(['message' => 'Surat berhasil dihapus']);
    }
}
