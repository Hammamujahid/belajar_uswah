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
        Schema::table('questions', function (Blueprint $table) {
            $table->string('public_id')->nullable()->after('media_path');
        });

        Schema::table('answers', function (Blueprint $table) {
            $table->string('media_path')->nullable()->after('answer_text');
            $table->string('public_id')->nullable()->after('media_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('public_id');
        });

        Schema::table('answers', function (Blueprint $table) {
            $table->dropColumn(['media_path', 'public_id']);
        });
    }
};
