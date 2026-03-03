<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\News;
use App\Services\FonnteService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    protected FonnteService $fonnte;

    public function __construct(FonnteService $fonnte)
    {
        $this->fonnte = $fonnte;
    }

    public function index()
    {
        $news = News::with('author:id,name')
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json(['message' => 'Success', 'data' => $news]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news', 'public');
        }

        $news = News::create([
            'title'        => $request->input('title'),
            'content'      => $request->input('content'),
            'image_path'   => $imagePath,
            'author_id'    => Auth::id(),
            'published_at' => now(),
        ]);

        // Kirim notifikasi ke semua warga yang punya nomor HP
        $phones = User::whereHas('role', fn($q) => $q->where('name', 'Warga'))
            ->whereNotNull('phone')
            ->pluck('phone')
            ->toArray();

        foreach ($phones as $phone) {
            $this->fonnte->send($phone, "📰 Berita Desa Baru!\n\n*{$news->title}*\n\nKunjungi website desa untuk membaca selengkapnya.");
        }

        return response()->json(['message' => 'Berita berhasil ditambahkan', 'data' => $news->load('author:id,name')], 201);
    }

    public function show(News $news)
    {
        return response()->json(['message' => 'Success', 'data' => $news->load('author:id,name')]);
    }

    public function update(Request $request, News $news)
    {
        $request->validate([
            'title'   => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'image'   => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            if ($news->image_path) Storage::disk('public')->delete($news->image_path);
            $news->image_path = $request->file('image')->store('news', 'public');
        }

        $news->fill($request->only('title', 'content'))->save();

        return response()->json(['message' => 'Berita berhasil diperbarui', 'data' => $news]);
    }

    public function destroy(News $news)
    {
        if ($news->image_path) Storage::disk('public')->delete($news->image_path);
        $news->delete();
        return response()->json(['message' => 'Berita berhasil dihapus']);
    }
}
