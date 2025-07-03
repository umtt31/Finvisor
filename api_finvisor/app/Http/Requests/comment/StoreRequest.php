<?php

namespace App\Http\Requests\comment;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'post_id' => ['required', 'exists:posts,post_id'],
            'content' => ['nullable', 'string', 'max:255', 'required_without:media'],
            'media' => ['nullable', 'file', 'mimes:png,jpg,jpeg,gif', 'max:25600', 'required_without:content'],
        ];
    }
}
