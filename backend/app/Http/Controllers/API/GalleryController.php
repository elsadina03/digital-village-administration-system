<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gallery;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Success', 'data' => Gallery::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image'    => 'required|image|max:4096',
            'judul'    => 'nullable|string|max:255',
            'kategori' => 'nullable|string|max:100',
            'tanggal'  => 'nullable|date',
        ]);

        $path = $request->file('image')->store('gallery', 'public');

        $judul = $request->judul ?? $request->title ?? 'Foto Desa';
        $gallery = Gallery::create([
            'title'      => $judul,
            'judul'      => $judul,
            'kategori'   => $request->kategori,
            'tanggal'    => $request->tanggal,
            'image_path' => $path,
        ]);

        return response()->json(['message' => 'Foto berhasil diunggah', 'data' => $gallery], 201);
    }

    public function destroy(Gallery $gallery)
    {
        if ($gallery->image_path) Storage::disk('public')->delete($gallery->image_path);
        $gallery->delete();
        return response()->json(['message' => 'Foto berhasil dihapus']);
    }
}
