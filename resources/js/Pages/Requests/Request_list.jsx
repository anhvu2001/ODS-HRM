import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { useState } from "react";
import DangerButton from "@/Components/DangerButton";
import RequestDetail from "@/Components/RequestDetail";
import axios from "axios";
import SecondaryButton from "@/Components/SecondaryButton";
import Panigation from "@/Components/Panigation";
import Search from "@/Components/Search";
import { FormatDate } from "@/Components/FormatDate";
export default function Request_list({
    auth,
    userRequests,
    userList,
    inputDetailRequests,
}) {
    const [flowApprover, setFlowApprover] = useState([]);
    const [idRequest, setIdRequest] = useState(null);
    const [userRequestsData, setUserRequests] = useState(userRequests.data);
    const [showModalDetailRequest, setShowModalDetailRequest] = useState(false);
    const [requestDetailData, setRequestDetailData] = useState(null);
    const openModal = (request, flow_approvers, id_request) => {
        setRequestDetailData(request);
        setIdRequest(id_request);

        if (typeof flow_approvers === "string") {
            flow_approvers = JSON.parse(flow_approvers);
            setFlowApprover(flow_approvers);
        }
        setShowModalDetailRequest(true);
    };
    const closeModal = () => {
        setShowModalDetailRequest(false);
        setFlowApprover([]);
    };
    const handleDeleteRequest = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this request?"
        );
        if (confirmed) {
            axios
                .delete(route("Delete_User_Request", { id }))
                .then((response) => {
                    // Handle response if needed
                    if (response.data.status) {
                        // Remove the line below
                        const updatedUserRequests = userRequests?.data.filter(
                            (request) => request.id !== id
                        );
                        setUserRequests(updatedUserRequests);
                    }
                })
                .catch((error) => {
                    // Handle error if needed
                    console.log(error);
                });
        }
    };
    const handleDownloadPDF = async (id) => {
        try {
            // Gọi API tải xuống PDF
            const response = await axios.get(
                route("Export-Pdf-UserRequest", id),
                {
                    responseType: "blob", // Đặt kiểu dữ liệu trả về là blob
                }
            );

            // Tạo URL blob
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Tạo thẻ <a> ẩn để thực hiện việc tải xuống
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `request-${id}.pdf`); // Đặt tên file
            document.body.appendChild(link);
            link.click(); // Kích hoạt việc tải xuống
            link.remove(); // Xóa thẻ <a> sau khi tải xuống
        } catch (error) {
            console.error("Failed to download PDF:", error);
        }
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Request List
                </h2>
            }
        >
            <Head title="Request List" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Search placeholder="Nhập tên đề xuất hoặc người tạo..." />
                        <div className="p-6 text-gray-900 pt-0">
                            <table className="w-full  border">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">
                                            Loại đề xuất
                                        </th>
                                        <th className="px-4 py-2">Tiêu đề</th>
                                        <th className="px-4 py-2">Người tạo</th>
                                        <th className="px-4 py-2">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-2">Ngày tạo</th>
                                        <th className="px-4 py-2">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRequestsData.map((request, index) => (
                                        <tr key={index}>
                                            <td className="border px-4 py-2">
                                                {request.id}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <span className="font-bold">
                                                    {request.template_name}
                                                </span>
                                            </td>
                                            <td className="border px-4 py-2">
                                                <span>
                                                    {request.request_name}
                                                </span>
                                            </td>
                                            <td className="border px-4 py-2">
                                                {request.user_name}
                                            </td>

                                            <td className="border px-4 py-2">
                                                {request.fully_accept === 0 && (
                                                    <span className="text-yellow-500 font-bold">
                                                        Chờ duyệt
                                                    </span>
                                                )}
                                                {request.fully_accept === 1 && (
                                                    <span className="text-green-500 font-bold">
                                                        Đã duyệt
                                                    </span>
                                                )}
                                                {request.fully_accept === 2 && (
                                                    <span className="text-red-500 font-bold">
                                                        Từ chối
                                                    </span>
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {FormatDate(request.created_at)}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <div className="flex flex-col space-y-4">
                                                    <div className="flex overflow-hidden gap-2 bg-white border divide-x rounded-lg rtl:flex-row-reverse">
                                                        <PrimaryButton
                                                            onClick={() => {
                                                                openModal(
                                                                    request.content_request,
                                                                    request.flow_approvers,
                                                                    request.id
                                                                );
                                                            }}
                                                            as="button"
                                                            className="text-blue-500 rounded-lg"
                                                        >
                                                            Chi tiết
                                                        </PrimaryButton>
                                                        <Link
                                                            className="text-white p-4 bg-[#1E3E62] rounded-lg"
                                                            href={route(
                                                                "Edit_Detail_Screen",
                                                                {
                                                                    id: request.id,
                                                                }
                                                            )}
                                                            as="button"
                                                        >
                                                            Sửa
                                                        </Link>
                                                        <DangerButton
                                                            onClick={() =>
                                                                handleDeleteRequest(
                                                                    request.id
                                                                )
                                                            }
                                                            as="button"
                                                            className="text-500 rounded-lg"
                                                        >
                                                            Xóa
                                                        </DangerButton>
                                                        <button
                                                            onClick={() =>
                                                                handleDownloadPDF(
                                                                    request.id
                                                                )
                                                            } 
                                                            className="text-white p-4 bg-[#FF6500] rounded-lg"
                                                        >
                                                            PDF
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Panigation data={userRequests} />
                    </div>
                </div>
            </div>
            <Modal show={showModalDetailRequest} onClose={closeModal}>
                <RequestDetail
                    id={idRequest}
                    auth={auth}
                    requestDetailData={requestDetailData}
                    flowApprover={flowApprover}
                    userList={userList}
                    inputDetailRequests={inputDetailRequests}
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
