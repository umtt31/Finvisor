<?php

namespace App\Traits;

trait ApiResponseTrait
{
    protected function sendSuccess($message = 'Success', $data = [], $statusCode = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    protected function sendError($message = 'Error', $errors = [], $statusCode = 422)
    {
        $request = request();

        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'first_error' => is_array($errors) ? collect($errors)->flatten()->first() : null,
            'failed_request' => [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
            ],
        ], $statusCode);
    }
}
