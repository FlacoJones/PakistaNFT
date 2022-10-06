/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    // fontFamily: {
    //   sans: ['Helvetica', 'Arial', 'sans-serif'],
    // },
    // extend: {
    //   textColor: {
    //     default: '#2c3e50',
    //     link: '#42b983',
    //     code: '#304455',
    //   },
    //   backgroundColor: {
    //     code: '#000',
    //   },
    // },
  },
  plugins: [require('flowbite/plugin')],
}
