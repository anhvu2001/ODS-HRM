<?php

namespace App\Http\Controllers;

use App\Models\TaskCategory;
use Illuminate\Http\Request;

class TaskCategoriesController extends Controller
{
    //
    public function getAllTaskCategories()
    {
        $categories = TaskCategory::select('id', 'name')->whereNull("parent_id")->get();
        return response()->json([
            'success' => true,
            'data' =>  $categories,
            'message' => 'Fetched all department successfully',
        ]);
    }
}
