export const getProgressColor = (id) => {
    switch (id) {
        case 1: // đang làm
            return "fill-yellow-600 text-yellow-600";
        case 2: // hoàn thành
            return "fill-green-500 text-green-500";
        case 3: // từ chối
            return "fill-red-500 text-red-500";
        case 4: // feedback
            return "fill-blue-500 text-blue-500";
        default:
            return "bg-gray-200 text-gray-800"; // Default màu nền
    }
};
