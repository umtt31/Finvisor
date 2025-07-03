<?php

namespace App\Http\Requests\user;

use App\Http\Requests\BetterRequest;
use Illuminate\Support\Facades\Auth;

class UpdateRequest extends BetterRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // dd($this->route('id'));
        return [
            'username' => ['string', 'unique:users,username,' . $this->route('id') . ',user_id'],
            'firstname' => 'string|max:255',
            'lastname' => 'string|max:255',
            'bio' => 'string|max:255',
            'profile_image' => 'file|image|max:2048|nullable',
        ];
    }
}
