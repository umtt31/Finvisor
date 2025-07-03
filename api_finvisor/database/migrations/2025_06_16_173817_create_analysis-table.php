<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analysis', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->float('positive_negative');
            $table->json('direction');
            $table->integer('news_count');
            $table->float('confidence');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analysis');
    }
};
