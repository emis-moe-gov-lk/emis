<?php

namespace App\Http\Controllers;

use App\Models\People;
use Illuminate\Http\Request;
use App\Helpers\NicHelper;

class NiceHashRefresh extends Controller
{
    public function updateNicHash()
    {
        $data = People::all();

        foreach ($data as $item) {

            $hash = NicHelper::hash($item->nic);

            $exists = \App\Models\People::where('nic_hash', $hash)
                ->where('id', '!=', $item->id) // ignore current record
                ->exists();

            $item->update([
                'nic_hash' => $exists ? null : $hash,
            ]);
        }


        return response()->json([
            'message' => 'Nic hash updated successfully',
        ]);
    }
}
