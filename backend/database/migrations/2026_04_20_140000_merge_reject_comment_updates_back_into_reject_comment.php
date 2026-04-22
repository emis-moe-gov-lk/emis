<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            Schema::hasColumn('employer_appointment_reject_comments', 'update_comments') &&
            Schema::hasColumn('employer_appointment_reject_comments', 'update_comments_date')
        ) {
            DB::table('employer_appointment_reject_comments')
                ->select('id', 'reject_comment', 'update_comments', 'update_comments_date')
                ->whereNotNull('update_comments')
                ->orderBy('id')
                ->chunkById(100, function ($comments) {
                    foreach ($comments as $comment) {
                        $existing = trim((string) ($comment->reject_comment ?? ''));
                        $update = trim((string) ($comment->update_comments ?? ''));

                        if ($update === '') {
                            continue;
                        }

                        $timestamp = $comment->update_comments_date
                            ? \Carbon\Carbon::parse($comment->update_comments_date)->format('Y-m-d H:i:s')
                            : now()->format('Y-m-d H:i:s');

                        $merged = $existing === ''
                            ? $update
                            : $existing . "\n\n[Edited on {$timestamp}]\n" . $update;

                        DB::table('employer_appointment_reject_comments')
                            ->where('id', $comment->id)
                            ->update(['reject_comment' => $merged]);
                    }
                });
        }

        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            $columnsToDrop = [];

            foreach (['previous_comment', 'update_comments', 'update_comments_date'] as $column) {
                if (Schema::hasColumn('employer_appointment_reject_comments', $column)) {
                    $columnsToDrop[] = $column;
                }
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    public function down(): void
    {
        Schema::table('employer_appointment_reject_comments', function (Blueprint $table) {
            if (! Schema::hasColumn('employer_appointment_reject_comments', 'update_comments')) {
                $table->text('update_comments')->nullable()->after('reject_comment');
            }

            if (! Schema::hasColumn('employer_appointment_reject_comments', 'update_comments_date')) {
                $table->dateTime('update_comments_date')->nullable()->after('update_comments');
            }

            if (! Schema::hasColumn('employer_appointment_reject_comments', 'previous_comment')) {
                $table->text('previous_comment')->nullable()->after('reject_comment');
            }
        });
    }
};
