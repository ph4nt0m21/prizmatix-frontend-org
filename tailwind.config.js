/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                accent: '#9f20ff',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Onest', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
