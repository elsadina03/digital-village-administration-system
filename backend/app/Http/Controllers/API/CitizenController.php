<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CitizenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $citizens = Citizen::with('user')->get();
        return response()->json($citizens);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nik' => 'required|string|size:16|unique:citizens,nik',
            'no_kk' => 'required|string|size:16',
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
            'religion' => 'nullable|string',
            'education' => 'nullable|string',
            'occupation' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'is_umkm' => 'nullable|boolean',
            'umkm_details' => 'nullable|string|required_if:is_umkm,true',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $citizen = Citizen::create($validatedData);

        return response()->json([
            'message' => 'Citizen created successfully',
            'data' => $citizen
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $citizen = Citizen::with('user')->findOrFail($id);
        return response()->json($citizen);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $citizen = Citizen::findOrFail($id);

        $validatedData = $request->validate([
            'nik' => ['string', 'size:16', Rule::unique('citizens')->ignore($citizen->id)],
            'no_kk' => 'string|size:16',
            'name' => 'string|max:255',
            'birth_date' => 'date',
            'gender' => 'in:Laki-laki,Perempuan',
            'address' => 'string',
            'religion' => 'nullable|string',
            'education' => 'nullable|string',
            'occupation' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'is_umkm' => 'nullable|boolean',
            'umkm_details' => 'nullable|string|required_if:is_umkm,true',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $citizen->update($validatedData);

        return response()->json([
            'message' => 'Citizen updated successfully',
            'data' => $citizen
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $citizen = Citizen::findOrFail($id);
        $citizen->delete();

        return response()->json([
            'message' => 'Citizen deleted successfully'
        ]);
    }

    /**
     * Get population statistics.
     */
    public function stats()
    {
        $totalCitizens = Citizen::count();
        $genderStats = Citizen::selectRaw('gender, count(*) as count')->groupBy('gender')->get();
        $ageStats = Citizen::selectRaw('
            CASE
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 17 THEN "Anak-anak"
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 17 AND 30 THEN "Pemuda"
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 31 AND 59 THEN "Dewasa"
                ELSE "Lansia"
            END as age_group,
            count(*) as count
        ')->groupBy('age_group')->get();

        $umkmStats = [
            'total_umkm' => Citizen::where('is_umkm', true)->count(),
            'non_umkm' => Citizen::where('is_umkm', false)->count()
        ];

        return response()->json([
            'total_citizens' => $totalCitizens,
            'gender_stats' => $genderStats,
            'age_stats' => $ageStats,
            'umkm_stats' => $umkmStats,
        ]);
    }

    /**
     * Import citizens from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls'
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\CitizenImport, $request->file('file'));

            return response()->json([
                'message' => 'Data penduduk berhasil diimport!'
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            
            foreach ($failures as $failure) {
                $errors[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                ];
            }

            return response()->json([
                'message' => 'Terdapat kesalahan validasi pada file Excel.',
                'errors' => $errors
            ], 422);
        } catch (\Exception $e) {
             return response()->json([
                'message' => 'Terjadi kesalahan saat import data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export citizens to Excel
     */
    public function export()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\CitizenExport, 'data_penduduk.xlsx');
    }
}
