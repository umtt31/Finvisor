<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ErrorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => "error",
            'message' => $this['message'],
            'errors' => $this['errors'],
            'first_error' => collect($this['errors'])->first(),
            'failed_request' => [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
            ],
        ];
    }
}
