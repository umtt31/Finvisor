<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockModel extends Model
{
    protected $table = "stocks";

    protected $primaryKey = 'stock_id';

    protected $fillable = [
        'symbol',
        'name',
        'current_price',
        'market_cap',
    ];

    public function stockComments()
    {
        return $this->hasMany(StockCommentModel::class, 'stock_id', 'stock_id');
    }

    public function stockVotes()
    {
        return $this->hasMany(StockVoteModel::class, 'stock_id', 'stock_id');
    }
}
