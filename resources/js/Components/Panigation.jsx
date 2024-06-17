import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ data }) {
    if (!data) return null;
    const [queryParams, setQueryParams] = useState({});

    const extractQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        const paramsObject = {};
        for (const [key, value] of params.entries()) {
            paramsObject[key] = value;
        }
        setQueryParams(paramsObject);
    };
    const buildQueryString = (paramsObject) => {
        const urlParams = new URLSearchParams();
        for (const [key, value] of Object.entries(paramsObject)) {
            if (key !== "page" && value !== "") {
                urlParams.append(key, value);
            }
        }
        return urlParams.toString();
    };
    const buildLink = (url, label, additionalClassName = "") => {
        const fullUrl = url ? `${url}&${buildQueryString(queryParams)}` : "#";
        return (
            <Link
                href={fullUrl}
                className={`relative inline-flex items-center border border-gray-300  px-4 py-2 text-sm font-medium text-gray-700 ${
                    url ? `${additionalClassName}` : "cursor-not-allowed"
                }`}
                dangerouslySetInnerHTML={{ __html: label }}
            />
        );
    };
    useEffect(() => {
        extractQueryParams();
    }, []);

    const getPaginationGroup = () => {
        const { current_page, last_page } = data;
        if (last_page <= 5) {
            return [...Array(last_page).keys()].map((x) => x + 1);
        } else {
            if (current_page <= 3) {
                return [1, 2, 3, 4, "...", last_page];
            } else if (current_page > last_page - 3) {
                return [
                    1,
                    "...",
                    last_page - 3,
                    last_page - 2,
                    last_page - 1,
                    last_page,
                ];
            } else {
                return [
                    1,
                    "...",
                    current_page - 1,
                    current_page,
                    current_page + 1,
                    "...",
                    last_page,
                ];
            }
        }
    };

    const renderPageLinks = () => {
        const { links } = data;
        return getPaginationGroup().map((page, index) => {
            if (page === "...") {
                return (
                    <span
                        key={index}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                    >
                        ...
                    </span>
                );
            }

            const link = links.find((link) => parseInt(link.label) === page);
            if (!link) return null;

            return buildLink(
                `${window.location.pathname}?page=${link.label}`,
                link.label,
                link.active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            );
        });
    };

    const { prev_page_url, next_page_url } = data;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 pt-7">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end">
                <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                >
                    {buildLink(prev_page_url, "&laquo; Previous")}
                    {renderPageLinks()}
                    {buildLink(
                        next_page_url,
                        "Next &raquo;",
                        "hover:bg-gray-50"
                    )}
                </nav>
            </div>
        </div>
    );
}
