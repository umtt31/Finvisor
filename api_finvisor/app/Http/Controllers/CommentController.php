<?php

namespace App\Http\Controllers;

use App\Http\Requests\comment\DestroyRequest;
use App\Http\Requests\comment\StoreRequest;
use App\Http\Requests\comment\ToggleLikeCommentRequest;
use App\Http\Requests\comment\UpdateRequest;
use App\Http\Resources\comment\CommentResource;
use App\Http\Resources\comment\UpdateResource;
use App\Models\CommentModel;
use App\Services\BunnyStorageService;
use App\Services\HandleExceptionService;
use App\Services\NotificationService;

class CommentController extends Controller
{
    protected $bunnyStorageService;
    protected $notificationService;

    public function __construct(BunnyStorageService $bunnyStorageService, NotificationService $notificationService)
    {
        $this->bunnyStorageService = $bunnyStorageService;
        $this->notificationService = $notificationService;
    }

    public function store(StoreRequest $storeRequest)
    {
        return HandleExceptionService::handle(function () use ($storeRequest) {
            $data = $storeRequest->validated();
            $data['user_id'] = auth()->id();
            if ($storeRequest->hasFile('media')) {
                $media = $storeRequest->file('media');
                $url = $this->bunnyStorageService->uploadCommentImage($media);
                $data['media'] = $url;
            }

            $comment = CommentModel::create($data);
            $comment->load('user', 'likes.user');
            $comment->loadCount('likes');
            return response()->json(new CommentResource($comment), 201);
        }, 'error occured while creating comment');
    }

    public function update(UpdateRequest $updateRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($updateRequest, $id) {
            $comment = CommentModel::findOrFail($id);
            $data = $updateRequest->validated();

            if ($updateRequest->hasFile('media')) {
                $this->bunnyStorageService->deleteCommentImage($comment->media);
                $media = $updateRequest->file('media');
                $url = $this->bunnyStorageService->uploadCommentImage($media);
                $data['media'] = $url;
            }

            $comment->update($data);
            return response()->json(new UpdateResource($comment));
        }, 'error occured while updating comment');
    }

    public function destroy(DestroyRequest $destroyRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($destroyRequest, $id) {
            $comment = CommentModel::findOrFail($id);
            $comment->delete();
            return response()->json(null, 204);
        }, 'error occured while deleting comment');
    }

    public function toggleLikeComment(ToggleLikeCommentRequest $toggleLikeCommentRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($toggleLikeCommentRequest, $id) {
            $comment = CommentModel::findOrFail($id);
            $action = $comment->toggleLike($toggleLikeCommentRequest->user());
            return response()->json(['action' => $action], 200);
        }, 'error occured while toggling like comment');
    }
}
