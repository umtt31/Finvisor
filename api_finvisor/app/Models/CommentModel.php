<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentModel extends Model
{
    protected $table = "comments";

    protected $primaryKey = 'comment_id';

    protected $fillable = [
        'user_id',
        'post_id',
        'content',
        'image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function post()
    {
        return $this->belongsTo(PostModel::class, 'post_id', 'post_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes', 'comment_id', 'user_id');
    }

    public function toggleLike(User $user)
    {
        $like = LikeModel::where('user_id', $user->user_id)->where('comment_id', $this->comment_id)->first();
        if ($like) {
            $like->delete();
        } else {
            LikeModel::create([
                'user_id' => $user->user_id,
                'comment_id' => $this->comment_id,
            ]);
        }

        return $like ? 'unliked' : 'liked';
    }
}
