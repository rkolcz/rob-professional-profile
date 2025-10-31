/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: 'tw-',
	important: false,
	content: [
		"./**/*.{html,js}",
		"!./node_modules/**",
	],
	theme: {
		extend: {
			colors: {
				primary: '#fff',
				secondary: "#f7f7f5",
				hoverColor: "#efefed",
				textColor: "#1F2123"
			}
		},
	},
	plugins: [],
}

