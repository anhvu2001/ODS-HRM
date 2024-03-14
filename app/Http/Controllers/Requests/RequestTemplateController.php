<?php
namespace App\Http\Controllers\Requests;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\RequestTemplate;
use App\Models\InputDetailRequest;
use App\Models\User;
class RequestTemplateController extends Controller
{
    public function index()
    {
        $templates = RequestTemplate::all();

        return Inertia::render('Requests/Request_templates', compact('templates'));
    }

    public function create(Request $request)
    {
        $user = RequestTemplate::create([
            'template_name' => $request->template_name
        ]);
        // Trang tạo mới request template
        return redirect()->route('Request_templates');
    }

    public function store(Request $request)
    {
        // Lưu request template mới
        $template = new RequestTemplate();
        $template->template_name = $request->input('template_name');
        $template->request_form = $request->input('request_form');
        $template->flow_of_approvers = $request->input('flow_of_approvers');
        $template->save();

        return redirect()->route('Request_templates')->with('success', 'Request Template created successfully');
    }

    public function edit($id)
    {
        // Trang chỉnh sửa request template
        $template = RequestTemplate::findOrFail($id);

        $inputDetails = InputDetailRequest::where('id_request_templates', $id)->get()->sortBy('priority')->values();
        // dd($inputDetails->toArray());
        $allLeaderAdmin = User::where('role', '1')->orWhere('role', '99')->get();

        return Inertia::render('Requests/Detail_request_template', compact('template','inputDetails','allLeaderAdmin'));
    }
    public function updateField(Request $request, $id)
    {

        $template = RequestTemplate::findOrFail($id);
        $field = $request->input('field');
        $value = $request->input('value');
        $template->$field = $value;
        $template->save();
        // return response()->json(['success' => true]);
         return redirect()->route('Detail_request_template',$id)->with('success', 'Request Template field updated successfully');
    }
    public function update(Request $request, $id)
    {
        // Cập nhật request template
        $template = RequestTemplate::findOrFail($id);
        $template->template_name = $request->input('template_name');
        $template->request_form = $request->input('request_form');
        $template->flow_of_approvers = $request->input('flow_of_approvers');
        $template->save();

        return redirect()->route('Request_templates')->with('success', 'Request Template updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        // Xóa input detail request
        $inputDetails = InputDetailRequest::where('id_request_templates', $request->id)->get();
        foreach ($inputDetails as $inputDetail) {
            $inputDetail->delete();
        }
        // Xóa request template
        $template = RequestTemplate::find($request->id);
        $template->delete();

         return redirect()->route('Request_templates')->with('success', 'Request Template deleted successfully');

    }
}
