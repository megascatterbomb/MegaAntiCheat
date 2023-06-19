/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        darkTheme: "dark",
        themes: ["light", "dark"],
        base: true,
        styled: true,
        utils: true,
        rtl: false,
        prefix: "",
        logs: false,
    },
};
