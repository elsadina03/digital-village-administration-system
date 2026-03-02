<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    protected $fillable = [
        'user_id',
        'letter_type_id',
        'nama',
        'email',
        'wa',
        'alamat',
        'tujuan',
        'koordinat_lat',
        'koordinat_lon',
        'foto_npwp',
        'status',
        'physical_taken',
        'letter_number',
        'document_path'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function letterType()
    {
        return $this->belongsTo(LetterType::class);
    }
}
