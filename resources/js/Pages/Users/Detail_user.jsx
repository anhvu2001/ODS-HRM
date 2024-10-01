import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
export default function Detail_user({ user, allLeaderAdmin, auth }) {
    const updateUser = (e) => {
        e.preventDefault();
        const updatedData = { ...data };
        // console.log(updatedData);
        if (updatedData.password == "") {
            delete updatedData.password;
        }
        post(route("Update_users", { id: user.id }), updatedData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("ok");
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };
    const { data, setData, errors, post, reset, processing, progress } =
        useForm({
            name: user.name || "",
            avatar: user.avatar || "",
            email: user.email || "",
            birthday: user.birthday || "",
            password: "",
            phone: user.phone || "",
            direct_manager: user.direct_manager || "",
            role: user.role || "",
            role_code: user.role_code || "",
        });
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    User Profile
                </h2>
            }
        >
            <Head title="Profile" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form
                                onSubmit={updateUser}
                                className="flex items-center space-x-6"
                                encType="multipart/form-data"
                            >
                                <div className="">
                                    <div className="flex justify-center shrink-0">
                                        <img
                                            className="h-32 w-32 object-cover rounded-full"
                                            src={
                                                data.avatar
                                                    ? "/storage/avatars/" +
                                                      data.avatar
                                                    : "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1361&q=80"
                                            }
                                            alt="Current profile photo"
                                        />
                                    </div>
                                    <label className="block">
                                        <span className="sr-only">
                                            Choose profile photo
                                        </span>

                                        <input
                                            onChange={(e) =>
                                                setData(
                                                    "avatar",
                                                    e.target.files[0]
                                                )
                                            }
                                            type="file"
                                            name="avatar"
                                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semiboldfile:bg-violet-50 file:text-violet-700
                              hover:file:bg-violet-100"
                                        />
                                    </label>
                                    {progress && (
                                        <progress
                                            value={progress.percentage}
                                            max="100"
                                        >
                                            {progress.percentage}%
                                        </progress>
                                    )}
                                </div>
                                <div className="flow-root">
                                    <dl className="-my-3 divide-y divide-gray-100 text-sm">
                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Tên
                                            </dt>
                                            <dd className="text-gray-700">
                                                <TextInput
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
                                                    placeholder="Name"
                                                />
                                                <InputError
                                                    message={errors.name}
                                                    className="mt-2"
                                                />
                                            </dd>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Email
                                            </dt>
                                            <dd className="text-gray-700">
                                                <TextInput
                                                    id="email"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="email"
                                                    disabled="true"
                                                    className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
                                                    placeholder="Email"
                                                />
                                                <InputError
                                                    message={errors.email}
                                                    className="mt-2"
                                                />
                                            </dd>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Phone
                                            </dt>
                                            <dd className="text-gray-700">
                                                <TextInput
                                                    id="phone"
                                                    value={
                                                        data.phone
                                                            ? data.phone
                                                            : "123"
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="tel"
                                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm bg-white focus:outline-none focus:shadow-outline border   py-2 px-4 block w-full appearance-none leading-normal"
                                                    placeholder="Phone"
                                                />
                                                <InputError
                                                    message={errors.phone}
                                                    className="mt-2"
                                                />
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Birthday
                                            </dt>
                                            <dd className="text-gray-700 sm:col-span-2">
                                                <TextInput
                                                    id="birthday"
                                                    value={data.birthday}
                                                    onChange={(e) =>
                                                        setData(
                                                            "birthday",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="date"
                                                    className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
                                                    placeholder="Birthday"
                                                />
                                                <InputError
                                                    message={errors.birthday}
                                                    className="mt-2"
                                                />
                                            </dd>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Role
                                            </dt>
                                            <dd className="text-gray-700 sm:col-span-2">
                                                <select
                                                    onChange={(e) =>
                                                        setData(
                                                            "role",
                                                            e.target.value
                                                        )
                                                    }
                                                    value={data.role}
                                                    name="role"
                                                    className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    <option disabled>
                                                        Pick role
                                                    </option>
                                                    <option value="0">
                                                        Member
                                                    </option>
                                                    <option value="1">
                                                        Leader
                                                    </option>
                                                    <option value="99">
                                                        Admin
                                                    </option>
                                                </select>
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Role Code
                                            </dt>
                                            <dd className="text-gray-700 sm:col-span-2">
                                                <select
                                                    onChange={(e) =>
                                                        setData(
                                                            "role_code",
                                                            e.target.value
                                                        )
                                                    }
                                                    value={data.role_code}
                                                    name="role_code"
                                                    className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    <option disabled>
                                                        Pick role
                                                    </option>
                                                    <option value="user">
                                                        Member
                                                    </option>
                                                    <option value="hr">
                                                        HR
                                                    </option>
                                                    <option value="qltt">
                                                        Leader
                                                    </option>
                                                    <option value="ceo">
                                                        CEO
                                                    </option>
                                                </select>
                                            </dd>
                                        </div>
                                        {user.role == 1 || user.role == 99 ? (
                                            <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                                <dt className="font-medium text-gray-900">
                                                    Team Member
                                                </dt>
                                                <dd className="text-gray-700 sm:col-span-2"></dd>
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Password reset
                                            </dt>
                                            <dd className="text-gray-700 sm:col-span-2">
                                                <TextInput
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) =>
                                                        setData(
                                                            "password",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1 block w-3/4"
                                                    isFocused
                                                    placeholder="Password"
                                                />
                                                <InputError
                                                    message={errors.password}
                                                    className="mt-2"
                                                />
                                            </dd>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4">
                                            <dt className="font-medium text-gray-900">
                                                Direct Manager
                                            </dt>
                                            <dd className="text-gray-700 sm:col-span-2">
                                                <select
                                                    value={data.direct_manager}
                                                    onChange={(e) =>
                                                        setData(
                                                            "direct_manager",
                                                            e.target.value
                                                        )
                                                    }
                                                    name="direct_manager"
                                                    className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    <option disabled>
                                                        Pick Direct Manager
                                                    </option>
                                                    <option value="0">
                                                        None
                                                    </option>
                                                    {allLeaderAdmin.map(
                                                        (leader_admin) => (
                                                            <option
                                                                key={
                                                                    leader_admin.id
                                                                }
                                                                value={
                                                                    leader_admin.id
                                                                }
                                                            >
                                                                {
                                                                    leader_admin.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
