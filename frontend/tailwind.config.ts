import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mzansi: {
                    dark: "#1c1c1c", /* PTechSolutions Dark */
                    muted: "#8c8c8c", /* PTechSolutions Grey/Text */
                    light: "#f2f2f2", /* PTechSolutions Light Background */
                    orange: "#ff9800", /* PTechSolutions Accent */
                    red: "#e68a00"
                }
            }
        },
    },
    plugins: [],
};
export default config;
