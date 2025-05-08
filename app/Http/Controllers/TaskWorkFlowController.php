<?php

namespace App\Http\Controllers;

use App\Models\TaskWorkFlows;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Calculation\Category;

class TaskWorkFlowController extends Controller
{
    //
    public function fetchAllWorkflow()
    {
        $user = auth()->user();
        if ($user['role'] !== '99') {
            abort(403);
        }
        $workflow = TaskWorkFlows::with(['category', 'currentStep', 'nextStep', 'currentDepartment'])
            ->orderBy("category_id")
            ->orderby("step_order")
            ->get();
        return response()->json($workflow);
    }
    public function createNewWorkFlow(Request $request)
    {
        $lastStepOrder = TaskWorkFlows::where('category_id', $request->category_id)->orderBy('step_order', 'desc')->first();
        $newWorkflow = TaskWorkFlows::create([
            'category_id' => $request->category_id,
            'step_order' => $lastStepOrder['step_order'] + 1,
            'current_step_id' => $request->current_step_id,
            'next_step_id' => $request->next_step_id,
            'department' => $request->department_id,
            'is_final_step' => 0
        ]);
        return response()->json(['message' => "New workflow created successfully"]);
    }
    public function delete(Request $request, $id)
    {
        $workflow = TaskWorkFlows::find($id);
        if ($workflow) {
            $workflow->delete();
            return response()->json(['message' => 'Xóa thành công']);
        } else {
            return response()->json(['message' => 'Workflow không tồn tại']);
        }
    }
    public function update(Request $request, $id)
    {

        $workflow = TaskWorkFlows::find($id);

        if ($workflow) {
            $workflow->update([
                'category_id' => $request->category_id,
                'current_step_id' => $request->current_step_id,
                'next_step_id' => $request->next_step_id,
                'department' => $request->department_id,
                'is_final_step' => $request->is_final_step
            ]);
            return response()->json(['message' => 'Cập nhật workflow thành công']);
        } else {
            return response()->json(['message' => 'Cập nhật workflow thất bại! Không tồn tại']);
        }
    }
}
