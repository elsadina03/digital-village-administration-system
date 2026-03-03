<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Program;
use App\Models\Activity;
use App\Models\News;
use App\Models\User;
use App\Services\FonnteService;

class ProgramController extends Controller
{
    /* ─── Programs ─────────────────────────────────────────── */

    public function index(Request $request)
    {
        $programs = Program::with('activities')
            ->when($request->filled('year'), fn($q) => $q->where('year', $request->year))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['message' => 'Success', 'data' => $programs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'                => 'required|string|max:255',
            'kategori'            => 'nullable|string',
            'deskripsi'           => 'nullable|string',
            'tanggal_mulai'       => 'nullable|date',
            'tanggal_selesai'     => 'nullable|date',
            'anggaran'            => 'nullable|integer|min:0',
            'penanggung_jawab'    => 'nullable|string',
            'penanggung_jawab_id' => 'nullable|exists:users,id',
        ]);

        $program = Program::create([
            'nama'                => $request->nama,
            'kategori'            => $request->kategori,
            'deskripsi'           => $request->deskripsi,
            'tanggal_mulai'       => $request->tanggal_mulai,
            'tanggal_selesai'     => $request->tanggal_selesai,
            'anggaran'            => $request->anggaran ?? 0,
            'penanggung_jawab'    => $request->penanggung_jawab,
            'penanggung_jawab_id' => $request->penanggung_jawab_id,
            'name' => $request->nama,
            'year' => now()->year,
        ]);

        // Auto-create berita
        $this->createNews($program, $request->user());

        // WA notification to PJ
        if ($request->penanggung_jawab_id) {
            $this->notifyPj($program);
        }

        return response()->json(['message' => 'Program berhasil ditambahkan', 'data' => $program], 201);
    }

    public function show(Program $program)
    {
        return response()->json(['message' => 'Success', 'data' => $program->load('activities')]);
    }

    public function update(Request $request, Program $program)
    {
        $request->validate([
            'nama'                => 'sometimes|string|max:255',
            'kategori'            => 'nullable|string',
            'deskripsi'           => 'nullable|string',
            'tanggal_mulai'       => 'nullable|date',
            'tanggal_selesai'     => 'nullable|date',
            'anggaran'            => 'nullable|integer|min:0',
            'penanggung_jawab'    => 'nullable|string',
            'penanggung_jawab_id' => 'nullable|exists:users,id',
        ]);

        $oldPjId = $program->penanggung_jawab_id;

        $program->update([
            'nama'                => $request->nama ?? $program->nama,
            'kategori'            => $request->kategori,
            'deskripsi'           => $request->deskripsi,
            'tanggal_mulai'       => $request->tanggal_mulai,
            'tanggal_selesai'     => $request->tanggal_selesai,
            'anggaran'            => $request->anggaran ?? $program->anggaran,
            'penanggung_jawab'    => $request->penanggung_jawab,
            'penanggung_jawab_id' => $request->penanggung_jawab_id,
            'name'                => $request->nama ?? $program->name,
        ]);

        // Notify only if PJ changed
        if ($request->penanggung_jawab_id && $request->penanggung_jawab_id != $oldPjId) {
            $this->notifyPj($program);
        }

        return response()->json(['message' => 'Program berhasil diperbarui', 'data' => $program]);
    }

    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(['message' => 'Program berhasil dihapus']);
    }

    /* ─── Activities ────────────────────────────────────────── */

    public function activities(Program $program)
    {
        return response()->json(['message' => 'Success', 'data' => $program->activities]);
    }

    public function storeActivity(Request $request, Program $program)
    {
        $request->validate([
            'name'               => 'required|string',
            'category'           => 'nullable|string',
            'budget'             => 'nullable|numeric',
            'status'             => 'nullable|in:planned,in_progress,completed,cancelled',
            'timeline_start'     => 'nullable|date',
            'timeline_end'       => 'nullable|date',
            'documentation_path' => 'nullable|string',
        ]);

        $activity = $program->activities()->create($request->all());

        return response()->json(['message' => 'Kegiatan berhasil ditambahkan', 'data' => $activity], 201);
    }

    public function updateActivity(Request $request, Program $program, Activity $activity)
    {
        $activity->update($request->all());
        return response()->json(['message' => 'Kegiatan berhasil diperbarui', 'data' => $activity]);
    }

    public function destroyActivity(Program $program, Activity $activity)
    {
        $activity->delete();
        return response()->json(['message' => 'Kegiatan berhasil dihapus']);
    }

    /* --- Private helpers --- */

    private function createNews(Program $program, ?User $author): void
    {
        $tgl = $program->tanggal_mulai
            ? \Carbon\Carbon::parse($program->tanggal_mulai)->translatedFormat('d F Y')
            : '-';
        $anggaranFmt = 'Rp ' . number_format($program->anggaran ?? 0, 0, ',', '.');

        News::create([
            'title'        => '[Program Desa] ' . $program->nama,
            'content'      => "Program baru telah ditambahkan:\n\n"
                . "Nama      : {$program->nama}\n"
                . "Kategori  : {$program->kategori}\n"
                . "Mulai     : {$tgl}\n"
                . "Anggaran  : {$anggaranFmt}\n"
                . ($program->deskripsi ? "\nDeskripsi : {$program->deskripsi}" : ''),
            'author_id'    => $author?->id,
            'published_at' => now(),
        ]);
    }

    private function notifyPj(Program $program): void
    {
        $pj = User::find($program->penanggung_jawab_id);
        if (!$pj || !$pj->phone) return;

        $tgl = $program->tanggal_mulai
            ? \Carbon\Carbon::parse($program->tanggal_mulai)->translatedFormat('d F Y')
            : '-';
        $anggaranFmt = 'Rp ' . number_format($program->anggaran ?? 0, 0, ',', '.');

        $msg = "Halo *{$pj->name}*, Anda ditunjuk sebagai *Penanggung Jawab* untuk program berikut:\n\n"
            . "*Nama Program*  : {$program->nama}\n"
            . "*Kategori*      : {$program->kategori}\n"
            . "*Tanggal Mulai* : {$tgl}\n"
            . "*Total Anggaran*: {$anggaranFmt}\n\n"
            . "Silakan segera koordinasi dengan tim terkait. \u2014 Desa Bahagia";

        app(FonnteService::class)->send($pj->phone, $msg);
    }

    /* ─── Laporan (programs with status summary) ─────────────── */

    public function laporanKegiatan(Request $request)
    {
        $now = now();

        $programs = Program::with('activities')
            ->when($request->filled('year'), fn($q) => $q->where('year', $request->year))
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) use ($now) {
                // Derive status from dates (mirrors frontend logic)
                $start = $p->tanggal_mulai ? \Carbon\Carbon::parse($p->tanggal_mulai) : null;
                $end   = $p->tanggal_selesai ? \Carbon\Carbon::parse($p->tanggal_selesai) : null;

                if (!$start || $now->lt($start)) {
                    $status   = 'Menunggu';
                    $progress = '0%';
                } elseif ($end && $now->gt($end)) {
                    $status   = 'Selesai';
                    $progress = '100%';
                } else {
                    $status   = 'Berlangsung';
                    $progress = '50%';
                }

                return array_merge($p->toArray(), [
                    'status'   => $status,
                    'progress' => $progress,
                ]);
            });

        // Filter by status after computing (since status is derived from dates)
        if ($request->filled('status')) {
            $programs = $programs->filter(fn($p) => $p['status'] === $request->status)->values();
        }

        return response()->json(['message' => 'Success', 'data' => $programs]);
    }
}
