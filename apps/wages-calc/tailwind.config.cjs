const createPlugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [
		createPlugin(({ addUtilities }) => {
			addUtilities({
				'.backface': {
					transform: 'rotateY(180deg)',
				},
				'.backface-visible': {
					'backface-visibility': 'visible',
				},
				'.backface-hidden': {
					'backface-visibility': 'hidden',
				},
				'.flipped': {
					transform: 'rotateY(180deg)',
					'&.backface': {
						transform: 'rotateY(360deg)',
					},
				},
			});
		}),
	],
};
