import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Search({ placeholder }) {
    const [requestTemplates, setRequestTemplates] = useState([]);
    const [formData, setFormData] = useState({
        query: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        const fetchRequestTemplates = async () => {
            try {
                const response = await axios.get(route("Get-Request-Templates"));
                setRequestTemplates(response.data);
            } catch (error) {
                console.error("Error fetching request templates:", error);
            }
        };

        fetchRequestTemplates();
    }, []);

    useEffect(() => {
        // Load existing query params from URL if any
        const params = new URLSearchParams(window.location.search);
        const queryParams = {};
        for (const [key, value] of params.entries()) {
            queryParams[key] = value;
        }
        // Update formData with existing query params
        setFormData((prevFormData) => ({
            ...prevFormData,
            ...queryParams,
        }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        
        // Add new form data only if they have values
        Object.entries(formData).forEach(([key, value]) => {
            if (value) {
                urlParams.set(key, value);
            }
        });
    
        // Always set page to 1 when performing a search
        urlParams.set('page', 1);
    
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.pushState({}, "", newUrl);
        window.location.reload();
    };
    

    const handleReset = () => {
        setFormData({
            query: "",
            category: "",
            startDate: "",
            endDate: "",
        });
        // Clear URL parameters
        const newUrl = `${window.location.pathname}`;
        window.history.pushState({}, "", newUrl);
    };

    return (
        <div className="flex items-center justify-center my-5 z-10">
            <form onSubmit={handleFormSubmit} className="flex flex-col space-y-4">
                <div className="flex items-center flex-wrap gap-5">
                    <div className="w-full m-0">
                        <input
                            type="text"
                            name="query"
                            value={formData.query}
                            onChange={handleInputChange}
                            placeholder={placeholder || "Nhập tên đề xuất..."}
                            className="w-[255px] border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="ml-5 min-w-14 pr-[35px] border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        >
                            <option value="">Chọn loại đề xuất (All)</option>
                            {requestTemplates.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.template_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full m-0">
                        <label htmlFor="startDateFilter">Từ ngày:</label>
                        <input
                            type="date"
                            id="startDateFilter"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="ml-2 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <label className="ml-5" htmlFor="endDateFilter">Đến ngày:</label>
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
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="w-fit bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300"
                    >
                        Tìm kiếm
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
        </div>
    );
}
