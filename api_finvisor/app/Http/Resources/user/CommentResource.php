<?php

namespace App\Http\Resources\user;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadCount(['likes']);

        return [
            "comment_id" => $this->comment_id,
            "content" => $this->content,
            "image" => $this->image,
            "created_at" => $this->created_at,

            "likes" => BasicUserResource::collection($this->whenLoaded('likes')),

            "likes_count" => $this->whenCounted('likes'),
        ];
    }
}
