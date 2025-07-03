<?php

namespace App\Http\Requests\post;

use App\Http\Requests\BetterRequest;

class StoreRequest extends BetterRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string', 'required_without:image'],
            'image' => ['nullable', 'file', 'mimes:png,jpg,jpeg,gif,svg,webp,svg,bmp,tiff,mp4,mov,heic', 'max:10240', 'required_without:content'],
            'repost_id' => ['nullable', 'exists:posts,post_id']
        ];
    }
}
