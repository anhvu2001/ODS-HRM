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
    public function getAllCategoriesIncludeChildren()
    {

        $categories = TaskCategory::all();
        return response()->json($categories);
    }
    public function createNewCategory(Request $request)
    {
        // $parentCategory = $request->parent;
        $parentCategory['id'] = $request->parent;
        // $parentCategory
        $newCategory = TaskCategory::create([
            'name' => $request->name,
            'parent_id' => $parentCategory ? json_encode($parentCategory) : null,
        ]);
        return response()->json(['message' => 'Thêm mới phân loại thành công']);
    }
    public function delete(Request $request, $id)
    {
        $category = TaskCategory::find($id);
        if ($category) {
            $category->delete();
            return response()->json(['message' => 'Xóa phân loại thành công']);
        } else {
            return response()->json(['message' => 'Xóa phân loại thất bại']);
        }
    }
    public function update(Request $request, $id)
    {
        $category = TaskCategory::find($id);
        if ($category) {
            if ($request->name) {
                $category->name = $request->name;
            }
            if ($request->parent) {
                $parentCategory['id'] = $request->parent;
                $category->parent_id = $parentCategory;
            }
            $category->save();
            return response()->json(['message' => 'Cập nhật thành công']);
        } else {
            return response()->json(['message' => 'Cập nhật thất bại, phân loại không tồn tại']);
        }
    }
}
