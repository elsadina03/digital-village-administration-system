<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialAssistance extends Model
{
    protected $fillable = [
        'name', 'type', 'period', 'total_quota',
        'nominal', 'description', 'is_active',
    ];

    public function recipients()
    {
        return $this->hasMany(AssistanceRecipient::class);
    }
}
