/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                ink: '#151412',
                mustard: { DEFAULT: '#F5B921', deep: '#D99A00' },
                cream: { DEFAULT: '#F7F0E0', deep: '#EDE2C8' },
                ember: '#E4572E',
            },
            fontFamily: {
                display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
                serif: ['Fraunces', 'Georgia', 'serif'],
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}