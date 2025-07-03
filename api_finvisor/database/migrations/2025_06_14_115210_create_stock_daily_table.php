<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_daily_data', function (Blueprint $table) {
            $table->string('symbol');
            $table->date('date');

            $table->primary(['symbol', 'date']);

            $table->string('open');
            $table->string('high');
            $table->string('low');
            $table->string('close');
            $table->string('volume');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_daily_data');
    }
};
