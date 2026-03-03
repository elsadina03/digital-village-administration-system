<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'tahun',
        'kategori',
        'deskripsi',
        'bulan',
        'sumber_dana',
        'nominal_anggaran',
        'nominal_realisasi',
        'keterangan'
    ];
}
