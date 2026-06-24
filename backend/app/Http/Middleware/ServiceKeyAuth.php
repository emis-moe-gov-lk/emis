<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ServiceKeyAuth
{
    public function handle(Request $request, Closure $next)
    {
        $expected = config('services.message_service.secret');

        if (! $expected) {
            return response()->json(['message' => 'Service key not configured.'], 500);
        }

        $provided = $request->header('X-Service-Key', '');

        if (! hash_equals($expected, $provided)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
