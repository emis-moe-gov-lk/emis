<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigratePresync extends Command
{
    protected $signature = 'migrate:presync
                            {--dry-run : Show what would be faked without making any changes}';

    protected $description = 'Fake migrations whose schema already exists in the DB, so php artisan migrate only runs genuinely missing ones.';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $files = glob(database_path('migrations/*.php'));

        if (empty($files)) {
            $this->info('No migration files found.');
            return self::SUCCESS;
        }

        $ran = DB::table('migrations')->pluck('migration')->flip()->all();
        $pending = array_filter($files, fn ($f) => ! isset($ran[basename($f, '.php')]));

        if (empty($pending)) {
            $this->info('Nothing to pre-sync — all migrations are already recorded.');
            return self::SUCCESS;
        }

        $batch = (DB::table('migrations')->max('batch') ?? 0) + 1;
        $faked = [];
        $willRun = [];

        foreach ($pending as $file) {
            $name = basename($file, '.php');
            $content = file_get_contents($file);
            $decision = $this->resolve($content);

            if ($decision === true) {
                if (! $dryRun) {
                    DB::table('migrations')->insert(['migration' => $name, 'batch' => $batch]);
                }
                $faked[] = $name;
            } elseif ($decision === false) {
                $willRun[] = $name;
            }
            // null = could not determine — leave for migrate to handle
        }

        if (! empty($faked)) {
            $this->line($dryRun ? '<comment>Would fake:</comment>' : '<info>Faked:</info>');
            foreach ($faked as $m) {
                $this->line("  <fg=green>✓</> {$m}");
            }
            $this->newLine();
        }

        if (! empty($willRun)) {
            $this->line('<comment>Pending (will run with php artisan migrate):</comment>');
            foreach ($willRun as $m) {
                $this->line("  <fg=yellow>→</> {$m}");
            }
            $this->newLine();
        }

        $fakedCount = count($faked);
        $pendingCount = count($willRun);

        if ($dryRun) {
            $this->info("Dry run: {$fakedCount} would be faked, {$pendingCount} genuinely pending.");
        } else {
            $this->info("Pre-synced {$fakedCount} migration(s). {$pendingCount} migration(s) pending — run php artisan migrate.");
        }

        return self::SUCCESS;
    }

    /**
     * Decide whether a migration should be faked.
     *
     * Returns true  → schema already exists, safe to fake.
     * Returns false → schema does not exist yet, must run.
     * Returns null  → could not determine, leave for migrate to handle.
     */
    private function resolve(string $content): ?bool
    {
        // Schema::create('table') — fake if the table already exists
        if (preg_match("/Schema::create\s*\(\s*['\"](\w+)['\"]/", $content, $m)) {
            return Schema::hasTable($m[1]);
        }

        // Schema::table('table') — fake only if ALL detected columns already exist
        if (preg_match("/Schema::table\s*\(\s*['\"](\w+)['\"]/", $content, $m)) {
            $table = $m[1];

            if (! Schema::hasTable($table)) {
                return false;
            }

            // Match $table->columnType('column_name', ...) calls
            preg_match_all(
                '/\$table->\w+\s*\(\s*[\'"](\w+)[\'"]/',
                $content,
                $colMatches
            );

            $columns = array_unique($colMatches[1] ?? []);

            // Filter out non-column method args (e.g. index names, FK names)
            $nonColumnMethods = ['dropColumn', 'dropForeign', 'dropIndex', 'dropUnique', 'dropPrimary', 'foreign', 'index', 'unique', 'primary', 'rename'];
            $columns = array_filter($columns, function ($col) use ($content, $nonColumnMethods) {
                foreach ($nonColumnMethods as $method) {
                    if (str_contains($content, "\$table->{$method}('{$col}'") || str_contains($content, "\$table->{$method}(\"{$col}\"")) {
                        return false;
                    }
                }
                return true;
            });

            if (empty($columns)) {
                return null;
            }

            foreach ($columns as $col) {
                if (! Schema::hasColumn($table, $col)) {
                    return false;
                }
            }

            return true;
        }

        return null;
    }
}
