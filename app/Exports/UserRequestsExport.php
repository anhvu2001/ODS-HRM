<?php

namespace App\Exports;

use App\Helpers\HelperFunctions;
use App\Models\UserRequests;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UserRequestsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $categoryId;
    protected $startDate;
    protected $endDate;

    public function __construct($categoryId, $startDate, $endDate)
    {
        $this->categoryId = $categoryId;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return UserRequests::join('users', 'user_requests.id_user', '=', 'users.id')
            ->join('request_templates', 'user_requests.request_template', '=', 'request_templates.id')
            ->select('user_requests.*', 'users.name as user_name', 'request_templates.template_name', 'request_templates.flow_of_approvers')
            ->when($this->categoryId, function ($queryBuilder, $categoryId) {
                return $queryBuilder->where('request_templates.id', $categoryId);
            })
            ->when($this->startDate, function ($queryBuilder, $startDate) {
                return $queryBuilder->where('user_requests.created_at', '>=', $startDate);
            })
            ->when($this->endDate, function ($queryBuilder, $endDate) {
                return $queryBuilder->where('user_requests.created_at', '<=', $endDate);
            })
            ->orderBy('user_requests.id', 'DESC')
            ->get();
    }

    public function headings(): array
    {
        $defaultHeadings = [
            'ID',
            'Người tạo',
            'Loại đề xuất',
            'Người theo dõi',
            'Tên đề xuất',
            'Trạng thái đề xuất',
            'Ngày tạo đề xuất',
            'File đính kèm'
        ];

        // Thêm các cột tùy chỉnh cho từng category
        if ($this->categoryId == 7) {
            $defaultHeadings = array_merge($defaultHeadings, ['Tiêu đề OT', 'Mô tả OT', 'Ngày OT', 'Giờ bắt đầu', 'Giờ kết thúc', 'Thời gian OT(tiếng)']);
        } elseif ($this->categoryId == 4) {
            $defaultHeadings = array_merge($defaultHeadings, ['Loại nghỉ phép', 'Lý do nghỉ', 'Ngày nghỉ', 'Ngày kết thúc', 'Số ngày nghỉ']);
        } elseif ($this->categoryId == 5) {
            $defaultHeadings = array_merge($defaultHeadings, [
                'Chức vụ',
                'Lý do thanh toán',
                'Chi nhánh ngân hàng',
                'Số tài khoản',
                'Tiền tệ',
                'Số tiền',
                'Nội dung chuyển khoản'
            ]);
        } elseif ($this->categoryId == 8) {
            $defaultHeadings = array_merge($defaultHeadings, [
                'Nội dung',
                'Tiền tạm ứng',
                'Tiền đã thanh toán',
                'Số tiền còn thiếu',
                'Hình thức thanh toán'
            ]);
        } elseif ($this->categoryId == 6) {
            $defaultHeadings = array_merge($defaultHeadings, [
                'Lý do nghỉ',
                'Loại nghỉ phép',
                'Ngày nghỉ',
                'Giờ bắt đầu',
                'Giờ kết thúc',
                'Tổng số tiếng nghỉ'
            ]);
        }
        // Thêm các cột tùy chỉnh cho các category khác nếu cần

        return $defaultHeadings;
    }

    public function map($request): array
    {
        $content = json_decode($request->content_request, true);
        $follower_name = HelperFunctions::getFollowerName($content['follower'] ?? '');
        $download_links = HelperFunctions::getDownloadLink($content['hoa_don_chung_tu']
            ?? $content['chung_tu']
            ?? $content['giay_to_xac_minh']
            ?? $content['giay_to']
            ?? '');

            if (is_array($download_links)) {
                $file_texts = array_map(function($link) {
                    // Sử dụng dấu phẩy làm dấu phân cách cho hàm HYPERLINK
                    return "=HYPERLINK(\"" . $link . "\", \"Link File\")";
                }, $download_links);
            
                // Tạo chuỗi hoặc mảng các hyperlink
                $download_links_string = implode("\n", $file_texts);
            } else {
                $download_links_string = 'No File';
            }
            
            
                    
            
        $mappedData = [
            $request->id,
            $request->user_name,
            $request->template_name,
            $follower_name,
            $request->request_name,
            HelperFunctions::mapStatus($request->fully_accept),
            $request->created_at,
            $download_links_string // Đặt chuỗi URL đã được nối vào mảng xuất ra Excel
        ];





        // Thêm dữ liệu cho các cột tùy chỉnh cho từng category
        if ($this->categoryId == 7) {
            $start_datetime = $content['ngay_ot'] . ' ' . ($content['gio_bat_dau'] ?? '');
            $end_datetime = $content['ngay_ot'] . ' ' . ($content['gio_ket_thuc'] ?? '');
            $working_hours = HelperFunctions::calculateWorkingHours($start_datetime, $end_datetime);

            $mappedData = array_merge($mappedData, [
                $content['tieu_de'] ?? '',
                $content['chi_tiet'] ?? '',
                $content['ngay_ot'] ?? '',
                $content['gio_bat_dau'] ?? '',
                $content['gio_ket_thuc'] ?? '',
                $working_hours,
            ]);
        } elseif ($this->categoryId == 4) {
            $working_days = HelperFunctions::calculateWorkingHours($content['ngay_nghi'] ?? '', $content['ngay_ket_thuc'] ?? '', true);
            $mappedData = array_merge($mappedData, [
                $content['loai_nghi_phep'] ?? '',
                $content['ly_do_nghi'] ?? '',
                $content['ngay_nghi'] ?? '',
                $content['ngay_ket_thuc'] ?? '',
                $working_days,
            ]);
        } elseif ($this->categoryId == 5) {
            $mappedData = array_merge($mappedData, [
                $content['chuc_vu'] ?? '',
                $content['ly_do'] ?? '',
                $content['chi_nhanh'] ?? '',
                (string)$content['so_tai_khoan'] ?? '',
                $content['tien_te'] ?? '',
                $content['so_tien'] ?? '',
                $content['noi_dung_chuyen_khoan'] ?? '',

            ]);
        } elseif ($this->categoryId == 8) {
            $mappedData = array_merge($mappedData, [
                $content['noi_dung'] ?? '',
                $content['tien_tam_ung'] ?? '',
                $content['tien_da_thanh_toan'] ?? '',
                $content['so_tien_con_thieu'] ?? '',
                $content['hinh_thuc_thanh_toan'] ?? '',
            ]);
        } elseif ($this->categoryId == 6) {
            $start_datetime_8 = ($content['ngay_nghi'] ?? '') . ' ' . ($content['gio_bat_dau'] ?? '');
            $end_datetime_8 = ($content['ngay_nghi'] ?? '') . ' ' . ($content['gio_ket_thuc'] ?? '');
            $working_hours = $start_datetime_8 && $end_datetime_8 ? HelperFunctions::calculateWorkingHours($start_datetime_8, $end_datetime_8) : "No Data";

            $mappedData = array_merge($mappedData, [
                $content['ly_do_nghi'] ?? '',
                $content['loai_nghi_phep'] ?? '',
                $content['ngay_nghi'] ?? '',
                $content['gio_bat_dau'] ?? '',
                $content['gio_ket_thuc'] ?? '',
                $working_hours
            ]);
        }

        // Thêm dữ liệu cho các cột tùy chỉnh cho các category khác nếu cần

        return $mappedData;
    }



    // Triển khai phương thức styles từ giao diện WithStyles
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['argb' => '102C57'],
                    'size' => 14,  // Font size
                ],
            ],
        ];
    }
}
