<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'wa',
        'title',
        'description',
        'photo_path',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
