<?php

namespace App\Http\Controllers;

use App\Http\Requests\user\ShowRequest;
use App\Http\Requests\user\ToggleFollowRequest;
use App\Http\Requests\user\UpdateRequest;
use App\Http\Resources\user\ShowResource;
use App\Models\User;
use App\Services\BunnyStorageService;
use App\Services\HandleExceptionService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

    protected $bunnyStorageService;
    protected $notificationService;

    public function __construct(BunnyStorageService $bunnyStorageService, NotificationService $notificationService)
    {
        $this->bunnyStorageService = $bunnyStorageService;
        $this->notificationService = $notificationService;
    }
    public function show(ShowRequest $showRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($id) {
            $user = User::find($id);

            $user->load(['posts.comments.likes', 'posts.likes', 'followedBy', 'follows'])->loadCount(['followedBy', 'follows']);

            return response()->json(new ShowResource($user));
        }, 'Failed to fetch user');
    }

    public function update(UpdateRequest $updateRequest, string $id)
    {
        return HandleExceptionService::handle(function () use ($updateRequest, $id) {
            $user = User::find($id);

            $data = $updateRequest->validated();

            if ($updateRequest->hasFile('profile_image')) {
                if ($user->profile_image != null) {
                    $this->bunnyStorageService->deleteUserProfileImage($user->profile_image);
                }
                $data['profile_image'] = $this->bunnyStorageService->uploadUserProfileImage($updateRequest->file('profile_image'));
            }

            $user->update($data);

            $user->refresh();

            $user->load(['posts.comments.likes', 'posts.likes', 'followedBy', 'follows'])->loadCount(['followedBy', 'follows']);

            return response()->json(new ShowResource($user));
        }, 'Failed to update user');
    }

    public function toggleFollow(ToggleFollowRequest $toggleFollowRequest)
    {
        return HandleExceptionService::handle(function () use ($toggleFollowRequest) {
            $data = $toggleFollowRequest->validated();
            $currentUser = User::find(Auth::id());

            $userToFollow = User::find($data['user_id']);

            $isFollowing = $currentUser->isFollowing($userToFollow->user_id);

            if ($isFollowing) {
                $currentUser->follows()->detach($userToFollow->user_id);
            } else {
                $currentUser->follows()->attach($userToFollow->user_id);
            }

            return response()->json([
                'action' => $isFollowing ? 'unfollow' : 'follow',
            ]);
        }, 'failed to follow');
    }
}
