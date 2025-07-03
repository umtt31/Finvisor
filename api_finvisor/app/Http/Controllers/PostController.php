<?php

namespace App\Http\Controllers;

use App\Http\Requests\post\DestroyRequest;
use App\Http\Requests\post\IndexRequest;
use App\Http\Requests\post\ShowRequest;
use App\Http\Requests\post\StoreRequest;
use App\Http\Requests\post\ToggleLikePostRequest;
use App\Http\Resources\post\IndexResource;
use App\Models\PostModel;
use App\Services\BunnyStorageService;
use App\Services\HandleExceptionService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    protected $bunnyStorageService;
    protected $notificationService;

    public function __construct(BunnyStorageService $bunnyStorageService, NotificationService $notificationService)
    {
        $this->bunnyStorageService = $bunnyStorageService;
        $this->notificationService = $notificationService;
    }

    public function index(IndexRequest $indexRequest)
    {
        return HandleExceptionService::handle(function () {
            // ✅ STEP BY STEP: Sadece comment user'ını ekle, likes'ı olduğu gibi bırak
            $posts = PostModel::with([
                'user',
                'repost',
                'comments.user:user_id,username,firstname,lastname,profile_image', // ✅ Comment user'ları ekle
                'likes'  // ✅ Likes'ı basit şekilde bırak (user relationship'i olmayabilir)
            ])
            ->withCount('comments', 'likes')
            ->paginate(20);

            return response()->json(IndexResource::collection($posts));
        }, 'error occured while fetching posts');
    }

    public function store(StoreRequest $storeRequest)
    {
        return HandleExceptionService::handle(function () use ($storeRequest) {
            $data = $storeRequest->validated();
            $data['user_id'] = Auth::id();

            if ($storeRequest->hasFile('image')) {
                $url = $this->bunnyStorageService->uploadPostImage($storeRequest->file('image'));
                $data['image'] = $url;
            }

            $post = PostModel::create($data);

            // ✅ STEP BY STEP: Sadece comment user'ını ekle
            $post->load([
                'user',
                'repost',
                'comments.user:user_id,username,firstname,lastname,profile_image', // ✅ Comment user'ları ekle
                'likes'  // ✅ Likes'ı basit şekilde bırak
            ])
            ->loadCount('comments', 'likes');

            return response()->json(new IndexResource($post), 201);
        }, 'error occured while creating post');
    }

    public function show(ShowRequest $showRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($id) {
            $post = PostModel::findOrFail($id);

            // ✅ CRITICAL FIX: Sadece comment user'ını yükle (likes'ta user relationship'i yok)
            $post->load([
                'user',
                'repost',
                'comments.user:user_id,username,firstname,lastname,profile_image', // ✅ SADECE BU EKLENDİ!
                'likes'  // ✅ Likes'ı olduğu gibi bırak
            ])
            ->loadCount('comments', 'likes');

            return response()->json(new IndexResource($post));
        }, 'error occured while fetching post');
    }

    public function destroy(DestroyRequest $destroyRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($destroyRequest, $id) {
            $post = PostModel::findOrFail($id);

            if ($post->media_url) {
                $this->bunnyStorageService->deletePostImage($post->media_url);
            }

            $post->delete();

            return response()->json(['message' => 'Post deleted successfully']);
        }, 'error occured while deleting post');
    }

    public function toggleLikePost(ToggleLikePostRequest $toggleLikePostRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($toggleLikePostRequest, $id) {
            $post = PostModel::findOrFail($id);
            $action = $post->toggleLike($toggleLikePostRequest->user());

            return response()->json(['action' => $action], 200);
        }, 'error occured while toggling like post');
    }
}
