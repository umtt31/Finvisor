<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaModel extends Model
{
    use HasFactory;

    protected $table = 'post_media';
    protected $fillable = [
        'post_id',
        'media_url',
        'type',
    ];

    public function post()
    {
        return $this->belongsTo(PostModel::class, 'post_id', 'post_id');
    }
}
