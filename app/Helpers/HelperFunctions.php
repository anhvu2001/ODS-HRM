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
    public static function getDownloadLink($file_info)
    {
        $file_path = $file_info['file_path'] ?? '';

        if (!empty($file_path)) {
            // Sử dụng hàm url() để lấy URL đầy đủ của file
            return url($file_path);
        }

        return $file_info;
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

        if ($filesCount > 0) {
            if ($filesCount > 1) {
                // Nén các file thành một file zip
                $zip = new ZipArchive();
                $zipFileName = 'uploads_' . time() . '.zip';
                $zipFilePath = storage_path('app/public/files/' . $zipFileName);

                if ($zip->open($zipFilePath, ZipArchive::CREATE) === TRUE) {
                    foreach ($files as $name_input => $inputFiles) {
                        if (is_array($inputFiles)) {
                            foreach ($inputFiles as $file) {
                                $fileName = $file->getClientOriginalName();
                                $filePath = $file->store('public/files');
                                $zip->addFile(storage_path('app/' . $filePath), $fileName);
                            }
                        }
                    }
                    $zip->close();

                    // Cập nhật dữ liệu với file zip
                    $requestAll[$name_input] = [
                        'file_name' => $zipFileName,
                        'file_path' => Storage::url('files/' . $zipFileName),
                    ];
                }
            } else {
                // Xử lý từng file một
                foreach ($files as $name_input => $inputFiles) {
                    if (is_array($inputFiles)) {
                        foreach ($inputFiles as $file) {
                            $fileName = $file->getClientOriginalName();
                            $path = $file->store('public/files');

                            $requestAll[$name_input] = [
                                'file_name' => $fileName,
                                'file_path' => Storage::url($path),
                            ];
                        }
                    }
                }
            }
        }

        return $requestAll;
    }
}
