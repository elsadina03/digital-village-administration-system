<?php

namespace App\Imports;

use App\Models\Citizen;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CitizenImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Parse the birth date safely
        $birthDate = null;
        if (!empty($row['tanggal_lahir'])) {
            try {
                // If it's Excel serialized date
                if (is_numeric($row['tanggal_lahir'])) {
                    $birthDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['tanggal_lahir'])->format('Y-m-d');
                } else {
                    $birthDate = Carbon::parse($row['tanggal_lahir'])->format('Y-m-d');
                }
            } catch (\Exception $e) {
                $birthDate = null;
            }
        }

        return new Citizen([
            'nik'            => $row['nik'],
            'no_kk'          => $row['no_kk'],
            'name'           => $row['nama_lengkap'],
            'birth_date'     => $birthDate,
            'gender'         => $row['jenis_kelamin'],
            'address'        => $row['alamat'],
            'religion'       => $row['agama'] ?? null,
            'education      ' => $row['pendidikan'] ?? null,
            'occupation'     => $row['pekerjaan'] ?? null,
            'marital_status' => $row['status_perkawinan'] ?? null,
            'is_umkm'        => strtolower($row['umkm']) === 'ya' ? true : false,
            'umkm_details'   => $row['detail_umkm'] ?? null,
        ]);
    }

     public function rules(): array
    {
        return [
            'nik' => 'required|string|size:16|unique:citizens,nik',
            'no_kk' => 'required|string|size:16',
            'nama_lengkap' => 'required|string|max:255',
            'tanggal_lahir' => 'required',
            'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
            'alamat' => 'required|string',
        ];
    }
}
