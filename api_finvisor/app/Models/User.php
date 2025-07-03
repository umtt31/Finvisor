<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'username',
        'email',
        'password',
        'firstname',
        'lastname',
        'phone_number',
        'birth_date',
        'bio',
        'profile_image',
        'is_private',
        'is_admin',
        'banned'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function followedBy()
    {
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'follower_id');
    }

    public function follows()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'user_id');
    }

    public function isFollowing($id)
    {
        return $this->follows()->where('follows.user_id', $id)->exists();
    }

    public function posts()
    {
        return $this->hasMany(PostModel::class, 'user_id', 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(CommentModel::class, 'comment_id', 'comment_id');
    }

    public function stockComments()
    {
        return $this->hasMany(StockCommentModel::class, 'user_id', 'user_id');
    }

    public function stockVotes()
    {
        return $this->hasMany(StockVoteModel::class, 'user_id', 'user_id');
    }

    public function favoriteStocks()
    {
        return $this->belongsToMany(StockModel::class, 'favorite_stocks', 'user_id', 'stock_id');
    }
}
