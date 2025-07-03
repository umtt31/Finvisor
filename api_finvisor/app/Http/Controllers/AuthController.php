<?php

namespace App\Http\Controllers;

use App\Http\Requests\auth\LoginRequest;
use App\Http\Requests\auth\RegisterRequest;
use App\Http\Resources\auth\LoginResource;
use App\Http\Resources\auth\RegisterResource;
use App\Http\Resources\ErrorResource;
use App\Models\User;
use App\Services\HandleExceptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $loginRequest)
    {
        return HandleExceptionService::handle(function () use ($loginRequest) {
            $credentials = $loginRequest->validated();

            if (!Auth::attempt($credentials)) {
                return response()->json(
                    new ErrorResource([
                        'message' => 'Something went wrong, please try again.',
                        'errors' => ['Provided email address or password is incorrect!'],
                    ]),
                    422
                );
            }

            $user = User::findOrFail(Auth::id());
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(new LoginResource([$user, $token]));
        }, 'Failed to login.');
    }

    public function register(RegisterRequest $registerRequest)
    {
        return HandleExceptionService::handle(function () use ($registerRequest) {
            $data = $registerRequest->validated();

            $user = User::create([
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'firstname' => $data['firstname'] ?? null,
                'lastname' => $data['lastname'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,

                'bio' => '',
                'profile_image' => '',
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(new RegisterResource([$user, $token]));
        }, 'Failed to register.');
    }

    public function logout(Request $request)
    {
        return HandleExceptionService::handle(function () use ($request) {
            $user = $request->user();

            $user->tokens()->delete();

            return response()->json('Loged Out');
        }, 'Failed to logout.');
    }
}
