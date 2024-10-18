<!DOCTYPE html>
<html lang="vi">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>{{$request_name}}</title>
      <style>
         body {
         font-family: 'DejaVu Sans', sans-serif; /* Font hỗ trợ tiếng Việt */
         line-height: 1.6;
         }
         h1,
         h2,
         h3,
         h4,
         h5 {
         margin: 10px 0;
         }
         h3,
         h4,
         h5 {
         margin-top: 20px;
         margin-bottom: 0;
         }
         p {
         margin: 5px 0;
         }
         .head-content {
         border-bottom: 2px solid #dbd3d3;
         border-top: 2px solid #dbd3d3;
         padding: 10px 0;
         }
         .info p {
         padding: 5px 0;
         font-size: 14px;
         line-height: 21px;
         color: #111;
         margin: 0;
         }
         .icon {
         margin-right: 10px;
         color: #024CAA;
         }
         .name-company {
         font-size: 16px;
         line-height: 24px;
         font-weight: 600;
         }
         .title{
         font-size: 14px;
         line-height: 21px;
         border-bottom: 1px dashed #dbd3d3;
         padding-bottom: 10px;
         margin-bottom: 0;
         margin-top: 20px;
         color: #F97300
         }
         .head-content-title{
         margin: 0
         }
         .approval-row {
         display: flex; /* Sử dụng Flexbox để sắp xếp các phần tử con */
         justify-content: space-between; /* Tạo khoảng cách giữa hai bên */
         align-items: center;
         margin-bottom: 10px; /* Khoảng cách giữa các dòng phê duyệt */
         padding: 10px; /* Padding xung quanh mỗi dòng */
         border-bottom: 1px solid #ddd; /* Đường viền dưới mỗi dòng */
         }
         .approval-left {
         text-align: left;
         width: 50%;
         }
         .approval-right {
         text-align: right; /* Canh giữa văn bản bên phải */
         width: 50%;
         }
      </style>
   </head>
   <body>
      <p class="name-company">CÔNG TY TNHH ON DIGITALS</p>
      <p>Đề xuất #{{$id}}</p>
      <p>Đã được xuất bởi: <strong>{{$exported_by}}</strong></p>
      <div class="head-content">
         <h2 class="head-content-title">{{$request_name}}</h2>
         <p>
            Trạng thái: @if($status == 0)
            <strong style="color: #FFD35A"> CHỜ DUYỆT</strong>
            @elseif($status == 1)
            <strong style="color: #88D66C"> ĐÃ DUYỆT</strong>
            @elseif($status == 2)
            <strong style="color: #FA7070"> TỪ CHỐI</strong>
            @endif
         </p>
      </div>
      <h5 class="title">THÔNG TIN ĐỀ XUẤT</h5>
      <div class="info">
         <p>
            <span class="icon">➡️</span><strong>Người tạo:</strong> {{$creator}}
         </p>
         <p>
            <span class="icon">➡️</span
               ><strong>Nhóm đề xuất:</strong> {{$template_name}}
         </p>
         <p>
            <span class="icon">➡️</span
               ><strong>Thời gian tạo:</strong> {{$created_at}}
         </p>
         <p>
            <span class="icon">➡️</span
               ><strong>Cập nhật gần nhất:</strong> {{$updated_at}}
         </p>
         <p>
            <span class="icon">➡️</span
               ><strong>Quản lý:</strong><span  style="color: #4477CE"> {{$manager}}</span>
         </p>
      </div>
      <h5 class="title">THÔNG TIN KHÁC (MẪU ĐĂNG KÝ ĐỀ XUẤT)</h5>
      <div class="info">
         @foreach ($input_details as $detail)
         @php
         $inputName = $detail->input_name;
         $inputDescription = $detail->input_description;
         @endphp
         @if (isset($content_request[$inputName]))
         <p>
            <span class="icon">➡️</span><strong>{{ $inputDescription }}:</strong>
            <!-- Kiểm tra nếu là mảng chứa nhiều file -->
            @if (is_array($content_request[$inputName]) && isset($content_request[$inputName][0]['file_path']))
            @php $fileCount = 1; @endphp <!-- Đếm số file bắt đầu từ 1 -->
            @foreach ($content_request[$inputName] as $file)
            <a href="{{ asset($file['file_path']) }}" download>
            Download file {{ $fileCount }}
            </a>
            @php $fileCount++; @endphp
            @endforeach
            <!-- Kiểm tra nếu là object (dạng file đơn lẻ) -->
            @elseif (isset($content_request[$inputName]['file_path']))
            <a href="{{ asset($content_request[$inputName]['file_path']) }}" download>
            Download file
            </a>
            <!-- Xử lý trường hợp ngày giờ -->
            @elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $content_request[$inputName])) 
            @php
            $dateTime = new DateTime($content_request[$inputName]); // Tạo đối tượng DateTime
            $formattedDate = $dateTime->format('d/m/Y h:i A'); // Định dạng lại
            @endphp
            {{ $formattedDate }} <!-- Hiển thị ngày đã định dạng -->
            <!-- Hiển thị giá trị thông thường -->
            @else
            {{ $content_request[$inputName] }}
            @endif
         </p>
         @endif
         @endforeach
      </div>
      <h5 class="title">THÀNH VIÊN XÉT DUYỆT</h5>
      <table style="width: 100%; border-collapse: collapse;">
        @if($approvals->isEmpty())
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="width: 50%; padding: 8px; font-weight: bold">
                    Ôn Khải Nghiêu <br>
                    CEO
                </td>
                <td style="width: 50%; text-align: right; padding: 8px;">
                    @if ($status == 0)
                        <strong style="color: #FFD35A">CHỜ DUYỆT</strong>
                    @elseif ($status == 1)
                        <strong style="color: #88D66C">ĐÃ DUYỆT</strong>
                    @elseif ($tatus == 2)
                        <strong style="color: #FA7070">TỪ CHỐI</strong>
                    @endif
                    <br>
                    {{$updated_at}}
                </td>
            </tr>
        @else
            @foreach ($approvals as $approval)
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="width: 50%; padding: 8px; font-weight: bold">
                        {{ $approval->approver_name }} <br>
                        {{ strtoupper($approval->role_code) }}
                    </td>
                    <td style="width: 50%; text-align: right; padding: 8px;">
                        @if ($approval->status == 0)
                            <strong style="color: #FFD35A">CHỜ DUYỆT</strong>
                        @elseif ($approval->status == 1)
                            <strong style="color: #88D66C">ĐÃ DUYỆT</strong>
                        @elseif ($approval->status == 2)
                            <strong style="color: #FA7070">TỪ CHỐI</strong>
                        @endif
                        <br>
                        {{ date('d/m/Y H:i', strtotime($approval->updated_at)) }}
                    </td>
                </tr>
            @endforeach
        @endif
    </table>
    <h5 class="title">THẢO LUẬN</h5>
    <table style="width: 100%; border-collapse: collapse;">
    @foreach ($comments as $comment)
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="width: 50%; padding: 8px;">
                <strong>{{ $comment->commenter_name }}</strong><br>
                {{ date('d/m/Y H:i', strtotime($comment->updated_at)) }}
            </td>
            <td style="width: 50%; padding: 8px;">
                {{ $comment->content }}
            </td>
        </tr>
    @endforeach
</table>

   </body>
</html>