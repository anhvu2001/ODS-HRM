import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                serif: [
                    "Merriweather",
                    "Roboto",
                    ...defaultTheme.fontFamily.serif,
                ],
            },
            maxWidth: {
                "8xl": "1440px", // Thêm lớp max-w-8xl với giá trị 1440px
            },
        },
    },

    plugins: [forms],
};
