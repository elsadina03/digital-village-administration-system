<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function index()
    {
        $budgets = Budget::all();
        $totalAnggaran = $budgets->sum('nominal_anggaran');
        $totalRealisasi = $budgets->sum('nominal_realisasi');
        
        return response()->json([
            'message' => 'Success',
            'data' => $budgets,
            'summary' => [
                'total_anggaran' => $totalAnggaran,
                'total_realisasi' => $totalRealisasi,
                'persentase_realisasi' => $totalAnggaran > 0 ? ($totalRealisasi / $totalAnggaran) * 100 : 0
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|string',
            'sumber_dana' => 'required|string',
            'nominal_anggaran' => 'required|numeric',
            'nominal_realisasi' => 'nullable|numeric',
            'keterangan' => 'nullable|string'
        ]);

        $budget = Budget::create($request->all());

        return response()->json([
            'message' => 'Data anggaran berhasil ditambahkan',
            'data' => $budget
        ], 201);
    }
}
