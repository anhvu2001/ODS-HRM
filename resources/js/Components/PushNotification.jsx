import React from "react";

export default function PushNotification({ data, userId }) {
    if (!data) return null;
    const getStatusText = (statusRequest) => {
        if (statusRequest === 0) {
            return "đã nhận được đề xuất";
        } else if (statusRequest === 1) {
            return "đã duyệt đề xuất";
        } else if (statusRequest === 2) {
            return "từ chối đề xuất";
        } else if (statusRequest === 3) {
            return "đã duyệt hoàn toàn đề xuất";
        } else return "trạng thái không xác định";
    };
    return (
        <div className="absolute bg-[#fff]  h-[auto] w-[350px] top-[45px] p-[20px] left-[-100px] rounded-xl shadow-xl max-h-[588px] overflow-y-auto">
            <p className="font-semibold text-lg ">Thông báo</p>
            {data.reverse().map((item, index) => {
                const { receive, send } = item?.value || {};
                const {
                    name,
                    tieuDe,
                    timeStamp,
                    idFollower,
                    idUser,
                    statusRead,
                    statusRequest,
                    nameQltt,
                } = receive || send || {};
                const handleUpdateToFirebase = async (isUserSend) => {
                    try {
                        const response = await axios.post(
                            route("update-status-read", {
                                id: item?.key,
                            }),
                            {
                                idUser: userId,
                                isUserSend,
                            }
                        );
                    } catch (error) {
                        console.error("Error:", error);
                    }
                };
                // Sử dụng hàm handleUpdateToFirebase khi cần

                if (receive && name) {
                    return (
                        <div
                            key={index}
                            onClick={() => handleUpdateToFirebase(false)}
                            className="flex justify-between items-center font-normal text-base gap-2.5 mt-5 cursor-pointer"
                        >
                            <i className="fa-regular fa-envelope text-2xl fa-solid fa-square-envelope text-red-600"></i>
                            <div className="w-[227px] flex flex-col gap-1 text-sm">
                                <div className="overflow-hidden line-clamp-3">
                                    <strong>{name}</strong>
                                    <span className="ml-1">
                                        đã tạo một đề xuất mới:
                                    </span>
                                    <strong className="ml-1">{tieuDe}</strong>
                                </div>
                                <p className="text-xs text-blue-600">
                                    {timeStamp}
                                </p>
                            </div>
                            <span
                                className={`w-2.5 h-2.5 ${
                                    statusRead === 1
                                        ? "bg-transparent"
                                        : "bg-blue-800"
                                } rounded-[50%]`}
                            ></span>
                        </div>
                    );
                } else if (name) {
                    return (
                        <div
                            key={index}
                            onClick={() => handleUpdateToFirebase(true)}
                            className="flex justify-between items-center font-normal text-base gap-2.5 mt-5 cursor-pointer"
                        >
                            <i className="fa-regular fa-envelope text-2xl fa-solid fa-square-envelope text-red-600"></i>
                            <div className="w-[227px] flex flex-col gap-1 text-sm">
                                <div className="overflow-hidden line-clamp-3">
                                <strong>{`${nameQltt}${statusRequest === 3 ? ' và CEO' : ''}`}</strong>
                                    <span
                                        className={`ml-1 ${
                                            statusRequest === 2
                                                ? "text-red-600"
                                                : statusRequest === 1 || statusRequest === 3
                                                ? "text-green-600"
                                                : "text-black"
                                        }`}
                                    >
                                        {getStatusText(statusRequest)}
                                    </span>

                                    <strong className="ml-1">{tieuDe}</strong>
                                </div>
                                <p className="text-xs text-blue-600">
                                    {timeStamp}
                                </p>
                            </div>
                            <span
                                className={`w-2.5 h-2.5 ${
                                    statusRead === 1
                                        ? "bg-transparent"
                                        : "bg-blue-800"
                                } rounded-[50%]`}
                            ></span>
                        </div>
                    );
                }
            })}
        </div>
    );
}
