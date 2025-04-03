<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskCommentController extends Controller
{
    public function getAllComments($taskId)
    {
        $task = Task::find($taskId);
        $comments = $task->taskComments()->with('user')->orderBy('created_at', 'desc')->get();
        $commentsTree = $comments->toTree();
        // get file object
        return response()->json(['comments' => $commentsTree]);
    }

    // functional
    public function create(Request $request)
    {
        $parent = TaskComment::find($request->parent_id);
        $filesPaths = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $storePath = $file->store('task_comments', "public");
            $filesPaths[] = [
                'store_path' => $storePath,
                'original_name' => $file->getClientOriginalName(),
            ];
        }
        if ($parent) {
            //kiểm tra request có parent id hay không nếu có thêm comment vừa tạo vào parent 
            $newComment = TaskComment::create([
                'user_id' => $request->user_id,
                'task_id' => $request->task_id,
                'content' => $request->content,
                'file_paths' => empty($filesPaths) ? null : json_encode($filesPaths)
            ]);
            $parent->appendNode($newComment);
            $newComment->save();
        } else {
            $newComment = TaskComment::create([
                'user_id' => $request->user_id,
                'task_id' => $request->task_id,
                'content' => $request->content,
                'file_paths' => empty($filesPaths) ? null : json_encode($filesPaths),
            ]);
        }
        return response()->json(['status' => true, 'id' => $newComment->id, 'userId' => $newComment->user_id]);
    }
    // delete
    public function delete(Request $request)
    {
        $user = auth()->id();
        $comment = TaskComment::findOrFail($request->id);
        if ($comment->user_id !== $user) {
            return response()->json(["message" => "Bạn không thể xóa comment này"]);
        }
        $comment->delete();
        return response()->json(["status" => true]);
    }
    public function edit(Request $request)
    {
        $curUser = auth()->user();
        if ($curUser->id != $request->user_id) {
            return response()->json(['status' => false, 'error' => 'Unauthorized'], 403);
        }
        try {
            $editComment = TaskComment::findOrFail($request->id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => false, 'error' => 'Comment not found'], 404);
        }
        // xóa file nếu có 
        if ($request->hasFile('deleted_file')) {
            $file_paths = json_decode($editComment->file_paths, true);
            $oldPath = $file_paths[0]['store_path'];
            $deleted_file = $request->file('deleted_file');
            // delete file from public storage
            if ($deleted_file->getClientOriginalName() === $file_paths[0]['original_name']) {
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $editComment->file_paths = null;
        }
        $newFilesPaths = [];
        // thêm ảnh mới
        if ($request->hasFile('file')) {
            if ($editComment->file_paths) {
                $file_paths = json_decode($editComment->file_paths, true);
                $oldPath = $file_paths[0]['store_path'];
                // xóa file cũ
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            // đổi file mới
            $file = $request->file('file');
            $storePath = $file->store('task_comments', "public");
            $newFilesPaths[] = [
                'store_path' => $storePath,
                'original_name' => $file->getClientOriginalName(),
            ];
        }
        if ($request->content || $newFilesPaths) {
            $editComment->content = $request->content;
            if (!empty($newFilesPaths)) {
                $editComment->file_paths = json_encode($newFilesPaths);
            }
            $editComment->save();
        }

        return response()->json(['status' => true, 'message' => 'Comment updated successfully']);
    }
}
