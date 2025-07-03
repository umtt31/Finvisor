<?php

namespace App\Http\Requests\user;

use App\Http\Requests\BetterRequest;

class ToggleFollowRequest extends BetterRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,user_id'
        ];
    }
}
