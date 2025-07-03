<?php

namespace App\Http\Requests\post;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string'],
            'media' => ['nullable', 'array', 'max:10'],
            'media.*' => ['file', 'mimes:png,jpg,jpeg,gif,svg,webp,svg,bmp,tiff,mp4,mov', 'max:10240'],
            'repost_id' => ['nullable', 'exists:posts,post_id']
        ];
    }
}
