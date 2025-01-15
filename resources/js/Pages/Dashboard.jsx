import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { useState } from "react";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import RequestDetail from "@/Components/RequestDetail";
import CommentSection from "@/Components/CommentSection";
import { nameRequest } from "@/utils/nameRequest";
import Panigation from "@/Components/Panigation";
import Search from "@/Components/Search";
import { FormatDate } from "@/Components/FormatDate";
export default function Dashboard({
    auth,
    allTemplate,
    userRequests,
    needApprove,
    inputDetailRequests,
    userList,
}) {
    const [showModalNewRequest, setShowModalNewRequest] = useState(false);
    const [idRequest, setIdRequest] = useState(null);
    const [dataUserRequests, setDataUserRequests] = useState(userRequests);
    const [showDetailRequestApprover, setShowDetailRequestApprover] =
        useState(false);
    const [idRequestDetail, setIdRequestDetail] = useState(null);
    const [requestDetailNeedApprover, setRequestDetailNeedApprover] =
        useState(null);
    const openModal = () => {
        setShowModalNewRequest(true);
    };
    const closeModal = () => {
        setShowModalNewRequest(false);
    };
    const [showModalDetailRequest, setShowModalDetailRequest] = useState(false);
    const [requestDetailData, setRequestDetailData] = useState(null);
    // {openModalDetailRequest(request.flow_approvers,request.content_request)}}
    const [flowApprover, setFlowApprover] = useState([]);
    const openModalDetailRequest = (flow_approvers, request, id_request) => {
        setIdRequest(id_request);
        setRequestDetailData(request);
        // console.log(flow_approvers);
        if (typeof flow_approvers === "string") {
            flow_approvers = JSON.parse(flow_approvers);
            setFlowApprover(flow_approvers);
        }
        setShowModalDetailRequest(true);
    };
    const closeModalDetailRequest = () => {
        setShowModalDetailRequest(false);
        setFlowApprover([]);
    };

    const openDetailRequestApprover = (request, flow_approvers, id_request) => {
        setRequestDetailNeedApprover(request);
        if (typeof flow_approvers === "string") {
            flow_approvers = JSON.parse(flow_approvers);
            setFlowApprover(flow_approvers);
        }
        setIdRequestDetail(id_request);
        setShowDetailRequestApprover(true);
    };
    const closeDetailRequestApprover = () => {
        setShowDetailRequestApprover(false);
    };
    const handleDeleteRequest = (id) => {
        let isConfirmed = confirm("Xác nhận duyệt đề xuất?");
        if (!isConfirmed) {
            return;
        }
        axios.delete(route("Delete_User_Request", id)).then((response) => {
            if (response.data.status === true) {
                window.location.reload();
            }
        });
    };
    const handleApprove = (id_request, id_follower, id_user) => () => {
        const field_value = 1;
        setShowDetailRequestApprover(false);
        // Sử dụng Promise.all() để gọi hai yêu cầu axios đồng thời
        Promise.all([
            axios.post(route("Update_Request_Field"), {
                id_request: id_request,
                status: field_value,
            }),
            axios.post(route("update-to-firebase", { id: id_request }), {
                idUser: id_user,
                idFollower: id_follower,
                statusRequest: auth.user.id === 36 ? 3 : 1,
                statusRead: 0,
            }),
        ])
            .then(([response1, response2]) => {
                console.log(response1, response2);
                window.location.reload(); // Reload trang
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const handleReject = (id_request, id_follower, id_user) => () => {
        const field_value = 2;
        setShowDetailRequestApprover(false);
        // Sử dụng Promise.all() để gọi hai yêu cầu axios đồng thời
        Promise.all([
            axios.post(route("Update_Request_Field"), {
                id_request: id_request,
                status: field_value,
            }),
            axios.post(route("update-to-firebase", { id: id_request }), {
                idUser: id_user,
                idFollower: id_follower,
                statusRequest: 2,
                statusRead: 0,
            }),
        ])
            .then(([response1, response2]) => {
                window.location.reload(); // Reload trang
            })
            .catch((error) => {
                // Xử lý lỗi nếu cần
                console.error("Error:", error);
            });
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
    // dvh 13/01/2025 duplicate request handling

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-4 grid-rows-1 gap-4">
                                <div className="row-span-2">
                                    <h3>Thông tin cá nhân</h3>
                                    <div className="">
                                        <div className="-mx-6 px-6 py-4 text-center">
                                            <a
                                                href="#"
                                                title="home"
                                                className="text-center"
                                            >
                                                <img
                                                    className="w-32"
                                                    src={
                                                        auth.user.avatar
                                                            ? "/storage/avatars/" +
                                                              auth.user.avatar
                                                            : "https://th.bing.com/th/id/R.a9fc8abba0093589686a9550d21ee743?rik=1iof%2b%2bYe5k84QQ&pid=ImgRaw&r=0"
                                                    }
                                                    alt=""
                                                    set=""
                                                />
                                            </a>
                                        </div>
                                        <div className="">
                                            <p>Họ và tên: {auth.user.name}</p>
                                            <p>Email: {auth.user.email}</p>
                                            <p>
                                                Chức vụ:
                                                {auth.user.role == 99
                                                    ? "Admin"
                                                    : "User"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3 row-span-2">
                                    <PrimaryButton
                                        className="my-3"
                                        onClick={openModal}
                                    >
                                        Thêm Đề xuất
                                    </PrimaryButton>

                                    {(auth.user.role == 1 ||
                                        auth.user.role == 99) && (
                                        <>
                                            <div>
                                                <h1 className="font-bold mb-2">
                                                    Các đề xuất cần duyệt:
                                                </h1>
                                            </div>
                                            <table className="w-full border">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2">
                                                            ID
                                                        </th>
                                                        <th className="px-4 py-2">
                                                            Request Name
                                                        </th>
                                                        <th className="px-4 py-2">
                                                            Người tạo
                                                        </th>
                                                        <th className="px-4 py-2">
                                                            Trạng thái
                                                        </th>
                                                        <th className="px-4 py-2">
                                                            Ngày tạo
                                                        </th>
                                                        <th className="px-4 py-2">
                                                            Chi tiết
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {needApprove.map(
                                                        (request, index) => (
                                                            <tr key={index}>
                                                                <td className="border px-4 py-2">
                                                                    {request.id}
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    <span className="font-bold">
                                                                        {
                                                                            request.request_name
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {
                                                                        request.user_name
                                                                    }
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {request.template_name ==
                                                                        "Đề xuất thanh toán" &&
                                                                    request.fully_accept ==
                                                                        0
                                                                        ? "Chờ duyệt chi"
                                                                        : request.status ==
                                                                          0
                                                                        ? "Chờ duyệt"
                                                                        : request.status ==
                                                                          1
                                                                        ? "QLTT đã duyệt"
                                                                        : "Từ chối"}
                                                                    {/* {request.status==0?"Chờ duyệt":request.status==1?"Đã duyệt":"Từ chối"} */}
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    {FormatDate(
                                                                        request.created_at
                                                                    )}
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    <PrimaryButton
                                                                        onClick={() => {
                                                                            openDetailRequestApprover(
                                                                                request.content_request,
                                                                                request.flow_approvers,
                                                                                request.id
                                                                            );
                                                                        }}
                                                                        method="get"
                                                                        as="button"
                                                                        className="block mt-4 text-blue-500"
                                                                    >
                                                                        Chi tiết
                                                                    </PrimaryButton>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                    <div className="my-5">
                                        <h3 className="font-bold">
                                            Các đề xuất đã tạo:
                                        </h3>
                                    </div>
                                    <Search />
                                    <table className="w-full border">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2">
                                                    ID
                                                </th>
                                                <th className="px-4 py-2">
                                                    Request Name
                                                </th>
                                                <th className="px-4 py-2">
                                                    Trạng thái
                                                </th>
                                                <th className="px-4 py-2">
                                                    Ngày tạo
                                                </th>
                                                <th className="px-4 py-2">
                                                    Chi tiết
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataUserRequests.data
                                                .slice()
                                                .map((request, index) => (
                                                    <tr key={index}>
                                                        <td className="border px-4 py-2">
                                                            {request.id}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span className="font-bold">
                                                                {
                                                                    request.request_name
                                                                }
                                                            </span>
                                                            {request.user_name}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span
                                                                className={
                                                                    request.fully_accept ===
                                                                    1
                                                                        ? "text-green-500" // Màu xanh cho "Đã duyệt"
                                                                        : request.fully_accept ===
                                                                          2
                                                                        ? "text-red-500" // Màu đỏ cho "Từ chối"
                                                                        : "text-white-500" // Màu mặc định cho "Chờ duyệt"
                                                                }
                                                            >
                                                                {request.fully_accept ===
                                                                0
                                                                    ? "Chờ duyệt"
                                                                    : request.fully_accept ===
                                                                      1
                                                                    ? "Đã duyệt"
                                                                    : "Từ chối"}
                                                            </span>
                                                        </td>

                                                        <td className="border px-4 py-2">
                                                            {FormatDate(
                                                                request.created_at
                                                            )}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <div className="flex divide-x divide-blue-600 row">
                                                                <PrimaryButton
                                                                    onClick={() => {
                                                                        openModalDetailRequest(
                                                                            request.flow_approvers,
                                                                            request.content_request,
                                                                            request.id
                                                                        );
                                                                    }}
                                                                    method="get"
                                                                    as="button"
                                                                    className="block text-blue-500 mr-3"
                                                                >
                                                                    Chi tiết
                                                                </PrimaryButton>
                                                                <Link
                                                                    href={route(
                                                                        "Edit_Detail_Screen",
                                                                        {
                                                                            id: request.id,
                                                                        }
                                                                    )}
                                                                    className="bg-[#1E3E62] inline-flex items-center px-4 py-2 mr-3 text-white border-solid border-radius rounded"
                                                                >
                                                                    Sửa
                                                                </Link>
                                                                <Link
                                                                    href={route(
                                                                        "Duplicate_Request",
                                                                        {
                                                                            id: request.id,
                                                                        }
                                                                    )}
                                                                    method="get"
                                                                    as="button"
                                                                    className="bg-[#4A90E2] leading-4 inline-flex items-center text-center mr-3 px-3 text-white border-solid rounded"
                                                                    onSuccess={() =>
                                                                        window.location.reload()
                                                                    }
                                                                >
                                                                    Sao chép
                                                                </Link>
                                                                <DangerButton
                                                                    onClick={() => {
                                                                        handleDeleteRequest(
                                                                            request.id
                                                                        );
                                                                    }}
                                                                >
                                                                    Xóa Request
                                                                </DangerButton>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    <Panigation data={dataUserRequests} />
                                </div>
                            </div>

                            <Modal
                                show={showModalNewRequest}
                                onClose={closeModal}
                            >
                                <div className="p-6">
                                    <h3 className="font-bold">
                                        Add new request
                                    </h3>
                                    <hr />
                                    {allTemplate
                                        .filter((template) => template.id !== 6) // Bỏ qua template có id là 6
                                        .map((template, index) => (
                                            <Link
                                                key={index}
                                                method="get"
                                                as="button"
                                                href={route(
                                                    "Create_User_Request_Screen"
                                                )}
                                                data={{
                                                    id_template: template.id,
                                                }}
                                                className="block mt-4 text-blue-500"
                                            >
                                                {template.template_name}
                                            </Link>
                                        ))}
                                </div>
                            </Modal>
                            <Modal
                                show={showDetailRequestApprover}
                                onClose={closeDetailRequestApprover}
                            >
                                <div className="p-6 overflow-y-auto h-[600px]">
                                    <h2 className="font-bold">
                                        Nội dung Request cần duyệt
                                    </h2>
                                    <hr />
                                    <div className="p-2 flex">
                                        <div>
                                            <h2>Thứ tự duyệt</h2>
                                            <div className="relative px-4">
                                                <div>
                                                    <div className="absolute h-full border border-dashed border-opacity-20 border-secondary"></div>
                                                    {flowApprover &&
                                                        flowApprover.map(
                                                            (
                                                                approver,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center w-full my-6 -ml-1.5"
                                                                >
                                                                    {renderStatus(
                                                                        approver
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                        {requestDetailNeedApprover &&
                                            (() => {
                                                const jsonObject = JSON.parse(
                                                    requestDetailNeedApprover
                                                );
                                                return (
                                                    <div className="w-[80%]">
                                                        <table className="w-full border">
                                                            <tbody>
                                                                {Object.entries(
                                                                    jsonObject
                                                                )
                                                                    .filter(
                                                                        ([
                                                                            key,
                                                                            value,
                                                                        ]) =>
                                                                            value !==
                                                                                null &&
                                                                            value !==
                                                                                undefined
                                                                    ) // Loại bỏ các mục có giá trị null hoặc undefined
                                                                    .map(
                                                                        ([
                                                                            key,
                                                                            value,
                                                                        ]) => (
                                                                            <tr
                                                                                key={
                                                                                    key
                                                                                }
                                                                            >
                                                                                <td className="font-bold border p-3">
                                                                                    {key ==
                                                                                    "follower"
                                                                                        ? "Quản lý trực tiếp:"
                                                                                        : key ==
                                                                                          "id_user"
                                                                                        ? "Người tạo"
                                                                                        : key ==
                                                                                          "id_template"
                                                                                        ? "Loại đề xuất"
                                                                                        : key ==
                                                                                          "request_name"
                                                                                        ? "Tiêu đề"
                                                                                        : inputDetailRequests.find(
                                                                                              (
                                                                                                  input
                                                                                              ) =>
                                                                                                  input.input_name ===
                                                                                                  key
                                                                                          )
                                                                                              ?.input_description}
                                                                                </td>
                                                                                <td className="border p-3">
                                                                                    {value ===
                                                                                    null ? (
                                                                                        ""
                                                                                    ) : key ==
                                                                                      "follower" ? (
                                                                                        userList[
                                                                                            value
                                                                                        ]
                                                                                    ) : key ==
                                                                                      "id_user" ? (
                                                                                        userList[
                                                                                            value
                                                                                        ]
                                                                                    ) : key ==
                                                                                      "id_template" ? (
                                                                                        nameRequest[
                                                                                            value
                                                                                        ]
                                                                                    ) : Array.isArray(
                                                                                          value
                                                                                      ) ? (
                                                                                        value.map(
                                                                                            (
                                                                                                file,
                                                                                                index
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        index
                                                                                                    }
                                                                                                >
                                                                                                    {file.file_path ? (
                                                                                                        <a
                                                                                                            className="text-green-500 font-bold"
                                                                                                            href={
                                                                                                                file.file_path
                                                                                                            }
                                                                                                            download
                                                                                                        >
                                                                                                            Tải
                                                                                                            file{" "}
                                                                                                            {index +
                                                                                                                1}
                                                                                                        </a>
                                                                                                    ) : (
                                                                                                        ""
                                                                                                    )}
                                                                                                </div>
                                                                                            )
                                                                                        )
                                                                                    ) : typeof value ===
                                                                                          "object" &&
                                                                                      value.file_path !==
                                                                                          null ? (
                                                                                        <a
                                                                                            className="text-green-500 font-bold"
                                                                                            href={
                                                                                                value.file_path
                                                                                            }
                                                                                            download
                                                                                        >
                                                                                            Tải
                                                                                            file
                                                                                        </a>
                                                                                    ) : (
                                                                                        value
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                            </tbody>
                                                        </table>
                                                        <div className="flex justify-center my-4">
                                                            <PrimaryButton
                                                                className="mr-4"
                                                                onClick={handleApprove(
                                                                    idRequestDetail,
                                                                    jsonObject.follower,
                                                                    jsonObject.id_user
                                                                )}
                                                            >
                                                                Approve
                                                            </PrimaryButton>
                                                            <DangerButton
                                                                onClick={handleReject(
                                                                    idRequestDetail,
                                                                    jsonObject.follower,
                                                                    jsonObject.id_user
                                                                )}
                                                            >
                                                                Reject
                                                            </DangerButton>
                                                        </div>
                                                        <CommentSection
                                                            auth={auth}
                                                            idRequest={
                                                                idRequestDetail
                                                            }
                                                            idFollower={
                                                                jsonObject?.follower
                                                            }
                                                            ownerIdRequest={
                                                                jsonObject?.id_user
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })()}
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                show={showModalDetailRequest}
                                onClose={closeModalDetailRequest}
                            >
                                <RequestDetail
                                    id={idRequest}
                                    auth={auth}
                                    requestDetailData={requestDetailData}
                                    flowApprover={flowApprover}
                                    userList={userList}
                                    inputDetailRequests={inputDetailRequests}
                                />
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
