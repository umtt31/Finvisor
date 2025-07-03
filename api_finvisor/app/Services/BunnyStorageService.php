<?php

namespace App\Services;

use Bunny\Storage\Client;
use Bunny\Storage\Region;

class BunnyStorageService
{
    protected $client;

    public function __construct()
    {
        $accessKey = config('services.bunny.access_key');
        $storageZone = config('services.bunny.storage_zone');
        $region = Region::FALKENSTEIN;

        $this->client = new Client($accessKey, $storageZone, $region);
    }

    public function uploadGroupImage($file)
    {
        $fileName = 'group_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'groups/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function deleteGroupImage($remotePath)
    {
        return $this->client->delete($remotePath);
    }

    public function uploadPostImage($file)
    {
        $fileName = 'post_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'posts/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function deletePostImage($remotePath)
    {
        return $this->client->delete($remotePath);
    }

    public function uploadUserProfileImage($file)
    {
        $fileName = 'profile_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'users/profile/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function deleteUserProfileImage($remotePath)
    {
        return $this->client->delete($remotePath);
    }

    public function uploadFeedbackImage($file)
    {
        $fileName = 'feedback_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'feedback/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function uploadAnketorImage($file)
    {
        $fileName = 'anketor_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'anketor/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function deleteAnketorImage($remotePath)
    {
        return $this->client->delete($remotePath);
    }

    public function uploadCommentImage($file)
    {
        $fileName = 'comment_' . time() . '_' . $file->getClientOriginalName();
        $remotePath = 'comments/' . $fileName;
        $this->client->upload($file->getPathname(), $remotePath);

        return $remotePath;
    }

    public function deleteCommentImage($remotePath)
    {
        return $this->client->delete($remotePath);
    }
}
