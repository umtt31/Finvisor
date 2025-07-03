<?php

namespace App\Http\Resources\user;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            "user_id" => $this->user_id,
            "username" => $this->username,
            "email" => $this->email,
            "email_verified_at" => $this->email_verified_at,
            "banned" => $this->banned,
            "firstname" => $this->firstname,
            "lastname" => $this->lastname,
            "phone_number" => $this->phone_number,
            "birth_date" => $this->birth_date,
            "bio" => $this->bio,
            "profile_image" => $this->profile_image,
            "is_private" => $this->is_private,
            "is_admin" => $this->is_admin,
            "updated_at" => $this->updated_at,

            "posts" => PostsResource::collection($this->whenLoaded('posts')),
            'followed_by' => BasicUserResource::collection($this->whenLoaded('followedBy')),
            'follows' => BasicUserResource::collection($this->whenLoaded('follows')),
            'followed_by_count' => $this->whenCounted('followedBy'),
            'follows_count' => $this->whenCounted('follows'),
        ];
    }
}
