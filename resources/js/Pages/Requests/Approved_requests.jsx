import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import Search from "@/Components/Search";
import { FormatDate } from "@/Components/FormatDate";
import DangerButton from "@/Components/DangerButton";
import PrimaryButton from "@/Components/PrimaryButton";
import Pagination from "@/Components/Panigation";
import Modal from "@/Components/Modal";
import RequestDetail from "@/Components/RequestDetail";

export default function Approved_requests({
    auth,
    approvedRequests,
    userList,
    inputDetailRequests,
}) {
    const [showModalDetailRequest, setShowModalDetailRequest] = useState(false);
    const [idRequest, setIdRequest] = useState(null);
    const [requestDetailData, setRequestDetailData] = useState(null);
    const [flowApprover, setFlowApprover] = useState([]);
    const [statusApprover, setStatusApprover] = useState({
        status: 0,
        fully_accept: 0,
        hr_status: 0,
    });
    const openDetailRequestApprover = (
      request,
      flow_of_approvers,
      status,
      fully_accept,
      hr_status,
      id_request
    ) => {
        setIdRequest(id_request);
        setRequestDetailData(request);
        setStatusApprover({
          status: status,
          fully_accept: fully_accept,
          hr_status: hr_status,
      });
        // console.log(flow_of_approvers);
        if (typeof flow_of_approvers === "string") {
            flow_of_approvers = JSON.parse(flow_of_approvers);
            setFlowApprover(flow_of_approvers);
        }
        setShowModalDetailRequest(true);
    };
    const closeDetailRequestApprover = () => {
        setShowModalDetailRequest(false);
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
                                            QLTT Duyệt
                                        </th>
                                        <th className="px-4 py-2">CEO Duyệt</th>
                                        <th className="px-4 py-2">Ngày tạo</th>
                                        <th className="px-4 py-2">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedRequests.data.map(
                                        (request, index) => (
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
                                                    {request.status === 0 && (
                                                        <span className="text-yellow-500 ">
                                                            Chờ duyệt
                                                        </span>
                                                    )}
                                                    {request.status === 1 && (
                                                        <span className="text-green-500 ">
                                                            Đã duyệt
                                                        </span>
                                                    )}
                                                    {request.status === 2 && (
                                                        <span className="text-red-500 ">
                                                            Từ chối
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {request.fully_accept ===
                                                        0 && (
                                                        <span className="text-yellow-500 font-bold">
                                                            Chờ duyệt
                                                        </span>
                                                    )}
                                                    {request.fully_accept ===
                                                        1 && (
                                                        <span className="text-green-500 font-bold">
                                                            Đã duyệt
                                                        </span>
                                                    )}
                                                    {request.fully_accept ===
                                                        2 && (
                                                        <span className="text-red-500 font-bold">
                                                            Từ chối
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {FormatDate(
                                                        request.created_at
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <div className="flex flex-col space-y-4">
                                                        <div className="flex overflow-hidden bg-white border divide-x rounded-lg rtl:flex-row-reverse">
                                                            <PrimaryButton
                                                                onClick={() => {
                                                                    openDetailRequestApprover(
                                                                      request.content_request,
                                                                      request.flow_of_approvers,
                                                                      request.status,
                                                                      request.fully_accept,
                                                                      request.hr_status,
                                                                      request.id
                                                                    );
                                                                }}
                                                                as="button"
                                                                className="text-blue-500"
                                                            >
                                                                Chi tiết
                                                            </PrimaryButton>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination data={approvedRequests} />
                    </div>
                </div>
            </div>
            <Modal
                show={showModalDetailRequest}
                onClose={closeDetailRequestApprover}
            >
                <RequestDetail
                    id={idRequest}
                    auth={auth}
                    requestDetailData={requestDetailData}
                    flowApprover={flowApprover}
                    statusApprover={statusApprover}
                    userList={userList}
                    inputDetailRequests={inputDetailRequests}
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
