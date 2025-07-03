<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockCommentModel extends Model
{
    protected $table = "stock_comments";

    protected $primaryKey = 'stock_comment_id';

    protected $fillable = [
        'user_id',
        'stock_id',
        'content',
        'image',
    ];

    public function stock()
    {
        return $this->belongsTo(StockModel::class, 'stock_id', 'stock_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
