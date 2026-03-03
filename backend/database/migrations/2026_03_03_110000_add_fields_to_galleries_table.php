<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->string('judul')->nullable()->after('title');
            $table->string('kategori')->nullable()->after('judul');
            $table->date('tanggal')->nullable()->after('kategori');
        });
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropColumn(['judul', 'kategori', 'tanggal']);
        });
    }
};
