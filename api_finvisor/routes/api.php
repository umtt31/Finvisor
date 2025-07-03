<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    //TODO:
    // Route::post('/password-email', [AuthController::class, 'sendResetLinkEmail']);
    //TODO:
    // Route::post('/password-reset', [AuthController::class, 'reset']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);

        //TODO:
        // Route::post('/email/resend', [AuthController::class, 'sendVerificationEmail']);
        //TODO:
        // Route::post('/email/verify', [AuthController::class, 'verify']);
        //TODO:
        // Route::post('/email/verification-status', [AuthController::class, 'status']);
    });
});

Route::prefix('users')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/toggle-follow', [UserController::class, 'toggleFollow']);

        Route::prefix('{id}')->group(function () {
            Route::get('/', [UserController::class, 'show']);
            Route::post('/', [UserController::class, 'update']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class, 'index']);
        Route::post('/', [PostController::class, 'store']);

        Route::prefix('{id}')->group(function () {
            Route::get('/', [PostController::class, 'show']);
            // Route::put('/', [PostController::class, 'update']);
            Route::delete('/', [PostController::class, 'destroy']);

            Route::post('/toggle-like', [PostController::class, 'toggleLikePost']);
        });
    });

    Route::prefix('comments')->group(function () {
        Route::post('/', [CommentController::class, 'store']);

        Route::prefix('{id}')->group(function () {
            // Route::put('/', [CommentController::class, 'update']);
            Route::delete('/', [CommentController::class, 'destroy']);

            Route::post('/toggle-like', [CommentController::class, 'toggleLikeComment']);
        });
    });
});

Route::prefix('stocks')->group(function () {
    Route::get('/quote', [StockController::class, 'getQuote']);
    Route::get('/daily/{symbol}', [StockController::class, 'getDailyData']);

    Route::get("/analysis/{date}", function ($date) {
        $data = [
            "2020-01-01" => [
                "date" => "2020-01-01",
                "positive-negative" => 0.78,
                'direction' => [
                    'daily' => 1,
                    'weekly' => 1,
                    'monthly' => 1,
                ],
                'news_count' => 20,
                'confidence' => 0.78,
            ],
            "2020-01-02" => [
                "date" => "2020-01-02",
                "positive-negative" => 0.78,
                'direction' => [
                    'daily' => 1,
                    'weekly' => 1,
                    'monthly' => 1,
                ],
                'news_count' => 20,
                'confidence' => 0.78,
            ]
        ];
        return response()->json($data[$date]);
    });
});
