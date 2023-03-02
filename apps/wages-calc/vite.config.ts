import solid from 'solid-start/vite';
import devtools from 'solid-devtools/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		devtools({
			/* additional options */
			autoname: true, // e.g. enable autoname
		}),
		solid(),
	],
});
