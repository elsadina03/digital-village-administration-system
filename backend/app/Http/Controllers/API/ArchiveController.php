<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Archive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Archive::query();
        
        // Filter by type (pribadi / desa)
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // If user is Warga, they can only see their own 'pribadi' archives and all 'desa' archives
        if ($user->role->name === 'Warga') {
            $query->where(function ($q) use ($user) {
                $q->where('uploaded_by', $user->id) // 'pribadi' docs uploaded by them
                  ->orWhere('type', 'desa'); // all 'desa' docs
            });
        }
        
        $archives = $query->latest()->get();
        return response()->json($archives);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'type' => 'required|in:pribadi,desa',
            'file' => 'required|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:5120', // Max 5MB
        ]);

        $user = Auth::user();

        // Check permission if trying to upload 'desa' archive
        if ($request->type === 'desa' && $user->role->name === 'Warga') {
            return response()->json(['message' => 'Unauthorized to upload arsip desa'], 403);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('archives', $fileName, 'public');

        $archive = Archive::create([
            'title' => $request->title,
            'category' => $request->category,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => 'storage/' . $filePath,
            'type' => $request->type,
            'uploaded_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Arsip has been uploaded successfully',
            'data' => $archive
        ], 201);
    }

    public function destroy($id)
    {
        $archive = Archive::findOrFail($id);
        $user = Auth::user();

        // Check permission: Warga can only delete their own
        if ($user->role->name === 'Warga' && $archive->uploaded_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this arsip'], 403);
        }

        $storagePath = str_replace('storage/', '', $archive->file_path);
        if (Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
        }

        $archive->delete();

        return response()->json(['message' => 'Arsip deleted successfully']);
    }
}
