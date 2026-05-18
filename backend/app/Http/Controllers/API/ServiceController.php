<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * GET all services
     */
    public function index(Request $request)
    {
        $active = $request->query('active');

        $query = Service::query();

        if ($active == "1") {
            $query->active();
        }

        $services = $query->orderBy('service_name')->get();

        return response()->json([
            'status' => 'success',
            'count'  => $services->count(),
            'data'   => $services,
        ]);
    }

    /**
     * GET a single service
     */
    public function show($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Service not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $service,
        ]);
    }

    /**
     * UPDATE a service
     */
    public function update(Request $request, $id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Service not found',
            ], 404);
        }

        $validated = $request->validate([
            'service_id'    => 'nullable|string|max:10',
            'service_name'  => 'required|string|max:255',
            'description'   => 'nullable|string',
            'active_status' => 'required|boolean',
        ]);

        $service->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Service updated successfully',
            'data'    => $service,
        ]);
    }
}
