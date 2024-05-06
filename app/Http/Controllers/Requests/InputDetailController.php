<?php

namespace App\Http\Controllers\Requests;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InputDetailRequest;
class InputDetailController extends Controller
{
    public function create($id,Request $request)
    {
        $default_value = $request->default_value;
        if($request->input_type == 'checkbox'){
            $default_value = implode(',',$request->default_value);
        }
        $user = InputDetailRequest::create([
            'input_name' => $request->input_name,
            'input_type' => $request->input_type,
            'default_value' => $request->default_value,
            'required' => $request->required,
            'input_description' => $request->input_description,
            'id_request_templates'=> $id
        ]);

        return redirect()->route('Detail_request_template',['id'=>$id]);
    }
    public function update($id,Request $request)
    {
        // Trang chỉnh sửa request template
        // $inputDetail = InputDetailRequest::findOrFail($id);
        // $inputDetail->input_name = $request->input('input_name');
        // $inputDetail->input_type = $request->input('input_type');
        // $inputDetail->required = $request->input('required');
        // $inputDetail->input_description = $request->input('input_description');
        // $inputDetail->save();

        return redirect()->route('Detail_request_template',['id'=>$id]);
    }
    public function delete(Request $request)
    {
        // Trang chỉnh sửa request template
        $inputDetail = InputDetailRequest::findOrFail($request->input_id);
        $inputDetail->delete();

        return redirect()->route('Detail_request_template',['id'=>$request->id]);
    }
}
