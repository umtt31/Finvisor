<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowerModel extends Model
{
    protected $table = "followers";

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'follower_id',
    ];

    public function followed()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id', 'user_id');
    }
}
