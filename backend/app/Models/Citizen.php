<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    protected $fillable = [
        'user_id',
        'nik',
        'no_kk',
        'name',
        'birth_date',
        'gender',
        'address',
        'religion',
        'education',
        'occupation',
        'marital_status',
        'is_umkm',
        'umkm_details'
    ];

    protected $casts = [
        'is_umkm' => 'boolean',
        'birth_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
