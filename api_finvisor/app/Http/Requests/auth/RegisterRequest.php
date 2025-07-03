<?php

namespace App\Http\Requests\auth;

use App\Http\Requests\BetterRequest;

class RegisterRequest extends BetterRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|unique:users,username',
            'email' => 'required|unique:users,email',
            'password' => 'required|confirmed|min:8',

            'firstname' => 'required|min:2|max:30',
            'lastname' => 'required|min:2|max:30',
            'phone_number' => 'nullable',
            'birth_date' => 'nullable|date|before:today'
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Username is required.',
            'username.unique' => 'This username is already taken.',

            'email.required' => 'Email is required.',
            'email.unique' => 'This email is already registered.',

            'password.required' => 'Password is required.',
            'password.confirmed' => 'Passwords do not match.',
            'password.min' => 'Password must be at least 8 characters long.',

            'firstname.required' => 'First name is required.',
            'firstname.min' => 'First name must be at least 2 characters.',
            'firstname.max' => 'First name cannot exceed 30 characters.',

            'lastname.required' => 'Last name is required.',
            'lastname.min' => 'Last name must be at least 2 characters.',
            'lastname.max' => 'Last name cannot exceed 30 characters.',

            'birth_date.date' => 'Birth date must be a valid date.',
            'birth_date.before' => 'Birth date must be before today.',
        ];
    }
}
