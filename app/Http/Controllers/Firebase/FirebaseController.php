<?php

namespace App\Http\Controllers\Firebase;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Kreait\Laravel\Firebase\Facades\Firebase;

class FirebaseController extends Controller
{
    protected $database;
    protected $tableName;

    public function __construct()
    {
        $this->database = Firebase::database();
        $this->tableName = "notification/user";
    }
    public function index($id_user)
    {
        $snapshot = $this->database->getReference($this->tableName . '/' . $id_user)->getSnapshot();

        $data = $snapshot->getValue();

        return response()->json(["dataRequest" =>  $data]);
    }
    public function sendToFirebase(Request $request, $id)
    {
        $dt = Carbon::now('Asia/Ho_Chi_Minh');

        // Lấy dữ liệu từ request
        $requestData = $request->only(['id_user', 'request_name', 'id_template', 'follower']);

        // Lấy thông tin người dùng và quản lý từ model User
        $user = User::find($requestData['id_user']);
        $qltt = User::find($requestData['follower']);

        // Khởi tạo biến
        $name = optional($user)->name;
        $name_qltt = optional($qltt)->name;
        $email = optional($user)->email;
        $email_qltt = optional($qltt)->email;

        // Dữ liệu để ghi vào Firebase
        $postData = [
            'name' =>  $name,
            'nameQltt' => $name_qltt,
            'email' =>  $email,
            'tieuDe' => $requestData['request_name'],
            'QLTT' => $email_qltt,
            "idTemplate" => $requestData['id_template'],
            'idUser' => $requestData['id_user'],
            'idFollower' => $requestData['follower'],
            "statusRead" => 0,
            "statusRequest" => 0,
            "timeStamp" => $dt->toDateTimeString(),
            "timeStampUpdate" => $dt->toDateTimeString()

        ];

        // Thực hiện ghi dữ liệu vào Firebase cho người gửi
        $postSenderRef = $this->database->getReference($this->tableName . '/' . $requestData['id_user'] . '/' . $id . '/send');
        $postSenderRef->set($postData);
        // Thực hiện ghi dữ liệu vào Firebase cho người nhận (quản lý trực tiếp)
        $postReceiverRef = $this->database->getReference($this->tableName . '/' . $requestData['follower'] . '/' . $id . '/receive');
        $postReceiverRef->set($postData);
        // Thực hiện ghi dữ liệu vào Firebase cho người nhận (nhân sự HR)
        if ($requestData['id_user'] != 35) {
            $postReceiverRef = $this->database->getReference($this->tableName . '/' . 35 . '/' . $id . '/receive');
            $postReceiverRef->set($postData);
        }
        return response()->json(["status" => true]);
    }
    public function updateToFirebase(Request $request, $id)
    {
        $dt = Carbon::now('Asia/Ho_Chi_Minh');

        $requestData = $request->only(['idUser', 'idFollower', 'statusRequest', 'statusRead']);
        $postData = [
            "statusRead" => $requestData['statusRead'],
            "statusRequest" => $requestData['statusRequest'],
            "timeStampUpdate" => $dt->toDateTimeString()
        ];

        // Tiếp tục xử lý dữ liệu

        $postSenderRef = $this->database->getReference($this->tableName . '/' . (int)$requestData['idUser'] . '/' . (int)$id . '/send');
        $postSenderRef->update($postData);
        // Thực hiện ghi dữ liệu vào Firebase cho người nhận (quản lý trực tiếp)
        $postReceiverRef = $this->database->getReference($this->tableName . '/' . (int)$requestData['idFollower'] . '/' . (int)$id . '/receive');
        $postReceiverRef->update($postData);
        // Thực hiện ghi dữ liệu vào Firebase cho người nhận (nhân sự HR)
        if ((int)$requestData['idUser'] != 35) {
            $postReceiverRef = $this->database->getReference($this->tableName . '/' . 35 . '/' . $id . '/receive');
            $postReceiverRef->update($postData);
        }
        return response()->json(["status" => true]);
    }
    public function updateStatusRead(Request $request, $id)
    {
        $dt = Carbon::now('Asia/Ho_Chi_Minh');
        $requestData = $request->only(['idUser', 'isUserSend',]);
        $postData = [
            "statusRead" => 1,
        ];

        if ($requestData['isUserSend']) {
            $postSenderRef = $this->database->getReference($this->tableName . '/' . (int)$requestData['idUser'] . '/' . (int)$id . '/send');
            $postSenderRef->update($postData);
        } else {
            $postReceiverRef = $this->database->getReference($this->tableName . '/' . (int)$requestData['idUser'] . '/' . (int)$id . '/receive');
            $postReceiverRef->update($postData);
        }


        return response()->json(["status" => true]);
    }
}
