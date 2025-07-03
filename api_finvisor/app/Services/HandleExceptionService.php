<?php

namespace App\Services;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class HandleExceptionService
{
    public static function handle(callable $callback, string $errorMessage): JsonResponse
    {
        try {
            return $callback();
        } catch (Exception $e) {
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
            $caller = $trace[1]['function'] ?? 'Unknown function';

            Log::error("[$caller] $errorMessage", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong, please try again.',
                'errors' => ["$errorMessage in $caller"],
                'first_error' => "$errorMessage in $caller",
                'error_message' => $e->getMessage(),
                'failed_request' => [
                    'method' => request()->method(),
                    'url' => request()->fullUrl(),
                ],
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
