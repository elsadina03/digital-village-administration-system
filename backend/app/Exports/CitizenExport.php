<?php

namespace App\Exports;

use App\Models\Citizen;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CitizenExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Citizen::all();
    }

    public function headings(): array
    {
        return [
            'ID',
            'NIK',
            'No KK',
            'Nama Lengkap',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'Alamat',
            'Agama',
            'Pendidikan',
            'Pekerjaan',
            'Status Perkawinan',
            'UMKM',
            'Detail UMKM'
        ];
    }

    public function map($citizen): array
    {
        return [
            $citizen->id,
            $citizen->nik,
            $citizen->no_kk,
            $citizen->name,
            $citizen->birth_date,
            $citizen->gender,
            $citizen->address,
            $citizen->religion,
            $citizen->education,
            $citizen->occupation,
            $citizen->marital_status,
            $citizen->is_umkm ? 'Ya' : 'Tidak',
            $citizen->umkm_details ?? '-'
        ];
    }
}
