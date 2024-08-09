import React from "react";
import CommentSection from "./CommentSection";

const RequestDetail = ({
    auth,
    requestDetailData,
    flowApprover,
    statusApprover,
    userList,
    inputDetailRequests,
    id,
}) => {
    if (!requestDetailData) {
        return null;
    }
    const jsonObject = JSON.parse(requestDetailData);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            await axios.post(route("Create_User_Request"), formData);
            window.location.href = route("dashboard");
        } catch (error) {
            console.error(error);
        }
    };
    const renderStatus = (approver, statusApprover) => {
        let color, title, statusText;
        switch (approver.user_id) {
            case "qltt":
                color =
                    statusApprover.status === 1
                        ? "bg-green-600"
                        : statusApprover.status === 2
                        ? "bg-red-600"
                        : "bg-yellow-600";
                title = "Quản lý trực tiếp";
                statusText =
                    statusApprover.status === 1
                        ? "Đã duyệt"
                        : statusApprover.status === 2
                        ? "Từ chối"
                        : "Chờ duyệt";
                break;
            case "hr":
                color =
                    statusApprover.hr_status === 1
                        ? "bg-green-600"
                        : statusApprover.hr_status === 2
                        ? "bg-red-600"
                        : "bg-yellow-600";
                title = "HR Manager";
                statusText =
                    statusApprover.hr_status === 1
                        ? "Đã duyệt"
                        : statusApprover.hr_status === 2
                        ? "Từ chối"
                        : "Chờ duyệt";
                break;
            case "ceo":
                color =
                    statusApprover.fully_accept === 1
                        ? "bg-green-600"
                        : statusApprover.fully_accept === 2
                        ? "bg-red-600"
                        : "bg-yellow-600";
                title = "CEO";
                statusText =
                    statusApprover.fully_accept === 1
                        ? "Đã duyệt"
                        : statusApprover.fully_accept === 2
                        ? "Từ chối"
                        : "Chờ duyệt";
                break;
            default:
                color = "bg-yellow-600";
                title = approver.user_id;
                statusText = "";
        }
        return (
            <div className="flex items-center w-full my-4 -ml-1.5">
                <div className="w-1/12 z-10 mr-2">
                    <div className={`w-3.5 h-3.5 ${color} rounded-full`}></div>
                </div>
                <div className="w-11/12">
                    <p className="text-sm">{title}</p>
                    <p className="text-xs text-gray-500">{statusText}</p>
                </div>
            </div>
        );
    };
    return (
        <div className="p-8 flex h-[90vh] overflow-y-hidden">
            <div className="w-1/6 flex-1 bg-white rounded-lg mt-4">
                <h4 className="text-xl text-gray-900 font-bold mb-4">
                    Thứ tự duyệt
                </h4>
                <div className="relative px-4">
                    <div>
                        <div className="absolute h-full border border-dashed border-opacity-20 border-secondary"></div>
                        {flowApprover &&
                            flowApprover.map((approver, index) => (
                                <div key={index}>
                                    <div className="flex items-center w-full my-6 -ml-1.5">
                                        {statusApprover &&
                                            renderStatus(
                                                approver,
                                                statusApprover
                                            )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <div
                className="w-5/6"
                style={{ maxHeight: "100vh", overflow: "auto" }}
            >
                <h4 className="text-xl text-gray-900 font-bold mb-4">
                    Nội dung request
                </h4>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Tên trường</th>
                            <th className="px-4 py-2">Giá trị</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(jsonObject).map(([key, value]) => (
                            <tr key={key}>
                                <td className="font-bold border p-2">
                                    {key == "follower"
                                        ? "Quản lý trực tiếp:"
                                        : key == "id_user"
                                        ? "Người tạo"
                                        : key == "id_template"
                                        ? null
                                        : key == "request_name"
                                        ? "Tiêu đề"
                                        : inputDetailRequests.find(
                                              (input) =>
                                                  input.input_name === key
                                          )?.input_description}
                                </td>
                                <td className="m-3 border p-2">
                                    {value === null ? (
                                        ""
                                    ) : key == "follower" ||
                                      key == "id_user" ? (
                                        userList[value]
                                    ) : key ==
                                      "id_template" ? null : typeof value ===
                                          "object" &&
                                      value.file_path !== null ? (
                                        <a
                                            className="text-green-500 font-bold"
                                            href={value.file_path}
                                            download
                                        >
                                            Tải file
                                        </a>
                                    ) : (
                                        value
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <CommentSection
                    auth={auth}
                    idRequest={id}
                    idFollower={jsonObject?.follower}
                    ownerIdRequest={jsonObject?.id_user}
                />
            </div>
        </div>
    );
};

export default RequestDetail;
