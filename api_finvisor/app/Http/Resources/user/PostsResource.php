<?php

namespace App\Http\Resources\user;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadCount(['comments', 'likes']);
        
        return [
            "post_id" => $this->post_id,
            "content" => $this->content,
            "image" => $this->image,
            "created_at" => $this->created_at,

            "comments" => CommentResource::collection($this->whenLoaded('comments')),
            "likes" => BasicUserResource::collection($this->whenLoaded('likes')),

            "comments_count" => $this->whenCounted('comments'),
            "likes_count" => $this->whenCounted('likes'),
        ];
    }
}
