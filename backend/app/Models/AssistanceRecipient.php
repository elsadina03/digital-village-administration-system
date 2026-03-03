<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssistanceRecipient extends Model
{
    protected $fillable = [
        'social_assistance_id', 'citizen_id', 'status', 'received_date',
    ];

    public function socialAssistance()
    {
        return $this->belongsTo(SocialAssistance::class);
    }

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }
}
