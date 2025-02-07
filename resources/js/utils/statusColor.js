export const getStatusColor = (id) => {
    switch (id) {
        case 1: // Not Started
            return "bg-gray-200 text-gray-800";
        case 2: // In Progress
            return "bg-blue-300 text-blue-800";
        case 3: // Completed
            return "bg-green-300 text-green-800";
        case 4: // Pending
            return "bg-yellow-300 text-yellow-800";
        case 5: // Canceled
            return "bg-red-200 text-red-800";
        default:
            return "bg-white text-black"; // Default màu nền
    }
};
