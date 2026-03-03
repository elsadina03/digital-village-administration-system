<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $query = Budget::query();

        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }
        if ($request->filled('bulan')) {
            $query->where('bulan', $request->bulan);
        }

        $budgets = $query->orderBy('created_at', 'desc')->get();

        $totalAnggaran  = $budgets->sum('nominal_anggaran');
        $totalRealisasi = $budgets->sum('nominal_realisasi');
        $pemasukan      = $budgets->where('kategori', 'Pemasukan')->sum('nominal_anggaran');
        $pengeluaran    = $budgets->where('kategori', '!=', 'Pemasukan')->sum('nominal_anggaran');

        return response()->json([
            'message' => 'Success',
            'data' => $budgets,
            'summary' => [
                'total_anggaran'        => $totalAnggaran,
                'total_realisasi'       => $totalRealisasi,
                'total_pemasukan'       => $pemasukan,
                'total_pengeluaran'     => $pengeluaran,
                'sisa_anggaran'         => $totalAnggaran - $totalRealisasi,
                'persentase_realisasi'  => $totalAnggaran > 0 ? round(($totalRealisasi / $totalAnggaran) * 100, 2) : 0,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun'              => 'required|string',
            'kategori'           => 'required|string',
            'deskripsi'          => 'nullable|string',
            'bulan'              => 'nullable|string',
            'sumber_dana'        => 'required|string',
            'nominal_anggaran'   => 'required|numeric',
            'nominal_realisasi'  => 'nullable|numeric',
            'keterangan'         => 'nullable|string',
        ]);

        $budget = Budget::create($request->all());

        return response()->json([
            'message' => 'Data anggaran berhasil ditambahkan',
            'data'    => $budget,
        ], 201);
    }

    public function show(Budget $budget)
    {
        return response()->json(['message' => 'Success', 'data' => $budget]);
    }

    public function update(Request $request, Budget $budget)
    {
        $request->validate([
            'tahun'              => 'sometimes|string',
            'kategori'           => 'sometimes|string',
            'deskripsi'          => 'nullable|string',
            'bulan'              => 'nullable|string',
            'sumber_dana'        => 'sometimes|string',
            'nominal_anggaran'   => 'sometimes|numeric',
            'nominal_realisasi'  => 'nullable|numeric',
            'keterangan'         => 'nullable|string',
        ]);

        $budget->update($request->all());

        return response()->json([
            'message' => 'Data anggaran berhasil diperbarui',
            'data'    => $budget,
        ]);
    }

    public function destroy(Budget $budget)
    {
        $budget->delete();
        return response()->json(['message' => 'Data anggaran berhasil dihapus']);
    }
}
