import React, { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";

import { Link } from "@inertiajs/react";

export default function Users({ auth, users }) {
    const [showModal, setShowModal] = useState(false);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    const addNewUser = (e) => {
        e.preventDefault();
        post("/users/create", {
            preserveScroll: true,
            onSuccess: () => {
                reset(), closeModal();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }
                errors.forEach((error) => {
                    setData(error.field, error.message);
                });
            },
        });
    };
    const deleteUser = (e) => {
        post("/users/delete", {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };
    const passwordInput = useRef();
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "0",
    });
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Quản lý User
                </h2>
            }
        >
            <Head title="User management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <PrimaryButton onClick={openModal}>
                            {" "}
                            Thêm mới User
                        </PrimaryButton>
                        <Modal show={showModal} onClose={closeModal}>
                            <form onSubmit={addNewUser} className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Thêm mới User
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
                                        name="name"
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1 block w-3/4"
                                        placeholder="Họ và Tên"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-6">
                                    <InputLabel
                                        htmlFor="email"
                                        value="email"
                                        className="sr-only"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        required
                                        name="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="mt-1 block w-3/4"
                                        placeholder="Email"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-6">
                                    <InputLabel
                                        htmlFor="phone"
                                        value="phone"
                                        className="sr-only"
                                    />
                                    <TextInput
                                        id="phone"
                                        type="number"
                                        name="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="mt-1 block w-3/4"
                                        placeholder="Phone"
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-6">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="sr-only"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="mt-1 block w-3/4"
                                        isFocused
                                        placeholder="Password"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="mt-6">
                                    <select
                                        value={data.role}
                                        required
                                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        onChange={(e) =>
                                            setData("role", e.target.value)
                                        }
                                    >
                                        <option defaultValue>Pick role</option>
                                        <option value="0">Member</option>
                                        <option value="1">Leader</option>
                                        <option value="99">Admin</option>
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
                                        Thêm mới User
                                    </PrimaryButton>
                                </div>
                            </form>
                        </Modal>
                        <table className="w-full border min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Name
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Email
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Role
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        DIRECT MANAGERS
                                    </th>
                                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                        Tool
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                            {user.email}
                                        </td>
                                        <td>
                                            <p className="">
                                                {user.role == 1 ? (
                                                    <span className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-purple-700">
                                                        {" "}
                                                        Leader
                                                    </span>
                                                ) : user.role == null ? (
                                                    <span className="whitespace-nowrap rounded-full bg-black px-2.5 py-0.5 text-sm text-white">
                                                        {" "}
                                                        Member
                                                    </span>
                                                ) : user.role == 99 ? (
                                                    <span className="bg-gradient-to-br from-fuchsia-500 to-voilet-500 text-white text-xs font-semibold mr-2 px-2.5 py-1 rounded">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    "Unknown"
                                                )}
                                            </p>
                                        </td>

                                        <td>
                                            <p className="">
                                                {user.direct_manager ? (
                                                    <span className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-purple-700">
                                                        {" "}
                                                        {
                                                            user.direct_manager
                                                                .name
                                                        }
                                                    </span>
                                                ) : (
                                                    "Unknown"
                                                )}
                                            </p>
                                        </td>

                                        <td className="p-4 space-x-2 whitespace-nowrap lg:p-5">
                                            <Link
                                                href={"users/detail/" + user.id}
                                                as="button"
                                                className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 hover:text-gray-900 hover:scale-[1.02] transition-all"
                                            >
                                                Edit user
                                            </Link>
                                            <Link
                                                href="users/delete"
                                                as="button"
                                                method="post"
                                                data={{ id: user.id }}
                                                className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform"
                                            >
                                                Delete user
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
