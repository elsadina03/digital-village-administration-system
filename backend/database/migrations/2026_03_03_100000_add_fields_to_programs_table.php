<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('nama')->nullable()->after('id');
            $table->string('kategori')->nullable()->after('nama');
            $table->text('deskripsi')->nullable()->after('kategori');
            $table->date('tanggal_mulai')->nullable()->after('deskripsi');
            $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
            $table->unsignedBigInteger('anggaran')->default(0)->after('tanggal_selesai');
            $table->string('penanggung_jawab')->nullable()->after('anggaran');
            $table->unsignedBigInteger('penanggung_jawab_id')->nullable()->after('penanggung_jawab');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['nama','kategori','deskripsi','tanggal_mulai','tanggal_selesai','anggaran','penanggung_jawab','penanggung_jawab_id']);
        });
    }
};
