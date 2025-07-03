<?php

namespace App\Http\Resources\post;

use App\Http\Resources\comment\CommentResource;
use App\Http\Resources\user\BasicUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IndexResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'post_id' => $this->post_id,
            'user' => $this->whenLoaded('user', function () {
                return new BasicUserResource($this->user);
            }),
            'repost' => $this->whenLoaded('repost', function () {
                return new RepostResource($this->repost);
            }),
            'comments' => $this->whenLoaded('comments', function () {
                return CommentResource::collection($this->comments);
            }),
            'comments_count' => $this->whenLoaded('comments', function () {
                return $this->comments->count();
            }),
            // ✅ ÇÖZÜM 1: Likes'ı basit şekilde döndür (sadece like eden user'ları)
            'likes' => $this->whenLoaded('likes', function () {
                // Post'un like'larını direkt user collection olarak döndür
                return BasicUserResource::collection($this->likes);
            }),
            'likes_count' => $this->whenLoaded('likes', function () {
                return $this->likes->count();
            }),
            'content' => $this->content,
            'image' => $this->image ? env('API_SOCIAL_SANALREKABET_CDN') . '/' . $this->image : null,
            'created_at' => $this->created_at,
        ];
    }
}
