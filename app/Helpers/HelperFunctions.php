<?php

namespace App\Helpers;

use App\Models\User;
use DateTime;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class HelperFunctions
{
    /**
     * Lấy tên người quản lý trực tiếp từ bảng users dựa trên id của follower.
     */
    public static function getFollowerName($followerId)
    {
        if (empty($followerId)) {
            return '';
        }

        $user = User::find($followerId);
        return $user ? $user->name : '';
    }

    /**
     * Tính toán thời gian làm việc hoặc số ngày nghỉ dựa vào ngày và giờ bắt đầu và kết thúc.
     */
    public static function calculateWorkingHours($start_date_time, $end_date_time, $isFullDay = false)
    {
        // Tạo đối tượng DateTime từ chuỗi ngày và giờ bắt đầu và kết thúc
        $start_datetime = DateTime::createFromFormat($isFullDay ? 'Y-m-d' : 'Y-m-d H:i', $start_date_time);
        $end_datetime = DateTime::createFromFormat($isFullDay ? 'Y-m-d' : 'Y-m-d H:i', $end_date_time);

        if (!$start_datetime || !$end_datetime) {
            return 0; // Nếu không thể tạo đối tượng DateTime, trả về 0
        }

        // Tính khoảng thời gian chênh lệch
        $interval = $start_datetime->diff($end_datetime);

        if ($isFullDay) {
            // Tính số ngày chênh lệch
            $total_days = $interval->days + 1; // +1 để bao gồm cả ngày bắt đầu
            return $total_days;
        } else {
            // Tính số giờ chênh lệch bao gồm cả ngày
            $total_hours = $interval->days * 24 + $interval->h + ($interval->i / 60);
            return round($total_hours, 2); // Làm tròn đến 2 chữ số thập phân
        }
    }
    public static function getDownloadLink($files_info)
    {
        // Kiểm tra nếu $files_info là một mảng
        if (is_array($files_info)) {
            $links = [];

            // Duyệt qua từng file
            foreach ($files_info as $file_info) {
                $file_path = $file_info['file_path'] ?? '';

                if (!empty($file_path)) {
                    // Lấy URL đầy đủ và thêm vào danh sách $links
                    $links[] = url($file_path);
                } else {
                    // Nếu không có file_path, thêm thông tin gốc
                    $links[] = $file_info;
                }
            }
            return $links; // Trả về danh sách các link
        }
        // Nếu không phải là mảng, xử lý như cũ
        return $files_info;
    }

    public static function mapStatus($status)
    {
        switch ($status) {
            case 0:
                return 'Chờ duyệt';
            case 1:
                return 'Đã duyệt';
            case 2:
                return 'Từ chối';
            default:
                return 'Không rõ';
        }
    }
    public static function handleUploadsFiles($files)
    {
        $filesCount = 0;
        $requestAll = [];

        // Đếm số lượng file
        foreach ($files as $inputFiles) {
            if (is_array($inputFiles)) {
                $filesCount += count($inputFiles);
            } else {
                $filesCount++;
            }
        }

        // Nếu có file nào được upload
        if ($filesCount > 0) {
            foreach ($files as $name_input => $inputFiles) {
                if (is_array($inputFiles)) {
                    foreach ($inputFiles as $file) {
                        $fileName = $file->getClientOriginalName(); // Lấy tên gốc của file
                        $path = $file->store('public/files'); // Lưu file vào thư mục 'public/files'
                        // Lưu thông tin file vào mảng
                        $requestAll[$name_input][] = [
                            'file_name' => $fileName,
                            'file_path' => Storage::url($path),
                        ];
                    }
                } else {
                    // Trường hợp chỉ upload một file (không phải mảng file)
                    $fileName = $inputFiles->getClientOriginalName();
                    $path = $inputFiles->store('public/files');
                    $requestAll[$name_input] = [
                        'file_name' => $fileName,
                        'file_path' => Storage::url($path),
                    ];
                }
            }
        }

        return $requestAll;
    }
}
