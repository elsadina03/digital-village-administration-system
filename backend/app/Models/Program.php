<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'name', 'year', 'target',
        'nama', 'kategori', 'deskripsi',
        'tanggal_mulai', 'tanggal_selesai',
        'anggaran', 'penanggung_jawab', 'penanggung_jawab_id',
    ];

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
