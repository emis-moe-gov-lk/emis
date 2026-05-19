<?php

namespace App\Providers;

use App\Auth\JwtGuard;
use App\Contracts\IdentityProvisioningServiceInterface;
use App\Services\AsgardeoIdentityProvisioningService;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\ServiceProvider;
use App\Observers\ActivityObserver;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            IdentityProvisioningServiceInterface::class,
            AsgardeoIdentityProvisioningService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Activity::observe(ActivityObserver::class);

        Auth::extend('jwt', function ($app, $name, array $config) {
            return new JwtGuard(
                Auth::createUserProvider($config['provider']),
                $app['request']
            );
        });

        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        Scramble::configure()
            ->useConfig(config('scramble'))
            ->expose(
                ui: 'api/docs/api',
                document: 'api/docs/api.json',
            );

        Scramble::afterOpenApiGenerated(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'JWT')
            );
        });

        Scramble::routes(function (Route $route) {
            return str_starts_with($route->uri, 'api/')
                && ! str_starts_with($route->uri, 'api/docs/');
        });
    }
}
