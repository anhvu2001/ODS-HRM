<?php

namespace App\Http\Controllers;

use App\Models\StatusDetails;
use Illuminate\Http\Request;

class StatusDetailsController extends Controller
{
    //
    public function getStatusDetail(Request $request)
    {
        $statusDetails = StatusDetails::all();
        return response()->json($statusDetails);
    }
    public function createNewStatus(Request $request)
    {
        $name = $request->name;
        $newStatus = StatusDetails::create([
            'name' => $name,
        ]);
        return response()->json(['message' => 'New status created successfully!']);
    }
    public function deleteStatus(Request $request, $id)
    {
        $status = StatusDetails::find($id);

        if ($status->delete()) {
            return response()->json(['message' =>  'Xóa trạng thái thành công!']);
        } else {
            return response()->json(['message' => 'Xóa trạng thái thất bại!!']);
        }
    }
    public function update(Request $request, $id)
    {
        $status = StatusDetails::find($id);
        if ($status) {
            $status->name = $request->name;
            $status->save();
            return response()->json(['message' => 'Cập nhật thành công']);
        } else {
            return response()->json(['message' => 'Không tìm thấy']);
        }
    }
}
