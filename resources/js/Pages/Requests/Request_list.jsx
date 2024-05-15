import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import RequestDetail from '@/Components/RequestDetail';
import axios from 'axios';
import SecondaryButton from '@/Components/SecondaryButton';
export default function Request_list({ auth ,userRequests,userList,inputDetailRequests}) {
    const [flowApprover,setFlowApprover] = useState([]);
    const [idRequest,setIdRequest] = useState(null);
    const [statusApprover,setStatusApprover] = useState({
        status:0,
        fully_accept:0,
        hr_status:0
    });
    const [userRequestsData, setUserRequests] = useState(userRequests);
    const [showModalDetailRequest, setShowModalDetailRequest] = useState(false);
    const [requestDetailData, setRequestDetailData] = useState(null);
    const openModal = (request,flow_of_approvers,status,fully_accept,hr_status,id_request) => {
        setRequestDetailData(request);
        setIdRequest(id_request)
        setStatusApprover({
            status:status,
            fully_accept:fully_accept,
            hr_status:hr_status
        });
        if(typeof(flow_of_approvers)==='string'){
            flow_of_approvers = JSON.parse(flow_of_approvers);
            setFlowApprover(flow_of_approvers);
        };
        setShowModalDetailRequest(true);
    }
    const closeModal = () => {
        setShowModalDetailRequest(false);
    }
    const handleDeleteRequest = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this request?");
        if (confirmed) {
            axios.delete(route('Delete_User_Request', { id }))
                .then(response => {
                    // Handle response if needed
                    if (response.data.status) {
                        // Remove the line below
                        const updatedUserRequests = userRequests.filter(request => request.id !== id);
                        setUserRequests(updatedUserRequests);
                    }
                })
                .catch(error => {
                    // Handle error if needed
                    console.log(error);
                });
        }
    }
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Request List</h2>}
        >
            <Head title="Request List" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className='w-full  border'>
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Loại đề xuất</th>
                                        <th className="px-4 py-2">Tiêu đề</th>
                                        <th className="px-4 py-2">Người tạo</th>
                                        <th className="px-4 py-2">QLTT Duyệt</th>
                                        <th className="px-4 py-2">CEO Duyệt</th>
                                        <th className="px-4 py-2">Ngày tạo</th>
                                        <th className="px-4 py-2">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRequestsData.map((request, index) => (
                                        <tr key={index}>
                                            <td className="border px-4 py-2">{request.id}</td>
                                            <td className="border px-4 py-2"><span className='font-bold'>{request.template_name}</span></td>
                                            <td className="border px-4 py-2"><span>{request.request_name}</span></td>
                                            <td className="border px-4 py-2">{request.user_name}</td>
                                            <td className="border px-4 py-2">
                                                {request.status === 0 && <span className='text-yellow-500 '>Chờ duyệt</span>}
                                                {request.status === 1 && <span className='text-green-500 '>Đã duyệt</span>}
                                                {request.status === 2 && <span className='text-red-500 '>Từ chối</span>}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {request.fully_accept === 0 && <span className='text-yellow-500 font-bold'>Chờ duyệt</span>}
                                                    {request.fully_accept === 1 && <span className='text-green-500 font-bold'>Đã duyệt</span>}
                                                    {request.fully_accept === 2 && <span className='text-red-500 font-bold'>Từ chối</span>}
                                            </td>
                                            <td className="border px-4 py-2">{request.created_at}</td>
                                            <td className="border px-4 py-2">
                                                <div className="flex flex-col space-y-4">
                                                    <div className="flex overflow-hidden bg-white border divide-x rounded-lg rtl:flex-row-reverse">
                                                        <PrimaryButton onClick={() => { openModal(request.content_request, request.flow_of_approvers, request.status, request.fully_accept, request.hr_status,request.id) }} as="button" className="text-blue-500">Chi tiết</PrimaryButton>
                                                        <Link className="text-blue-500 p-6 bg-yellow" href={route('Edit_Detail_Screen',{id:request.id})} as="button">Sửa</Link>
                                                        <DangerButton onClick={() => handleDeleteRequest(request.id)} as="button" className="text-500">Xóa</DangerButton>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showModalDetailRequest} onClose={closeModal}>
                <RequestDetail id={idRequest} auth={auth} requestDetailData={requestDetailData} flowApprover={flowApprover} statusApprover={statusApprover} userList={userList} inputDetailRequests={inputDetailRequests}/>
            </Modal>
        </AuthenticatedLayout>
    );
}
