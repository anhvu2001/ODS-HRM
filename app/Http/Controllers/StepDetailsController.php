<?php

namespace App\Http\Controllers;

use App\Models\StepDetail;
use Illuminate\Http\Request;

class StepDetailsController extends Controller
{
    //
    public function getStepDetail()
    {
        $steps = StepDetail::all();
        return response()->json($steps);
    }
    public function createNewStep(Request $request)
    {
        $name = $request->name;
        $newStatus = StepDetail::create([
            'name' => $name,
            'description' => $request->description
        ]);
        return response()->json(['message' => 'New step created successfully!']);
    }
    public function deleteStatus(Request $request, $id)
    {
        $status = StepDetail::find($id);
        if ($status->delete()) {
            return response()->json(['message' =>  'Xóa trạng thái thành công!']);
        } else {
            return response()->json(['message' => 'Xóa trạng thái thất bại!!']);
        }
    }
    public function update(Request $request, $id)
    {
        $step = StepDetail::find($id);
        if ($step) {
            $step->name = $request->name;
            if ($request->description) {
                $step->description = $request->description;
            }
            $step->save();
            return response()->json(['message' => 'Cập nhật thành công']);
        } else {
            return response()->json(['message' => 'Không tìm thấy']);
        }
    }
}
