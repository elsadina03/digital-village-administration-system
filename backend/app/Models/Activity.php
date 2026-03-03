<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'program_id', 'name', 'category', 'budget',
        'status', 'timeline_start', 'timeline_end', 'documentation_path',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
