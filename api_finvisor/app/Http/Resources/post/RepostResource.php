<?php

namespace App\Http\Resources\post;

use App\Http\Resources\user\BasicUserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RepostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'post_id' => $this->post_id,
            'user' => $this->whenLoaded('user', function () {
                return new BasicUserResource($this->user);
            }),
            'content' => $this->content,
            'image' => $this->image,
            'created_at' => $this->created_at,
        ];
    }
}
