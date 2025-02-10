<?php

namespace App\Http\Controllers\Comment;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CommentController extends Controller
{
    //
    public function getCommentsByRequestId($requestId)
    {
        // Lấy ra tất cả các comment có request_id 
        $comments = DB::table('comments')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->select('comments.*', 'users.name')
            ->where('comments.request_id', $requestId)
            ->orderBy('comments.created_at', 'desc') // Sắp xếp theo thời gian tạo mới nhất của bình luận
            ->get();

        // Xây dựng cây bình luận
        $commentTree = $this->buildCommentTree($comments);

        return response()->json($commentTree);
    }

    // Hàm xây dựng cây bình luận với đệ quy
    private function buildCommentTree($comments, $parentId = null)
    {

        $commentTree = [];

        foreach ($comments as $comment) {
            if ($comment->parent_comment_id == $parentId) {
                $comment->children = $this->buildCommentTree($comments, $comment->id);
                $commentTree[] = $comment;
            }
        }

        return $commentTree;
    }



    public function storeComment(Request $request)
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        // Xác thực dữ liệu đầu vào từ request
        $validatedData = $request->validate([
            'request_id' => 'required|integer',
            'user_id' => 'required|integer',
            'content' => 'nullable|string',
            'parent_comment_id' => 'nullable|integer',
            'level' => 'nullable|integer',
        ]);

        // Tạo một instance mới của Comment và gán các giá trị từ request
        $comment = new Comment();
        $comment->request_id = $validatedData['request_id'];
        $comment->user_id = $validatedData['user_id'];
        $comment->content = $validatedData['content'] ?: null;
        $comment->parent_comment_id = $validatedData['parent_comment_id'];
        $comment->level = $validatedData['level'];
        $comment->created_at = $now;
        $comment->updated_at = $now;
        // Kiểm tra và xử lý file upload
        if ($request->hasFile('file_input') && $request->file('file_input')->isValid()) {
            $file = $request->file('file_input');
            $path = $file->store('file-comments', 'public');
            $comment->file_path = Storage::url($path); // Lưu đường dẫn file vào cơ sở dữ liệu
        }
        // Lưu comment vào cơ sở dữ liệu
        $comment->save();
        $newlyCommentId = $comment->id;
        $newlyUserIdComment = $comment->user_id;

        return response()->json(['status' => true, 'id' => $newlyCommentId, 'userId' => $newlyUserIdComment]);
    }
    public function deleteComment($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();
        return response()->json(['status' => true]);
    }
    public function update(Request $request, $id)
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        // Xác minh dữ liệu đầu vào
        $request->validate([
            'content' => 'nullable|string',
        ]);

        // Tìm kiếm comment cần chỉnh sửa
        $comment = Comment::findOrFail($id);
        // Cập nhật nội dung của comment
        $comment->content = $request->input('content') ?: null;
        // Nếu nhận được `no_file` = "true", xóa file cũ và cập nhật `file_path` = null
        if ($request->input('no_file') === 'true') {
            if ($comment->file_path) {
                $oldFilePath = str_replace('/storage', 'public', $comment->file_path);
                Storage::delete($oldFilePath);
            }
            $comment->file_path = null;
        }
        // Nếu có file mới, xóa file cũ (nếu có) và lưu file mới
        if ($request->hasFile('file_input') && $request->file('file_input')->isValid()) {
            if ($comment->file_path) {
                $oldFilePath = str_replace('/storage', 'public', $comment->file_path);
                Storage::delete($oldFilePath);
            }
            $file = $request->file('file_input');
            $path = $file->store('file-comments', 'public');
            $comment->file_path = Storage::url($path);
        }
        $comment->updated_at = $now;
        $comment->save();

        // Trả về phản hồi cho frontend
        return response()->json(['message' => true]);
    }
}
