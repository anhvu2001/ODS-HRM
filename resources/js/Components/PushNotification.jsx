import React, { useMemo, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import RequestDetail from "./RequestDetail";

const NotificationItem = ({ item, handleUpdateToFirebase }) => {
    const { receive, send } = item?.value || {};
    const { name, tieuDe, timeStamp, statusRead, statusRequest, nameQltt } =
        receive || send || {};

    const isReceive = Boolean(receive && name);
    const isRead = statusRead === 1;
    const statusColor =
        statusRequest === 2
            ? "text-red-600"
            : statusRequest === 1 || statusRequest === 3
            ? "text-green-600"
            : "text-black";

    return name ? (
        <div
            onClick={() => handleUpdateToFirebase(item?.key, !isReceive)}
            className="flex justify-between items-center font-normal text-base gap-2.5 mt-5 cursor-pointer"
        >
            <i className="fa-regular fa-envelope text-2xl fa-solid fa-square-envelope text-red-600"></i>
            <div className="w-[227px] flex flex-col gap-1 text-sm">
                <div className="overflow-hidden line-clamp-3">
                    <strong>
                        {isReceive
                            ? name
                            : `${nameQltt}${
                                  statusRequest === 3 ? " và CEO" : ""
                              }`}
                    </strong>
                    <span className={`ml-1 ${isReceive ? "" : statusColor}`}>
                        {isReceive
                            ? "đã tạo một đề xuất mới:"
                            : getStatusText(statusRequest)}
                    </span>
                    <strong className="ml-1">{tieuDe}</strong>
                </div>
                <p className="text-xs text-blue-600">{timeStamp}</p>
            </div>
            <span
                className={`w-2.5 h-2.5 ${
                    isRead ? "bg-transparent" : "bg-blue-800"
                } rounded-[50%]`}
            ></span>
        </div>
    ) : null;
};

const CommentItem = ({ item, userId }) => {
    const handleUpdateToFirebaseCmt = async () => {
        try {
            const response = await axios.post(
                route("Update-Notificaton-Comment", { id: item.idComment }),
                {
                    idUser: userId,
                    isRequest: item.idRequest,
                }
            );
        } catch (error) {
            console.error("Error:", error);
        }
    };
    return (
        <div
            onClick={handleUpdateToFirebaseCmt}
            className="flex justify-between items-center font-normal text-base gap-2.5 mt-5 cursor-pointer"
        >
            <i className="fa-solid fa-comment text-2xl text-blue-600"></i>
            <div className="w-[227px] flex flex-col gap-1 text-sm">
                <div className="overflow-hidden line-clamp-3">
                    <strong>{item.nameComment}</strong>
                    <span className="ml-1">đã bình luận vô đề xuất:</span>
                    <strong className="ml-1">{item.requestName}</strong>
                </div>
                <p className="text-xs text-blue-600">{item.timeStamp}</p>
            </div>
            <span
                className={`w-2.5 h-2.5 ${
                    item.statusRead === 1 ? "bg-transparent" : "bg-blue-800"
                } rounded-[50%]`}
            ></span>
        </div>
    );
};

const getStatusText = (statusRequest) => {
    switch (statusRequest) {
        case 0:
            return "đã nhận được đề xuất";
        case 1:
            return "đã duyệt đề xuất";
        case 2:
            return "từ chối đề xuất";
        case 3:
            return "đã duyệt hoàn toàn đề xuất";
        default:
            return "trạng thái không xác định";
    }
};

export default function PushNotification({ data, user, dataCmt }) {
    if (!data) return null;
    const auth = { user };
    const userId = user?.id;
    const [activeTab, setActiveTab] = useState("requests");
    const [showModalDetailRequest, setShowModalDetailRequest] = useState(false);
    const [requestDetailData, setRequestDetailData] = useState(null);
    const [idRequest, setIdRequest] = useState(null);

    const closeModal = () => {
        setShowModalDetailRequest(false);
    };

    const handleUpdateToFirebase = async (id, isUserSend) => {
        try {
            const response = await axios.post(
                route("update-status-read", { id }),
                {
                    idUser: userId,
                    isUserSend,
                }
            );
            setIdRequest(id);
            setRequestDetailData(response?.data);
            setShowModalDetailRequest(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const userRequests = useMemo(
        () => requestDetailData?.userRequests || null,
        [requestDetailData]
    );
    const inputDetailRequests = useMemo(
        () => requestDetailData?.inputDetailRequests || null,
        [requestDetailData]
    );

    const userList = useMemo(
        () => requestDetailData?.userList || null,
        [requestDetailData]
    );

    return (
        <div className="z-20 absolute bg-[#fff] h-auto w-[350px] top-[45px] p-[20px] left-[-100px] rounded-xl shadow-xl max-h-[588px] overflow-y-auto">
            <p className="font-semibold text-lg mb-3">Thông báo</p>
            <div className="flex gap-4 mb-4">
                <button
                    className={`rounded-3xl px-4 py-1 ${
                        activeTab === "requests"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setActiveTab("requests")}
                >
                    Requests
                </button>
                <button
                    className={`rounded-3xl px-4 py-2 ${
                        activeTab === "comments"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setActiveTab("comments")}
                >
                    Comments
                </button>
            </div>
            {activeTab === "requests" &&
                data
                    .reverse()
                    .map((item, index) => (
                        <NotificationItem
                            key={index}
                            item={item}
                            userId={userId}
                            handleUpdateToFirebase={handleUpdateToFirebase}
                        />
                    ))}
            {activeTab === "comments" &&
                dataCmt &&
                dataCmt
                    .slice(0)
                    .reverse()
                    .map((item, index) => (
                        <CommentItem key={index} item={item} userId={userId} />
                    ))}
            <Modal show={showModalDetailRequest} onClose={closeModal}>
                {userRequests ? (
                    <RequestDetail
                        id={idRequest}
                        auth={auth}
                        requestDetailData={userRequests.content_request}
                        userList={userList}
                        inputDetailRequests={inputDetailRequests}
                    />
                ) : (
                    <p className="py-5 text-center text-lg font-bold text-red-500">
                        Yêu cầu này đã bị xóa
                    </p>
                )}
            </Modal>
        </div>
    );
}
