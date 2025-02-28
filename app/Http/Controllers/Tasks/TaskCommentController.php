<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TaskCommentController extends Controller
{
    //
    public function index()
    {
        $user = auth()->user();
        $comments = Task::find(2)->taskComments()->get();
        $projectId = 2;
        $commentTree = $this->buildCommentTree($comments);

        return Inertia::render('TaskComments/TaskComments', compact('user', 'comments', 'projectId'));
    }
    public function getAllComments($taskId)
    {
        $task = Task::find($taskId);
        $comments = $task->taskComments()->with('user')->orderBy('created_at', 'desc')->get();


        $commentsTree = $this->buildCommentTree($comments);

        // get file object


        return response()->json(['comments' => $commentsTree]);
    }

    // functional
    public function create(Request $request)
    {
        // $user = User::find($request->user_id);
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
            // create a new node with parent left
            $parent_right = $parent->_rgt;
            $left = $parent_right;
            $right = $left + 1;
            $newComment = TaskComment::create([
                'user_id' => $request->user_id,
                'task_id' => $request->task_id,
                'content' => $request->content,
                'parent_id' => $request->parent_id,
                'file_paths' => empty($filesPaths) ? null : json_encode($filesPaths)
            ]);
            TaskComment::where('_lft', ">", $parent_right)->increment('_lft', 2);
            TaskComment::where('_rgt', ">=", $parent_right)->increment('_rgt', 2);
            // move the node inside parent 
            $newComment->_lft = $left;
            $newComment->_rgt = $right;
            // $newComment->parent_id = $parent->id;
            $newComment->save();
        } else {
            // create as root
            $last_right = TaskComment::orderBy('_rgt', 'desc')->value('_rgt');
            $right = $last_right + 2;
            $left = $last_right + 1;
            $newComment = TaskComment::create([
                'user_id' => $request->user_id,
                'task_id' => $request->task_id,
                'content' => $request->content,
                'file_paths' => empty($filesPaths) ? null : json_encode($filesPaths),
                '_lft' => $left,
                '_rgt' => $right
            ]);
        }
        return response()->json(['status' => true, 'id' => $newComment->id, 'userId' => $newComment->user_id]);
    }
    // delete
    public function delete(Request $request)
    {
        $cur_user = auth()->user();
        $comment = TaskComment::findOrFail($request->id);
        // get left and right value before delete 
        $deletedRight = $comment->_rgt;
        $deletedLeft = $comment->_lft;
        // for adjusting left and right value 
        $width = $deletedRight - $deletedLeft + 1;
        // delete the comment uploaded file
        $file_paths = json_decode($comment->file_paths, true);
        if ($file_paths) {
            $store_path = $file_paths[0]['store_path'];
            // delete file from public storage
            if (Storage::disk('public')->exists($store_path)) {
                Storage::disk('public')->delete($store_path);
            }
        }
        // delete children node first
        TaskComment::where('_rgt', '<', $deletedRight)
            ->where('_lft', '>', $deletedLeft)
            ->delete();

        // delete the node
        if ($cur_user->id === $comment->user_id) {
            TaskComment::findOrFail($request->id)->delete();
        }
        // adjust left and right value for other node
        TaskComment::where('_lft', '>', $deletedRight)->decrement('_lft', $width);
        TaskComment::where('_rgt', '>', $deletedRight)->decrement('_rgt', $width);

        return response()->json(['status' => true]);
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
        $filesPaths = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $storePath = $file->store('task_comments', "public");
            $filesPaths[] = [
                'store_path' => $storePath,
                'original_name' => $file->getClientOriginalName(),
            ];
        }
        if ($request->content || $filesPaths) {
            $editComment->content = $request->content;
            if (empty($filesPaths)) {
                $editComment->file_paths = null;
            } else {
                $editComment->file_paths = json_encode($filesPaths);
            }
            $editComment->save();
        }

        return response()->json(['status' => true, 'message' => 'Comment updated successfully']);
    }
    // build comment tree
    private function buildCommentTree($comments, $parentId = null)
    {
        $commentTree = [];
        foreach ($comments as $comment) {
            if ($comment->parent_id == $parentId) {
                $comment->children = $this->buildCommentTree($comments, $comment->id);
                $commentTree[] = $comment;
            }
        }
        return $commentTree;
    }
    public function deleteFile(Request $request)
    {
        $comment = TaskComment::find($request->id);
        $file_paths = json_decode($comment->file_paths, true);
        $store_path = $file_paths[0]['store_path'];
        // delete file from public storage
        if (Storage::disk('public')->exists($store_path)) {
            Storage::disk('public')->delete($store_path);
            $comment->file_paths = null;
            $comment->save();
            return response()->json(['success' => true, 'message' => 'File deleted successfully']);
        }
        // update file_path is comment database, delete the file path using index
        return response()->json(['success' => false, 'message' => 'File not found']);
    }
}
