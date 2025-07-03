<?php

namespace App\Http\Resources\comment;

use App\Http\Resources\user\BasicUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'comment_id' => $this->comment_id,
            'user' => $this->whenLoaded('user', function () {
                return new BasicUserResource($this->user);
            }),
            'content' => $this->content,
            'likes' => $this->whenLoaded('likes', function () {
                $this->likes->loadMissing('user');
                return BasicUserResource::collection($this->likes->pluck('user'));
            }),
            'likes_count' => $this->whenLoaded('likes', function () {
                return $this->likes->count();
            }),
            'created_at' => $this->created_at,
        ];
    }
}
