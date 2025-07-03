<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LikeModel extends Model
{
    protected $table = "likes";

    protected $primaryKey = 'id';

    protected $fillable = [
        'post_id',
        'user_id',
        'comment_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function post()
    {
        return $this->belongsTo(PostModel::class, 'post_id', 'post_id');
    }

    public function comment()
    {
        return $this->belongsTo(CommentModel::class, 'comment_id', 'comment_id');
    }
}
