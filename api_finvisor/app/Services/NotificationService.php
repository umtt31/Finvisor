<?php

namespace App\Services;

use App\Events\Notification\SocketNotification;
use App\Jobs\SendNotification;
use App\Models\Notification\Notification;
use App\Models\User\User;

class NotificationService
{
    public function createNotification(User $user, int $senderId, string $type, array $data = null)
    {
        $notification = Notification::create([
            'user_id' => $user->user_id,
            'sender_id' => $senderId,
            'type' => $type,
            'data' => json_encode($data),
        ]);

        $notification->load(['user', 'sender']);
        event(new SocketNotification($notification));
    }
}
