<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockVoteModel extends Model
{
    protected $table = "stock_votes";

    protected $primaryKey = 'id';

    protected $fillable = [
        'stock_id',
        'user_id',
        'direction'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function stock()
    {
        return $this->belongsTo(StockModel::class, 'stock_id', 'stock_id');
    }
}
