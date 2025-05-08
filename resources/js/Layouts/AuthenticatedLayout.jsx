import { useEffect, useState } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";
import PushNotification from "@/Components/PushNotification";
import axios from "axios";
import { onValue, ref } from "firebase/database";
import { database } from "@/Firebase/firebase";

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [numberNotification, setNumberNotification] = useState(0);
    const [isShowNotifaction, setIsShowNotification] = useState(false);
    const [dataRequest, setDataRequest] = useState({});
    const [dataNotificationCmt, setDataNotificationCmt] = useState(null);

    let arrayDataRequest = [];
    const handleShowNotification = () => {
        setIsShowNotification((prev) => !prev);
    };
    const calculateNotificationCount = (data, comments) => {
        let count = 0;
        Object.values(data || {}).forEach((obj) => {
            if (
                (obj?.receive?.statusRead === 0 && obj?.receive?.name) ||
                (obj?.send?.statusRead === 0 && obj?.send?.name)
            ) {
                count++;
            }
        });
        comments.forEach((comment) => {
            if (comment.statusRead === 0) {
                count++;
            }
        });

        return count;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const outsideElement = document.getElementById("notifiaction");
            if (outsideElement && !outsideElement.contains(event.target)) {
                setIsShowNotification(false);
            }
        };

        const fetchNotifications = () => {
            const notificationRef = ref(
                database,
                `notification/user/${user.id}`
            );
            const commentRef = ref(database, `comments/IdUser/${user.id}`);

            onValue(notificationRef, (snapshot) => {
                const notificationData = snapshot.val();
                setDataRequest(notificationData);

                onValue(commentRef, (commentSnapshot) => {
                    const commentData = commentSnapshot.val();
                    const comments = commentData
                        ? Object.values(commentData).flatMap(Object.values)
                        : [];
                    setDataNotificationCmt(comments);
                    const totalNotifications = calculateNotificationCount(
                        notificationData,
                        comments
                    );
                    setNumberNotification(totalNotifications);
                });
            });
        };

        fetchNotifications();
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    if (dataRequest) {
        arrayDataRequest = Object.entries(dataRequest).map(([key, value]) => ({
            key,
            value,
        }));
    }
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                >
                                    Trang chủ
                                </NavLink>
                            </div>
                            {(user.role === "99" || user.role === "1") && (
                                <>
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        <NavLink
                                            href={route(
                                                "List-Approved-Request"
                                            )}
                                            active={route().current(
                                                "List-Approved-Request"
                                            )}
                                        >
                                            Danh sách request đã duyệt
                                        </NavLink>
                                    </div>
                                </>
                            )}
                            {user.role === "99" && (
                                <>
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        <NavLink
                                            href={route("Users")}
                                            active={route().current("Users")}
                                        >
                                            Quản lý người dùng
                                        </NavLink>
                                    </div>

                                    <div className="hidden sm:flex sm:items-center sm:ms-6">
                                        <div className="ms-3 relative">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                                        >
                                                            Quản lý Request
                                                            <svg
                                                                className="ms-2 -me-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content>
                                                    <Dropdown.Link
                                                        href={route(
                                                            "Request_templates"
                                                        )}
                                                    >
                                                        Template
                                                    </Dropdown.Link>
                                                    <Dropdown.Link
                                                        href={route(
                                                            "Request_list"
                                                        )}
                                                    >
                                                        Request List
                                                    </Dropdown.Link>
                                                    <Dropdown.Link
                                                        href={route(
                                                            "Export-User-Requests"
                                                        )}
                                                    >
                                                        Export Data
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        <NavLink
                                            href={route("Departments")}
                                            active={route().current(
                                                "Departments"
                                            )}
                                        >
                                            Quản lý phòng ban
                                        </NavLink>
                                    </div>
                                </>
                            )}
                            <div className="hidden sm:flex sm:items-center sm:ms-6">
                                {user.role == "99" ? (
                                    <div className="ms-3 relative">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                                                        Quản lý dự án
                                                        <svg
                                                            className="ms-2 -me-0.5 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content>
                                                <Dropdown.Link
                                                    href={route("Project")}
                                                >
                                                    Danh sách dự án
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route(
                                                        "Project_admin"
                                                    )}
                                                >
                                                    Admin
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                ) : (
                                    <NavLink
                                        href={route("Project")}
                                        active={route().current("Project")}
                                    >
                                        {`${
                                            user.role === "1"
                                                ? `Quản lý dự án`
                                                : `Danh sách công việc`
                                        }`}
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6 relative">
                            <div className="ms-3 relative" id="notifiaction">
                                <i
                                    onClick={handleShowNotification}
                                    className={`fa-solid fa-bell cursor-pointer text-2xl ${
                                        numberNotification > 0 ? "shake" : ""
                                    }`}
                                ></i>
                                <p className="absolute top-[-10px] right-[-10px] text-red-500 text-[13px] font-bold cursor-pointer">
                                    {numberNotification > 5
                                        ? "5+"
                                        : numberNotification}
                                </p>

                                {isShowNotifaction && (
                                    <PushNotification
                                        data={arrayDataRequest}
                                        user={user}
                                        dataCmt={dataNotificationCmt}
                                    />
                                )}
                            </div>
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">
                                {user.name}
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-8xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
