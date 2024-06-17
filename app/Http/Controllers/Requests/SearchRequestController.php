<?php

namespace App\Http\Controllers\Requests;

use App\Http\Controllers\Controller;
use App\Models\RequestTemplate;


class SearchRequestController extends Controller
{

    public function getRequestTemplates()
    {
        $requestTemplates = RequestTemplate::all();
        return response()->json($requestTemplates);
    }
}
