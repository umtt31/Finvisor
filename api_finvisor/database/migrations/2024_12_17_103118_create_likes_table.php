<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_id')->nullable();
            $table->unsignedBigInteger('comment_id')->nullable();
            $table->unsignedBigInteger('user_id');

            // Foreign keys
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('post_id')->on('posts')->onDelete('cascade');
            $table->foreign('comment_id')->references('comment_id')->on('comments')->onDelete('cascade');

            // Ensure pairs are unique: (user_id, post_id) or (user_id, comment_id)
            $table->unique(['user_id', 'post_id']);
            $table->unique(['user_id', 'comment_id']);

            $table->timestamps();
        });

        // Add a check constraint using raw SQL
        DB::statement('ALTER TABLE likes ADD CONSTRAINT check_post_or_comment
            CHECK ((post_id IS NOT NULL AND comment_id IS NULL)
                   OR (post_id IS NULL AND comment_id IS NOT NULL))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
