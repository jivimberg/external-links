import { terser } from "rollup-plugin-terser";

export default {
	input: 'src/main.js',
	output: {
		file: 'main.js',
		format: 'cjs',
	},
	plugins: [terser()],
};
