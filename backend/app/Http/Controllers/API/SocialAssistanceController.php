<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SocialAssistance;
use App\Models\AssistanceRecipient;

class SocialAssistanceController extends Controller
{
    /* ─── Bantuan Sosial Programs ───────────────────────────── */

    public function index()
    {
        $assistances = SocialAssistance::withCount('recipients')->get();

        $stats = [
            'total_penerima'     => AssistanceRecipient::count(),
            'jenis_bantuan'      => SocialAssistance::count(),
            'total_distribusi'   => AssistanceRecipient::where('status', 'received')
                ->join('social_assistances', 'social_assistances.id', '=', 'assistance_recipients.social_assistance_id')
                ->sum('social_assistances.nominal'),
            'perlu_verifikasi'   => AssistanceRecipient::where('status', 'pending')->count(),
        ];

        return response()->json([
            'message' => 'Success',
            'data'    => $assistances,
            'stats'   => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'type'        => 'required|string',
            'period'      => 'required|string',
            'total_quota' => 'required|integer',
            'nominal'     => 'required|numeric',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ]);

        $assistance = SocialAssistance::create($request->all());

        return response()->json(['message' => 'Program bantuan berhasil ditambahkan', 'data' => $assistance], 201);
    }

    public function show(SocialAssistance $socialAssistance)
    {
        return response()->json([
            'message' => 'Success',
            'data'    => $socialAssistance->load(['recipients.citizen']),
        ]);
    }

    public function update(Request $request, SocialAssistance $socialAssistance)
    {
        $socialAssistance->update($request->all());
        return response()->json(['message' => 'Program bantuan berhasil diperbarui', 'data' => $socialAssistance]);
    }

    public function destroy(SocialAssistance $socialAssistance)
    {
        $socialAssistance->delete();
        return response()->json(['message' => 'Program bantuan berhasil dihapus']);
    }

    /* ─── Recipients (penerima) ─────────────────────────────── */

    public function recipients(Request $request)
    {
        $query = AssistanceRecipient::with(['citizen', 'socialAssistance'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('type'), fn($q) =>
                $q->whereHas('socialAssistance', fn($p) => $p->where('type', $request->type))
            );

        $recipients = $query->get()->map(function ($r) {
            return [
                'id'           => $r->id,
                'nik'          => $r->citizen->nik ?? '-',
                'nama'         => $r->citizen->name ?? '-',
                'alamat'       => $r->citizen->address ?? '-',
                'jenis'        => $r->socialAssistance->type ?? '-',
                'nama_program' => $r->socialAssistance->name ?? '-',
                'jumlah'       => $r->socialAssistance->nominal ?? 0,
                'tgl_terima'   => $r->received_date,
                'status'       => ucfirst($r->status),
            ];
        });

        return response()->json(['message' => 'Success', 'data' => $recipients]);
    }

    public function addRecipient(Request $request, SocialAssistance $socialAssistance)
    {
        $request->validate([
            'citizen_id'    => 'required|exists:citizens,id',
            'status'        => 'nullable|in:pending,approved,rejected,received',
            'received_date' => 'nullable|date',
        ]);

        $recipient = AssistanceRecipient::create([
            'social_assistance_id' => $socialAssistance->id,
            'citizen_id'           => $request->citizen_id,
            'status'               => $request->status ?? 'pending',
            'received_date'        => $request->received_date,
        ]);

        return response()->json(['message' => 'Penerima berhasil ditambahkan', 'data' => $recipient], 201);
    }

    public function updateRecipient(Request $request, AssistanceRecipient $recipient)
    {
        $request->validate([
            'status'        => 'required|in:pending,approved,rejected,received',
            'received_date' => 'nullable|date',
        ]);

        $recipient->update($request->only('status', 'received_date'));

        return response()->json(['message' => 'Status penerima berhasil diperbarui', 'data' => $recipient]);
    }

    public function removeRecipient(AssistanceRecipient $recipient)
    {
        $recipient->delete();
        return response()->json(['message' => 'Penerima berhasil dihapus']);
    }
}
