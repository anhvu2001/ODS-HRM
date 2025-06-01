
@switch($task['status'])
    @case(1)
        <p>Công việc "{{$task['name']}}" chưa hoàn thành.</p>
        @break
    @case(2)
        <p>Công việc "{{$task['name']}}" được chấp nhận bởi {{$leader}}.</p>
        @break
    @case(3)
        <p>Công việc "{{$task['name']}}" từ chối bởi {{$leader}} và cần phải làm lại.</p>    
        @break
    @case(4)  
        <p>Công việc "{{$task['name']}}" vừa nhận được feedback của khách.</p> 
        @break
    @default
        <p>Lỗi khi nhận trạng thái</p>    
@endswitch