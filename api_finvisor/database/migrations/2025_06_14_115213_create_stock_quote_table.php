<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_quote_data', function (Blueprint $table) {
            $table->string('symbol')->primary();
            $table->string('open');
            $table->string('high');
            $table->string('low');
            $table->string('price');
            $table->string('volume');
            $table->string('latest_trading_day');
            $table->string('previous_close');
            $table->string('change');
            $table->string('change_percent');
            $table->date('date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_quote_data');
    }
};
