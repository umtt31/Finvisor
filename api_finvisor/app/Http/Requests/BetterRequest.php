<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class BetterRequest extends FormRequest
{
    use ApiResponseTrait;

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException($this->sendError('Validation failed', $validator->errors()));
    }
}
