<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->string('kategori')->default('Pemasukan')->after('tahun');
            $table->string('deskripsi')->nullable()->after('kategori');
            $table->string('bulan')->nullable()->after('deskripsi');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'deskripsi', 'bulan']);
        });
    }
};
