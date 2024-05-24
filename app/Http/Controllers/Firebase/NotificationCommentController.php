<?php

namespace App\Http\Controllers\Firebase;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Kreait\Laravel\Firebase\Facades\Firebase;

class NotificationCommentController extends Controller
{
    protected $database;
    protected $tableName;

    public function __construct()
    {
        $this->database = Firebase::database();
        $this->tableName = "comments/IdUser";
    }
    public function sendCommentToFirebase(Request $request, $id)
    {
        // Lấy các dữ liệu cần thiết từ request
        $requestData = $request->only(['idFollower']);
        $dt = Carbon::now('Asia/Ho_Chi_Minh');
        $follower = isset($requestData["idFollower"]) ? (int)$requestData["idFollower"] : 36;
        $userId = Auth::id();
        // Tìm comment và join với bảng user_requests và users
        $comment = Comment::select(
            'comments.user_id as comment_user_id',
            'comments.request_id',
            'comments.level',
            'comments.content',
            'user_requests.id_user as request_user_id',
            'users.name as comment_user_name',
            'user_requests.request_name as request_name'
        )
            ->join('user_requests', 'comments.request_id', '=', 'user_requests.id')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->where('comments.id', $id)
            ->first();

        // Kiểm tra xem comment có tồn tại không
        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        // Dữ liệu để ghi vào Firebase
        $postData = [
            "idOwer" => $comment->comment_user_id,
            "level" => $comment->level,
            "requestName" => $comment->request_name,
            "nameComment" => $comment->comment_user_name,
            "content" => $comment->content,
            "statusRead" => 0,
            "idComment" => $id,
            "idRequest" => $comment->request_id,
            "timeStamp" => $dt->toDateTimeString(),
            "timeStampUpdate" => $dt->toDateTimeString()
        ];

        // Thực hiện ghi dữ liệu vào Firebase cho người gửi hoặc người theo dõi
        if ($comment->comment_user_id == $comment->request_user_id) {
            $postSenderRef = $this->database->getReference($this->tableName . '/' . $follower . '/' . $comment->request_id . '/' . $id);
            $postSenderRef->set($postData);
        } else if ($follower == $comment->comment_user_id) {
            $postSenderRef = $this->database->getReference($this->tableName . '/' . $comment->request_user_id . '/' . $comment->request_id . '/' . $id);
            $postSenderRef->set($postData);
        }

        return response()->json(["status" => true, "comment" => $postData], 200);
    }

    public function updateStatusRead(Request $request, $id)
    {
        $dt = Carbon::now('Asia/Ho_Chi_Minh');
        $requestData = $request->only(['idUser', 'isRequest',]);
        $postData = [
            "statusRead" => 1,
            "timeStampUpdate" => $dt->toDateTimeString()
        ];
        $postUpdate = $this->database->getReference($this->tableName . '/' . $requestData['idUser'] . '/' . $requestData['isRequest'] . '/' . $id);
        $postUpdate->update($postData);



        return response()->json(["status" => true]);
    }
}
