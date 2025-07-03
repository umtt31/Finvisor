<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockDailyModel extends Model
{
    protected $table = 'stock_daily_data';
    protected $primaryKey = 'symbol';
    public $timestamps = false;

    protected $fillable = [
        'symbol',
        'date',
        'open',
        'high',
        'low',
        'close',
        'volume',
    ];

    public function getDailyData(string $symbol)
    {
        $data = $this->where('symbol', $symbol)
            ->orderBy('date', 'desc')
            ->get();
        return $data;
    }

    public function isDailyDataExistsToday(string $symbol)
    {
        $data = $this->where('symbol', $symbol)
            // ->where('date', '>=', date('Y-m-d'))
            ->get();
        return $data->count() > 0;
    }
}
