<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            $table->string('nama')->after('user_id');
            $table->string('email')->after('nama');
            $table->string('wa')->after('email');
            $table->string('alamat')->after('wa');
            $table->string('tujuan')->nullable()->after('alamat');
            $table->string('koordinat_lat')->nullable()->after('tujuan');
            $table->string('koordinat_lon')->nullable()->after('koordinat_lat');
            $table->string('foto_npwp')->nullable()->after('koordinat_lon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            $table->dropColumn([
                'nama', 'email', 'wa', 'alamat', 'tujuan', 'koordinat_lat', 'koordinat_lon', 'foto_npwp'
            ]);
        });
    }
};
