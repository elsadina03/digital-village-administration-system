<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            $table->text('rejection_note')->nullable()->after('document_path');
            $table->string('processed_by')->nullable()->after('rejection_note'); // nama sekretaris
        });
    }

    public function down(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            $table->dropColumn(['rejection_note', 'processed_by']);
        });
    }
};
