<?php

namespace App\Http\Requests\comment;

use Illuminate\Foundation\Http\FormRequest;

class ToggleLikeCommentRequest extends FormRequest
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
