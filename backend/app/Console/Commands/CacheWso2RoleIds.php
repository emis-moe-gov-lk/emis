<?php

namespace App\Console\Commands;

use App\Services\Wso2IsProvisioningService;
use Illuminate\Console\Command;

class CacheWso2RoleIds extends Command
{
    protected $signature = 'wso2:cache-roles';

    protected $description = 'Fetch all WSO2 IS role IDs and warm the application cache.';

    public function handle(Wso2IsProvisioningService $service): int
    {
        if (! config('services.wso2_is.enabled')) {
            $this->info('WSO2 IS is disabled — skipping role ID cache warm-up.');

            return self::SUCCESS;
        }

        try {
            $count = $service->warmRoleIdCache();
            $this->info("Cached {$count} WSO2 IS role IDs.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->warn('Could not cache WSO2 IS role IDs: ' . $e->getMessage());
            $this->warn('Role assignment will fall back to config values.');

            return self::SUCCESS;
        }
    }
}
