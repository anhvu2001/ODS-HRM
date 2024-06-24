import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { FormatDate } from "@/Components/FormatDate";

export default function Export_requests({ auth, userRequests }) {
    if (!auth.user) return (window.location.href = "/");
    const [dataRequests, setDataRequests] = useState(userRequests);
    const [requestTemplates, setRequestTemplates] = useState([]);
    const [formData, setFormData] = useState({
        category: "",
        startDate: "",
        endDate: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRequestTemplates = async () => {
            try {
                const response = await axios.get(
                    route("Get-Request-Templates")
                );
                setRequestTemplates(response.data);
            } catch (error) {
                console.error("Error fetching request templates:", error);
            }
        };

        fetchRequestTemplates();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value,
        };

        setFormData(newFormData);
        setLoading(true);

        // Gửi yêu cầu API để lấy dữ liệu mới
        try {
            const response = await axios.post(
                route("Export-Data-UserRequest", newFormData)
            );
            setDataRequests(response?.data?.listDataRequest || []);
            setLoading(false);
        } catch (error) {
            console.error("API error:", error);
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            category: "",
            startDate: "",
            endDate: "",
        });
        setDataRequests(userRequests);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Lấy ngày hiện tại và định dạng thành chuỗi
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD

        try {
            const { data } = await axios.post(
                route("Export-UserRequest-Excel"),
                formData,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            // Thêm ngày hiện tại vào tên file
            const filename = `Users_Requests_${formattedDate}.xlsx`;

            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url); // Clean up URL object
            document.body.removeChild(link); // Clean up DOM

            alert("Xuất File Thành Công");
        } catch (error) {
            console.error("Error exporting file:", error);
            alert("Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.");
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Export request data
                </h2>
            }
        >
            <Head title=" Export request data" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col space-y-4 py-5"
                        >
                            <div className="flex items-center flex-wrap gap-5">
                                <div className="m-0">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="ml-5 min-w-14 pr-[35px] border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                    >
                                        <option value="">
                                            Chọn loại đề xuất (All)
                                        </option>
                                        {requestTemplates.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.template_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="m-0">
                                    <label htmlFor="startDateFilter">
                                        Từ ngày:
                                    </label>
                                    <input
                                        type="date"
                                        id="startDateFilter"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="ml-2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                    />
                                    <label
                                        className="ml-5"
                                        htmlFor="endDateFilter"
                                    >
                                        Đến ngày:
                                    </label>
                                    <input
                                        type="date"
                                        id="endDateFilter"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="ml-2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 gap-2 ml-5">
                                <button
                                    type="submit"
                                    className="w-fit bg-green-500 text-white rounded-md px-4 py-2 flex items-center hover:bg-green-600 transition duration-300"
                                >
                                    <i className="fa-solid fa-download mr-2"></i>
                                    Export to Excel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-fit bg-gray-500 text-white rounded-md px-4 py-2 hover:bg-gray-600 transition duration-300"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                        {loading ? (
                            <p className="mt-4 text-center text-gray-500">
                                Loading...
                            </p>
                        ) : (
                            <div className="p-6 text-gray-900 pt-0">
                                <table className="w-full  border">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2">STT</th>
                                            <th className="px-4 py-2">
                                                Loại đề xuất
                                            </th>
                                            <th className="px-4 py-2">
                                                Tiêu đề
                                            </th>
                                            <th className="px-4 py-2">
                                                Người tạo
                                            </th>
                                            <th className="px-4 py-2">
                                                QLTT Duyệt
                                            </th>
                                            <th className="px-4 py-2">
                                                CEO Duyệt
                                            </th>
                                            <th className="px-4 py-2">
                                                Ngày tạo
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataRequests.map((request, index) => (
                                            <tr key={request?.id}>
                                                <td className="border px-4 py-2">
                                                    {index + 1}
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
