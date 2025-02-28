export const getPriorityColor = (id) => {
    switch (id) {
        case 1: //high
            return "bg-[#f06a6a] text-black";
        case 2: //medium
            return "bg-[#ec8d71] text-black";
        case 3: //low
            return "bg-[#f1bd6c] text-black";
        default:
            return "bg-white text-black"; // Default màu nền
    }
};
