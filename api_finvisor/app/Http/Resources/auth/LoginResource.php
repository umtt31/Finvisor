<?php

namespace App\Http\Resources\auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => [
                'user_id' => $this[0]->user_id,
                'username' => $this[0]->username,
                'email' => $this[0]->email,
                'firstname' => $this[0]->firstname,
                'lastname' => $this[0]->lastname,
                'phone_number' => $this[0]->phone_number,
                'birth_date' => $this[0]->birth_date,
                'bio' => $this[0]->bio,
                'profile_image' => $this[0]->profile_image,
                'is_private' => $this[0]->is_private,
                'is_admin' => $this[0]->is_admin,
                'banned' => $this[0]->banned,
                'created_at' => $this[0]->created_at,
            ],
            'token' => $this[1],
        ];
    }
}
