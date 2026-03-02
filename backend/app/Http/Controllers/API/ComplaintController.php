<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Complaint;

class ComplaintController extends Controller
{
    public function index(Request $request)
    {
        $query = Complaint::query();
        // Warga hanya bisa melihat datanya sendiri. Admin dan Kades bisa melihat semua.
        if ($request->user() && $request->user()->role->name === 'Warga') {
            $query->where('user_id', $request->user()->id);
        }
        $complaints = $query->latest()->get();
        return response()->json(['message' => 'Success', 'data' => $complaints]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'wa' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:10240'
        ]);

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('complaints', 'public');
        }

        $complaint = Complaint::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'nama' => $request->nama,
            'wa' => $request->wa,
            'title' => $request->title,
            'description' => $request->description,
            'photo_path' => $path,
            'status' => 'Diterima'
        ]);

        return response()->json(['message' => 'Pengaduan berhasil dikirim', 'data' => $complaint], 201);
    }

    public function show($id)
    {
        $complaint = Complaint::with('user')->findOrFail($id);
        
        // Cek jika Warga, file hanya bisa diakses oleh pembuatnya sendiri
        if (request()->user() && request()->user()->role->name === 'Warga') {
            if ($complaint->user_id !== request()->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json(['message' => 'Success', 'data' => $complaint]);
    }

    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|required|string|in:Diterima,Diproses,Selesai,Ditolak',
        ]);

        $complaint->update($request->only('status'));

        return response()->json(['message' => 'Status pengaduan berhasil diupdate', 'data' => $complaint]);
    }

    public function destroy($id)
    {
        $complaint = Complaint::findOrFail($id);
        $complaint->delete();
        
        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }
}
