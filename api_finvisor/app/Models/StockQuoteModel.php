<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockQuoteModel extends Model
{
    protected $table = 'stock_quote_data';
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
        'price',
        'latest_trading_day',
        'previous_close',
        'change',
        'change_percent'
    ];

    public function getQuote(string $symbol)
    {
        $data = $this->where('symbol', $symbol)->get();
        return $data;
    }

    public function isQuoteExistsToday(string $symbol)
    {
        $data = $this->where('symbol', $symbol)
            ->where('date', '>=', date('Y-m-d'))->get();
        return $data->count() > 0;
    }
}
