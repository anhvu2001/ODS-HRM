import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
export default function Department_detail({
    auth,
    department,
    manager,
    users,
}) {
    const updateDepartment = (e) => {
        e.preventDefault();
        const updatedData = { ...data };

        post(route("Update_departments", { id: department.id }), updatedData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("ok");
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };
    const confirmDelete = () => {
        const isConfirmed = window.confirm("bạn có chắc muốn xóa");
        if (!isConfirmed) return;
    };
    // const { data, setData, post, processing, reset, errors } = useForm({
    //     department_name: department.department_name || "",
    //     manager: manager.id || "",
    // });
    const { data, setData, post, processing, reset, errors } = useForm({
        department_name: department.department_name || "",
        // manager: manager.id || "",
        manager: manager?.id ?? "",
        department_id: department.id,
        memberId: "",
    });
    // const { memberData, setMemberData } = useForm({

    // });
    const addMember = (e) => {
        e.preventDefault();
        post(route("Add_department_users", { id: data.memberId }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("ok");
            },
            onError: () => {
                console.log(errors);
            },
        });
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Chi tiết phòng ban
                </h2>
            }
        >
            <Head title="department detail" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form
                                action="updateDepartment"
                                onSubmit={updateDepartment}
                                className="flex items-center space-x-6 justify-between"
                                encType="multipart/form-data"
                            >
                                <dl className="-my-3 divide-y divide-gray-100 text-sm flex gap-6">
                                    <div className="grid grid-cols-1 gap-3 py-3 even:bg-gray-50 sm:grid-cols-2 sm:gap-0">
                                        <dt className="font-medium text-gray-900 flex items-center">
                                            Tên phòng ban
                                        </dt>
                                        <dd className="text-gray-900">
                                            <TextInput
                                                id="department_name"
                                                value={data.department_name}
                                                onChange={(e) =>
                                                    setData(
                                                        "department_name",
                                                        e.target.value
                                                    )
                                                }
                                                type="text"
                                                className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
                                                placeholder="Department Name"
                                            ></TextInput>
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-2 sm:gap-4">
                                        <dt className="font-medium text-gray-900 flex items-center">
                                            Người quản lý
                                        </dt>
                                        <dd className="text-gray-900">
                                            <select
                                                value={data.manager}
                                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                onChange={(e) =>
                                                    setData(
                                                        "manager",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option defaultValue>
                                                    {manager?.name ||
                                                        "hãy chọn manager"}
                                                </option>
                                                {users.map((user) => (
                                                    <option
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </dd>
                                    </div>
                                </dl>

                                <div className="flex justify-center items-center">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-1"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="py-3 font-medium text-gray-900 flex items-center">
                                Thành viên
                            </div>
                            <div>
                                <form
                                    action="addMember"
                                    onSubmit={addMember}
                                    className="flex items-center space-x-6"
                                    encType="multipart/form-data"
                                >
                                    <div>Thêm thành viên</div>
                                    <div>
                                        <select
                                            value={data.id}
                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            onChange={(e) =>
                                                setData(
                                                    "memberId",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option>chọn thành viên</option>
                                            {users.map((user) => (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-1"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="py-6 font-medium text-gray-900 flex items-center">
                                Danh sách thành viên
                            </div>
                            <div>
                                {users
                                    .filter(
                                        (user) =>
                                            user.department === department.id
                                    )
                                    .map((user) => {
                                        return (
                                            <div
                                                key={user.id}
                                                className="py-2 gap-4 grid grid-cols-4"
                                            >
                                                <div>{user.name}</div>
                                                <div>
                                                    <Link
                                                        onClick={() =>
                                                            confirmDelete()
                                                        }
                                                        href="/users/removeDepartment"
                                                        as="button"
                                                        method="post"
                                                        data={{
                                                            id: user.id,
                                                        }}
                                                        className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md shadow-gray-300 hover:scale-[1.02] transition-transform"
                                                    >
                                                        Xóa
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
