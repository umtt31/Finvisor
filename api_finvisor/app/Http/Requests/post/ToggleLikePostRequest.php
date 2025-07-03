<?php

namespace App\Http\Requests\post;

use Illuminate\Foundation\Http\FormRequest;

class ToggleLikePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
