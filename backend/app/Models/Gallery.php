<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = ['title', 'judul', 'kategori', 'tanggal', 'image_path'];
}
