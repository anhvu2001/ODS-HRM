import React from "react";
import CommentSection from "./CommentSection";

const RequestDetail = ({
    auth,
    requestDetailData,
    flowApprover,
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
    const renderStatus = (approver) => {
        let color, title, statusText, role;

        color =
            approver.status === 1
                ? "bg-green-600"
                : approver.status === 2
                ? "bg-red-600"
                : "bg-yellow-600";

        title = approver.name; // Tên người duyệt
        role = approver.role; // role người duyệt

        statusText =
            approver.status === 1
                ? "Đã duyệt"
                : approver.status === 2
                ? "Từ chối"
                : "Chờ duyệt";

        return (
            <div className="flex items-center w-full my-4 -ml-1.5">
                <div className="w-1/12 z-10 mr-2">
                    <div className={`w-3.5 h-3.5 ${color} rounded-full`}></div>
                </div>
                <div className="w-11/12">
                    <p className="text-sm">{`${title}${
                        role ? ` (${role.toUpperCase()})` : ""
                    }`}</p>
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
                                <div
                                    key={index}
                                    className="flex items-center w-full my-6 -ml-1.5"
                                >
                                    {renderStatus(approver)}
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
                        {Object.entries(jsonObject)
                            .filter(
                                ([key, value]) =>
                                    value !== null && value !== undefined
                            ) // Loại bỏ các mục có giá trị null hoặc undefined
                            .map(([key, value], index) => (
                                <tr
                                    key={key}
                                    className={`${
                                        jsonObject.id_template === "5" &&
                                        index >= 5 &&
                                        index <= 11
                                            ? "bg-orange-500"
                                            : "unset"
                                    }`}
                                >
                                    <td
                                        className="font-bold border p-2"
                                        id={key}
                                    >
                                        {key == "follower"
                                            ? "Quản lý trực tiếp:"
                                            : key == "id_user"
                                            ? "Người tạo"
                                            : key == "request_name"
                                            ? "Tiêu đề"
                                            : inputDetailRequests.find(
                                                  (input) =>
                                                      input.input_name === key
                                              )?.input_description}
                                    </td>
                                    <td className="m-3 border p-2 whitespace-pre-wrap">
                                        {value === null ? (
                                            ""
                                        ) : key === "follower" ||
                                          key === "id_user" ? (
                                            userList[value]
                                        ) : key ===
                                          "id_template" ? null : Array.isArray(
                                              value
                                          ) ? (
                                            value.map((file, index) => (
                                                <div key={index}>
                                                    {file.file_path ? (
                                                        <a
                                                            className="text-green-500 font-bold"
                                                            href={
                                                                file.file_path
                                                            }
                                                            download
                                                        >
                                                            Tải file {index + 1}
                                                        </a>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                            ))
                                        ) : typeof value === "object" &&
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
