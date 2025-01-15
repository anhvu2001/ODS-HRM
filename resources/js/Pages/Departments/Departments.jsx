import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import dayjs from "dayjs";
import { Link } from "@inertiajs/react";

export default function Departments({ auth, user, departments, allusers }) {
    const [showModal, setShowModal] = useState(false);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        department_name: "",
        manager: "",
    });
    const addNewDepartment = (e) => {
        e.preventDefault();
        post("/departments/create", {
            preserveScroll: true,
            onSuccess: () => {
                reset(), closeModal();
            },
        });
    };
    const confirmDelete = () => {
        const isConfirmed = window.confirm("bạn có chắc muốn xóa");
        if (!isConfirmed) return;
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Quản lý phòng ban
                </h2>
            }
        >
            <Head title="Department management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <PrimaryButton onClick={openModal}>
                            {" "}
                            Thêm mới phòng ban
                        </PrimaryButton>
                        <Modal show={showModal} onClose={closeModal}>
                            <form onSubmit={addNewDepartment} className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Thêm mới phòng ban
                                </h2>
                                <div className="mt-6">
                                    <InputLabel
                                        htmlFor="Name"
                                        value="Name"
                                        className="sr-only"
                                    />
                                    <TextInput
                                        id="Name"
                                        type="Text"
                                        name="department_name"
                                        required
                                        value={data.department_name}
                                        onChange={(e) =>
                                            setData(
                                                "department_name",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-3/4"
                                        placeholder="Tên phòng ban"
                                    />
                                </div>

                                <div className="mt-6">
                                    <select
                                        value={data.manager}
                                        required
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        onChange={(e) =>
                                            setData("manager", e.target.value)
                                        }
                                    >
                                        <option defaultValue>
                                            Pick manager
                                        </option>
                                        {allusers.map((alluser) => (
                                            <option
                                                key={alluser.id}
                                                value={alluser.id}
                                            >
                                                {alluser.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton
                                        className="ms-3"
                                        disabled={processing}
                                    >
                                        Thêm mới phòng ban
                                    </PrimaryButton>
                                </div>
                            </form>
                        </Modal>
                        <table className="w-full border min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Tên phòng
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Người quản lý
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Ngày tạo
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Ngày cập nhật
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Tool
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((department) => {
                                    // get the manager user
                                    const manager = allusers.find(
                                        (alluser) =>
                                            alluser.id === department.manager
                                    );
                                    return (
                                        <tr
                                            className="divide-y divide-gray-200"
                                            key={department.id}
                                        >
                                            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                                {department.department_name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                                {manager?.name ||
                                                    "Chưa có người quản lý"}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                                {dayjs(
                                                    department.created_at
                                                ).format("dddd, MMM D, YYYY")}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                                {dayjs(
                                                    department.updated_at
                                                ).format("dddd, MMM D, YYYY")}
                                            </td>
                                            <td className="p-4 space-x-2 whitespace-nowrap lg:p-5">
                                                <Link
                                                    href={
                                                        "departments/detail/" +
                                                        department.id
                                                    }
                                                    as="button"
                                                    className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 hover:text-gray-900 hover:scale-[1.02] transition-all"
                                                >
                                                    Sửa phòng ban
                                                </Link>
                                                <Link
                                                    onClick={confirmDelete}
                                                    href="departments/delete"
                                                    as="button"
                                                    method="post"
                                                    data={{ id: department.id }}
                                                    className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform"
                                                >
                                                    Xóa phòng ban
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
