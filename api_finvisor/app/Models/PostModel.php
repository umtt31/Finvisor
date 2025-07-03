<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostModel extends Model
{
    protected $table = "posts";

    protected $primaryKey = 'post_id';

    protected $fillable = [
        'user_id',
        'repost_id',
        'content',
        'image'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(CommentModel::class, 'post_id', 'post_id');
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'likes', 'post_id', 'user_id');
    }

    public function repost()
    {
        return $this->belongsTo(PostModel::class, 'repost_id', 'post_id');
    }

    public function reposts()
    {
        return $this->hasMany(PostModel::class, 'repost_id', 'post_id');
    }

    public function isRepost()
    {
        return $this->repost_id !== null;
    }

    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->user_id)->exists();
    }

    public function isLikedByAuthUser()
    {
        return $this->isLikedBy(auth()->user());
    }

    public function toggleLike(User $user)
    {
        $like = LikeModel::where('user_id', $user->user_id)->where('post_id', $this->post_id)->first();
        if ($like) {
            $like->delete();
        } else {
            LikeModel::create([
                'user_id' => $user->user_id,
                'post_id' => $this->post_id,
            ]);
        }

        return $like ? 'unliked' : 'liked';
    }
}
